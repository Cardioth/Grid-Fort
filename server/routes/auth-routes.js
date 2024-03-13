const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const redisClient = require('../db/redis');
const gameConfig = require('../data/config');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: 'Too many login attempts. Please try again later.',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 registration attempts per window
  message: 'Too many registration attempts. Please try again later.',
});

// Register route
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const username = req.body.username.toLowerCase();

    // Check if user already exists
    const userExists = await redisClient.exists(`user:${username}`);
    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Check if any invalid characters in username
    if (!username.match(/^[A-Za-z]+$/)) {
      return res.status(400).json({ message: "Username can only contain letters" });
    }

    // Must be at least 3 characters long
    if (username.length < 3) {
      return res.status(400).json({ message: "Username is too short" });
    }

    // Create user object
    const newUser = { 
      username, 
      password: hashedPassword,
      uniCredits: gameConfig.registrationCredits,
      wallet: 'unlinked',
    };

    // Store the user data in Redis
    await redisClient.hSet(`user:${username}`, newUser);

    // Add user to the set of all users
    await redisClient.sAdd('users', username);

    // Log the user in
    req.login(newUser, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Failed to log in user", error: err.message });
      }

      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to save session", error: err.message });
        }

        res.status(201).json({ message: "User registered and logged in successfully", uniCredits: newUser.uniCredits });
      });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ message: "Failed to register user", error: error.message });
  }
});


// Login route
router.post('/login', loginLimiter, (req, res, next) => {
  if (req.body.username) {
    req.body.username = req.body.username.toLowerCase();
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.save(err => {
        if (err) {
          return next(err);
        }
        return res.json({ message: "Login successful", uniCredits: user.uniCredits });
      });
    });
  })(req, res, next);
});


// Logout route
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { 
      return res.status(500).json({ message: "Error logging out" });
    }
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: "Error destroying session" });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ message: "Logged out successfully" });
    });
  });
});


// Check Auth
router.get('/checkAuth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ auth: true, username: req.user.username, uniCredits: req.user.uniCredits});
  } else {
    res.json({ auth: false });
  }
});


module.exports = router;
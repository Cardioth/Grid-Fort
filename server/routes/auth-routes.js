const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const redisClient = require('../db/redis');
const gameConfig = require('../data/config');

// Register route
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const username = req.body.username;

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
    };

    // Store the user data in Redis
    await redisClient.hSet(`user:${username}`, newUser);

    // Add user to the set of all users
    await redisClient.sAdd('users', username);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ message: "Failed to register user", error: error.message });
  }
});


// Login route
router.post('/login', (req, res, next) => {
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
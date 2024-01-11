const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const redisClient = require('../db/redis');

//const User = require('./models/User'); 

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

    // Create user object
    const newUser = { username, password: hashedPassword };

    // Store the user data in Redis
    await redisClient.hSet(`user:${username}`, newUser);

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

      // Explicitly save the session before sending the response
      req.session.save(err => {
        if (err) {
          return next(err);
        }

        console.log("Session after save:", req.session); // Log session after save

        return res.json({ message: "Login successful" });
      });
    });
  })(req, res, next);
});



// Check Auth
router.get('/checkAuth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ auth: true, username: req.user.username });
  } else {
    res.json({ auth: false });
  }
});


module.exports = router;
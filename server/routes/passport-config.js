const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const redisClient = require('../db/redis'); // Import Redis client

function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    try {
      const user = await redisClient.hGetAll(`user:${username}`);
      if (Object.keys(user).length === 0) {
        return done(null, false, { message: 'No user with that username' });
      }

      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
  
  passport.serializeUser((user, done) => done(null, user.username));
  passport.deserializeUser(async (username, done) => {
    try {
      const user = await redisClient.hGetAll(`user:${username}`);
      if (Object.keys(user).length === 0) {
        return done(null, false); // User not found
      }
      return done(null, user); // User found
    } catch (error) {
      return done(error, null);
    }
  });
  
}


module.exports = initialize;

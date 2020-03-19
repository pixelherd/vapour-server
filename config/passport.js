const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const keys = require('../config/keys');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({ email: email })
        .then( user => {
          if(!user) {
            return done(null, false, { message: 'This email has not been recognised'});
          }
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {message: 'Incorrect password'});
            }
          });
        })
        .catch(err=> console.log(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}

exports.jwt_passport = () => {}

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(new JwtStrategy(options, (jwt_payload, done) => {
    // This payload includes the items we specified earlier
    User.findById(jwt_payload.id)
    .then(user => {
      if (user) {
        // return the user to the frontend
        return done(null, user);
      }
      // return false since there is no user
      return done(null, false);
    })
    .catch(err => console.log(err));
  }));
};
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const cors = require('cors');

//Login Page
router.get('/login', (req, res) => res.render('login'))

//Register Page
router.get('/register', (req, res) => res.render('register'))

//Register Handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //Field checks
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) { 
    res.status(400).json({errors: errors});
  } else {
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          errors.push({ msg: 'Email is already registered' })
          res.status(400).json({email: 'Email is already registered'})
        } else {
          const newUser = new User({
            name, email, password
          });

          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  const payload = { id: user.id, name: user.name };

              jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token
                });
              });
                })
                .catch(err => res.send(err))
            }))
        }
      });
  }
})


//Login

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/current',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Successfully logged out');
  res.redirect('login');
});
module.exports = router;

// login with json webtoken 
router.post('/api/login', cors(), (req, res) => {
  let errors = {};
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "This user does not exist";
      return res.status(400).json(errors);
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = { id: user.id, email: user.email };

        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        errors.password = "Incorrect password";
        return res.status(400).json(errors);
      }
    });
  });
});

// Private auth route: get current user 
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
})
const User = require('../models/User');
const Message = require('../models/Message');
const bcrypt = require('bcryptjs');
const passport = require('passport');

module.exports = {
  greet: (req, res) => {
    res.render('login');
  },
  getRegister: (req, res) => {
    res.render('register');
  },
  findById: async (req, res) => {
    const { from, to } = req.query;

    const user = await User.findById(from);
    const { messages } = user;
    const { name } = user;
    const history = messages.get(to);
    const { roomId } = history;

    const messageHistory = await Message.find({
      _id: { $in: history['messageHistory'] }
    });

    res.send({ name, messageHistory, roomId });
  },
  postRegister: (req, res) => {
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
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    } else {
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: 'Email is already registered' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            password,
            messages: {}
          });

          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'Successfully registered. Please log in'
                  );
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            })
          );
        }
      });
    }
  },
  login: (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  },
  logout: (req, res) => {
    req.logout();
    req.flash('success_msg', 'Successfully logged out');
    res.redirect('login');
  }
};

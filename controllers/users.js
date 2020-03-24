const User = require("../models/User");
const Message = require("../models/Message");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const keys = require("../config/keys");
const uniqueString = require("unique-string");

module.exports = {
  findUserById: async (req, res) => {
    const { _id } = req.query;
    const user = await User.findById(_id, "_id name messages");
    user ? res.status(200).send(user) : res.status(500);
  },
  findById: async (req, res) => {
    const { from, to } = req.query;
    const user = await User.findById(from);
    const { messages } = user;
    const { name } = user;
    let messageHistory, roomId;
    const history = messages.get(to);
    if (history && history.roomId) {
      ({ roomId } = history);
      messageHistory = await Message.find({
        _id: { $in: history["messageHistory"] }
      });
      res.status(200).send({ name, messageHistory, roomId });
    } else {
      ({ messageHistory, roomId } = await newThread(from, to));
      res.status(200).send({ name, messageHistory, roomId });
    }
  },
  updateCurrent: async (req, res) => {
    const { _id } = req.query;
    const user = await User.findOneAndUpdate({ _id }, req.body, { new: true });
    user ? res.status(200).send(user) : res.status(500);
  },
  findAll: async (req, res) => {
    const users = await User.find(
      {},
      "_id name messages avatar",
      (err, data) => {
        if (err) {
          return;
        } else return data;
      }
    );

    if (users) {
      res.status(200).send(users);
    } else {
      res.status(500);
    }
  },
  postRegister: (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //Field checks
    if (!name || !email || !password || !password2) {
      errors.push({ msg: "Please fill in all fields" });
    }
    if (password !== password2) {
      errors.push({ msg: "Passwords do not match" });
    }
    if (password.length < 6) {
      errors.push({ msg: "Password should be at least 6 characters" });
    }

    if (errors.length > 0) {
      res.send({ error: errors });
    } else {
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: "Email is already registered" });
          res.send({ error: errors });
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
                  User.find().then(users =>
                    users.forEach(user =>
                      newThread(newUser._id.toString(), user._id.toString())
                    )
                  );
                  return user;
                })
                .then(user => {
                  res.send({
                    success:
                      "Successfully registered. Please log in. Redirecting now..."
                  });
                })
                .catch(err => console.log(err));
            })
          );
        }
      });
    }
  },

  login: (req, res, next) => {
    passport.authenticate("local", function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.json(info);
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.json({ user: user });
      });
    })(req, res, next);
  },
  logout: (req, res) => {
    console.log("logging out");
    req.logOut();
    res.redirect("/users/");
  },
  session: (req, res) => {
    if (req.user) {
      res.send({ user: req.user });
    } else res.send({ Auth: false });
  }
};

async function newThread(senderId, recipientId) {
  const recipient = await User.findById(recipientId);
  const sender = await User.findById(senderId);
  const uniqStr = uniqueString();
  const history = {
    roomId: uniqStr,
    messageHistory: []
  };
  recipient.messages.set(senderId, history);
  sender.messages.set(recipientId, history);

  try {
    recipient.save();
    sender.save();
  } catch {
    console.log(err);
  } finally {
    return { recipient, sender };
  }
}

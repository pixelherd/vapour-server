const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();
const passport = require('passport');
const path = require('path')

// Passport config
require('./config/passport')(passport);


// DB Config
const db = require('./config/keys').MongoURI;

//Connect to Mongo
mongoose.connect(db, {useNewUrlParser: true})
.then(()=> console.log('MongoDB Connected...'))
.catch(e => console.log(e));

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')))

//Bodyparser
app.use(express.urlencoded({ extended: false}));

//Express Session
app.use(session({
  secret: 'mysecret',
  resave: true,
  saveUninitialized: true
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
})

//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

const PORT = process.env.PORT || 4000;


app.listen(PORT, console.log(`Server started on port ${PORT}`))
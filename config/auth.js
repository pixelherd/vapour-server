module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if(req.isAuthenticated()) {
      console.log(req.isAuthenticated())
      return next();
    }
    req.flash('error_msg', 'Please ensure you are logged in');
    res.redirect('/users/login');
  }
}
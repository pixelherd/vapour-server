module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please ensure you are logged in');
    res.redirect('/users/login');
  }
}
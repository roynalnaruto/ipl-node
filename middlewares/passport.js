var LocalStrategy = require('passport-local').Strategy;
var db = require('../db');
var User = require('../models/user');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.username);
  });

  passport.deserializeUser(function(username, done) {
    var collection = db.get().collection('users');
    collection.find({'username': username}).toArray(function(err, users) {
      done(err, users[0]);
    });
  });

  passport.use('local-login', new LocalStrategy({
    passReqToCallback: true
  }, function(req, username, password, done) {
    var collection = db.get().collection('users');
    User.getUserByUsername(username, function(err, user) {
      if (err) {
        return done(err);
      }
      if (user) {
        if (user.password !== password) {
          return done(null, false, req.flash('loginMessage', 'Wrong username or password'));
        }
        return done(null, user);
      } else {
        return done(null, false, req.flash('loginMessage', 'Wrong username or password'));
      }
    });
  }));

  passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true
  }, function(req, username, password, done) {
    if (password !== req.body.reEnterPassword) {
      return done(null, false, req.flash('signUpMessage', 'Passwords did not match'));
    }
    var collection = db.get().collection('users');
    User.getUserByUsername(username, function(err, user) {
      if (err) {
        return done(err);
      }
      if (user) {
        return done(null, false, req.flash('signUpMessage', 'Username exists'));
      } else {
        User.getUserByEmail(req.body.email, function(err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, false, req.flash('signUpMessage', 'Email ID exists'));
          } else {
            var newUser = {
              'username': username,
              'email': req.body.email,
              'password': password,
              'name': req.body.name
            };
            User.addNew(newUser);
            return done(null, newUser);
          }
        });
      }
    });
  }));
};

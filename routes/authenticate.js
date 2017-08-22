var fs = require('fs');
var mongodb = require('mongodb');
var User = require('../models/user');

module.exports = function(app, passport) {

  var multer = require('multer');
  var uploadSingle = multer({
    dest: './uploads/',
  }).single('profilePhoto');

  app.get('/', function(req, res) {
    res.render('login.ejs', { message: [] });
  });

  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
  }));

  app.get('/signup', function(req, res) {
    res.render('signup.ejs', { message: req.flash('signUpMessage') });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/uploadPhoto',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  app.get('/uploadPhoto', isLoggedIn, function(req, res) {
    res.render('uploadPhoto.ejs', {
      user: req.user
    });
  });

  app.post('/uploadPhoto', uploadSingle, function(req, res) {
    var image = req.file;
    fs.exists(image.path, function(exists) {
      if (exists) {
        fs.readFile(image.path, function(err, imageData) {
          if (err) {
            res.end('Error reading file');
          } else {
            var imageBson = {};
            imageBson.image = new mongodb.Binary(imageData);
            imageBson.imageType = image.mimetype;
            User.updateProfilePicture(req.user.username, imageBson);
            res.redirect('/home');
          }
        });
      } else {
        res.end('Cannot upload file');
      }
    });
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/home', isLoggedIn, function(req, res) {
    res.render('home.ejs', {
      user: req.user
    });
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

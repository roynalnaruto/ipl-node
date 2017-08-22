var db = require('../db');

exports.addNew = function(user) {
  var collection = db.get().collection('users');

  collection.insert(user);
};

exports.updateProfilePicture = function(username, image) {
  var collection = db.get().collection('users');

  collection.update({ 'username': username }, {$set: {
    'photo': image
  }});
};

exports.getProfilePicture = function(username, callback) {
  var collection = db.get().collection('users');

  collection.find({ 'username': username }).toArray(function(err, users) {
    callback(err, users[0].photo);
  });
};

exports.getUserByUsername = function(username, callback) {
  var collection = db.get().collection('users');

  collection.find({'username': username}).toArray(function(err, users) {
    callback(err, users[0]);
  });
};

exports.getUserByEmail = function(email, callback) {
  var collection = db.get().collection('users');

  collection.find({'email': email}).toArray(function(err, users) {
    callback(err, users[0]);
  });
};

var db = require('../db');

exports.getRandom = function(callback) {
  var collection = db.get().collection('players');

  var max, random;
  collection.count({'status': 'free'}).then(function(number) {
    random = Math.floor(Math.random() * number);
    collection.find({'status': 'free'}).limit(-1).skip(random).next().then(function(player) {
      callback(player);
    });
  });
};

exports.updateStatus = function(playerName) {
  console.log(playerName);
  var collection = db.get().collection('players');

  collection.update({'name': playerName}, {$set: {
    'status': 'done'
  }});
};

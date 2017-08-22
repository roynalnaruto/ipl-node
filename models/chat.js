var db = require('../db');

exports.addNew = function(msg) {
  var collection = db.get().collection('chat');

  collection.insert(msg);
};

exports.getAllByTime = function(callback) {
  var collection = db.get().collection('chat');

  collection.find({ $query: {}, $orderby: { time: 1 } }).toArray(function(err, msgs) {
    callback(err, msgs);
  });
};

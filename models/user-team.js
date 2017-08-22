var db = require('../db');

exports.updateTeam = function(bid, callback) {
  var collection = db.get().collection('userTeam');

  collection.findOne({'user': bid.bidder}).then(function(document) {
    document.team.push({
      'player': bid.player.name,
      'amount': bid.amount
    });
    collection.update({'user': bid.bidder}, document);
    var totalAmount = 0;
    document.team.forEach(function(member) {
      totalAmount += parseInt(member.amount);
    });
    callback(document.team.length, totalAmount);
  });
};

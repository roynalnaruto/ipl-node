var Player = require('../models/players');
var UserTeam = require('../models/user-team');
var timerStarted = false;
var interval, countdown, notInterested, currentPlayer, currentBidder, currentBidAmount;
countdown = 30;
currentPlayer = undefined;
notInterested = [];
var online = [];
var MAX_TEAM_SIZE = 2;
var TOTAL_AMOUNT = 100;
var BASE_AMOUNT = 10;

var Bidding = function(app, socket, io) {
  this.app = app;
  this.socket = socket;
  this.io = io;
  this.handler = {
    actionBid: bid.bind(this),
    actionReject: reject.bind(this),
    actionPause: pause.bind(this),
    actionResume: resume.bind(this),
    startBidding: startBidding.bind(this)
  };

  this.startTimer = function() {
    timerStarted = true;
    var __self = this;
    var minutes, seconds, time;
    interval = setInterval(function() {
      minutes = parseInt(countdown / 60, 10);
      seconds = parseInt(countdown % 60, 10);

      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      time = minutes + ' : ' + seconds;
      __self.io.sockets.emit('countdown', time);

      if (--countdown < 0) {
        clearInterval(interval);
        timerStarted = false;
        __self.io.sockets.emit('timer-finish');
        __self.end();
      }
    }, 1000);
  };

  this.newPlayer = function() {
    var __self = this;
    Player.getRandom(function(player) {
      currentPlayer = player;
      __self.io.sockets.emit('new-player', currentPlayer);
      __self.startTimer();
    });
  };

  this.end = function() {
    if (interval) {
      clearInterval(interval);
      interval = undefined;
      countdown = 30;
    }
    if (currentBidder) {
      var summary = {
        'bidder': currentBidder.username,
        'player': currentPlayer,
        'amount': currentBidAmount
      };
      Player.updateStatus(currentPlayer.name);
      var __self = this;
      UserTeam.updateTeam(summary, function(teamSize, amount) {
        console.log(amount);
        if (teamSize === MAX_TEAM_SIZE) {
          __self.io.to(currentBidder.id).emit('team-complete');
        }
        var maxAmount = TOTAL_AMOUNT - amount - (MAX_TEAM_SIZE - teamSize - 1)*BASE_AMOUNT;
        __self.io.to(currentBidder.id).emit('player-bought', maxAmount);
        currentPlayer = undefined;
        currentBidder = undefined;
        currentBidAmount = undefined;
        notInterested = [];
        __self.io.sockets.emit('end-bid', summary);
        __self.newPlayer();
      });
    } else {
      Player.updateStatus(currentPlayer.name);
      this.io.sockets.emit('end-bid', {'player': currentPlayer});
      this.newPlayer();
    }
  };
};

function startBidding() {
  online.push(this.socket.request.user.username);
  if (online.length === 2) {
    this.newPlayer();
  }
}

function bid(bidAmount) {
  currentBidder = this.socket.request.user;
  currentBidder.id = this.socket.id;
  currentBidAmount = bidAmount;
  var bid = {
    'bidder': currentBidder,
    'amount': currentBidAmount
  };
  countdown = 30;
  if (!timerStarted) {
    this.io.sockets.emit('action-resume');
    this.startTimer();
  }
  this.socket.broadcast.emit('action-bid', bid);
  this.socket.emit('action-bid-self', bid);
}

function reject() {
  notInterested.push(this.socket.request.user.username);
  if (this.io.sockets.length === notInterested.length) {
    this.io.sockets.emit('action-reject-all');
    this.end();
  } else if (currentBidder !== undefined && (this.io.sockets.length === (notInterested.length + 1))) {
    this.end();
  } else {
    console.log(this.socket.request.user.username + ' not interested');
    this.socket.broadcast.emit('action-reject', this.socket.request.user.username);
    this.socket.emit('action-reject-self');
  }
}

function pause() {
  clearInterval(interval);
  timerStarted = false;
  this.socket.broadcast.emit('action-pause', this.socket.request.user.username);
  this.socket.emit('action-pause-self');
}

function resume() {
  this.io.sockets.emit('action-resume');
  this.startTimer();
}

module.exports = Bidding;

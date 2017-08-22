var ChatModel = require('../models/chat');

var Chat = function(app, socket, io) {
  this.app = app;
  this.socket = socket;
  this.io = io;
  this.handler = {
    chatMessage: message.bind(this),
    fetchChatMessages: fetchChatMessages.bind(this),
    statusUpdate: statusUpdate.bind(this)
  };
};

function message(msg) {
  msg.username = this.socket.request.user.username;
  ChatModel.addNew(msg);
  this.socket.emit('chat-message-self', msg);
  this.socket.broadcast.emit('chat-message', msg);
}

function fetchChatMessages() {
  var __self = this;
  ChatModel.getAllByTime(function(err, msgs) {
    if (err) {
      return;
    }
    msgs.forEach(function(msg) {
      if (msg.username === __self.socket.request.user.username) {
        msg.username = undefined;
      }
    });
    __self.socket.emit('fetched-chat-messages', msgs);
  });
}

function statusUpdate() {
  var status = this.socket.request.user.username + ' is typing...';
  this.socket.broadcast.emit('status-update', status);
}

module.exports = Chat;

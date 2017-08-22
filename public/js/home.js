var socket = io.connect();

socket.emit('fetchChatMessages');

socket.on('fetched-chat-messages', function(msgs) {
  msgs.forEach(function(msg) {
    if (msg.username) {
      decorateChatMessage(msg);
    } else {
      decorateChatMessageSelf(msg);
    }
  });
});

socket.on('chat-message', function(msg) {
  decorateChatMessage(msg);
});

socket.on('chat-message-self', function(msg) {
  decorateChatMessageSelf(msg);
});

socket.on('status-update', function(status) {
  statusUpdate(status);
});

var $chatInput = document.getElementById('chat-input');
var defaultStatus = $('#chat-status').text();
var currentStatus = defaultStatus;

$.getScript('js/bidding.js', function() {
  console.log('got bidding.js file');
});

$('[data-rangeslider]').rangeslider({
  polyfill: false,
  onInit: function() {
    $('#bid-amount').text('$' + $('[data-rangeslider]').val());
  },
  onSlide: function(position, value) {
    $('#bid-amount').text('$' + value);
  },
  onSlideEnd: function(position, value) {
    $('#bid-amount').text('$' + value);
  }
});

$('#chat-input').keydown(function(event) {
  if (event.which === 13) {
    var text = $chatInput.innerText.trim();
    if (text && text !== '') {
      var dt = new Date();
      var time = dt.getTime();
      var msg = {
        'text': text,
        'time': time
      };
      socket.emit('chatMessage', msg);
    }
    $chatInput.innerText = '';
  } else {
    socket.emit('statusUpdate');
  }
});

function decorateChatMessage(msg) {
  var $message = $('<div>');
  $message.addClass('message');

  var $messageHeader = $('<div>');
  $messageHeader.addClass('message-header');
  var $messageHeaderUsername = $('<span>');
  $messageHeaderUsername.addClass('message-header-username');
  $messageHeaderUsername.text(msg.username);

  var $messageContainer = $('<div>');
  $messageContainer.addClass('message-container');
  var $messageContainerContent = $('<span>');
  $messageContainerContent.addClass('message-container-content');
  $messageContainerContent.text(msg.text);
  var $messageContainerContentTime = $('<span>');
  $messageContainerContentTime.addClass('message-container-content-time');
  var time = new Date(msg.time);
  $messageContainerContentTime.text(time.toString('hh:mm tt'));

  $messageContainerContent.append($messageContainerContentTime);
  $messageContainer.append($messageContainerContent);
  $messageHeader.append($messageHeaderUsername);
  $message.append($messageHeader);
  $message.append($messageContainer);
  $('#chat-chatbox').append($message);
  $('#chat-chatbox').scrollTop($('#chat-chatbox')[0].scrollHeight);
}

function decorateChatMessageSelf(msg) {
  var $message = $('<div>');
  $message.addClass('message-self');

  var $messageContainer = $('<div>');
  $messageContainer.addClass('message-self-container');
  var $messageContainerContent = $('<span>');
  $messageContainerContent.addClass('message-self-container-content');
  $messageContainerContent.text(msg.text);
  var $messageContainerContentTime = $('<span>');
  $messageContainerContentTime.addClass('message-self-container-content-time');
  var time = new Date(msg.time);
  $messageContainerContentTime.text(time.toString('hh:mm tt'));

  $messageContainerContent.append($messageContainerContentTime);
  $messageContainer.append($messageContainerContent);
  $message.append($messageContainer);
  $('#chat-chatbox').append($message);
  $('#chat-chatbox').scrollTop($('#chat-chatbox')[0].scrollHeight);
}

function statusUpdate(status) {
  if (status === currentStatus) {
    return;
  }
  $('#chat-status').text(status);
  currentStatus = status;
  if (status !== defaultStatus) {
    var delay = setTimeout(function() {
      statusUpdate(defaultStatus);
      clearInterval(delay);
    }, 3000);
  }
}

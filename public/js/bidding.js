var isPaused = false;
var $bidAmount = $('[data-rangeslider]');

socket.on('action-bid', function(bid) {
  convertLastBidToRecentBid();
  decorateBid(bid);
  $bidAmount.attr('min', parseInt(bid.amount) + 10);
  $bidAmount.val(parseInt(bid.amount) + 10).change();
  $bidAmount.rangeslider('update', true);
  console.log(bid);
  $('#action-reject').prop('disabled', false);
});

socket.on('action-bid', function(bid) {
  convertLastBidToRecentBid();
  decorateBid(bid);
  $bidAmount.attr('min', parseInt(bid.amount) + 10);
  $bidAmount.val(parseInt(bid.amount) + 10).change();
  $bidAmount.rangeslider('update', true);
  console.log(bid);
  $('#action-reject').prop('disabled', true);
});

socket.on('action-reject-self', function() {
  $('#action-pause').prop('disabled', true);
  $('#action-reject').prop('disabled', true);
  $('#action-bid').prop('disabled', true);
});

socket.on('action-reject', function(username) {
  console.log(username + ' is not interested');
});

socket.on('action-reject-all', function() {
  console.log('Nobody interested, this player will go unsold');
});

socket.on('timer-finish', function() {

});

socket.on('action-pause', function(username) {
  isPaused = true;
  $('#action-pause').text('Paused');
  $('#action-pause').prop('disabled', true);
  console.log(username + ' has paused the bidding');
});

socket.on('action-pause-self', function() {
  isPaused = true;
  $('#action-pause').text('Resume');
  $('#action-reject').prop('disabled', true);
  $('#action-bid').prop('disabled', true);
  console.log('I have paused the bidding');
});

socket.on('action-resume', function() {
  isPaused = false;
  $('#action-pause').text('Pause');
  $('#action-pause').prop('disabled', false);
  $('#action-reject').prop('disabled', false);
  $('#action-bid').prop('disabled', false);
});

socket.on('end-bid', function(summary) {
  if (summary.bidder !== undefined) {
    decorateBidHistory(summary);
    console.log(summary);
    // update the user-player tree
  } else {
    decorateBidHistory(summary);
    console.log('Player unsold');
  }
});

socket.on('player-bought', function(maxAmount) {
  console.log(maxAmount);
  $bidAmount.attr('max', maxAmount);
  $bidAmount.rangeslider('update', true);
});

socket.on('team-complete', function() {
  $('#action-pause').prop('disabled', true);
  $('#action-reject').prop('disabled', true);
  $('#action-bid').prop('disabled', true);
  console.log('Your team is complete');
});

socket.on('new-player', function(player) {
  $('#player-matches-value').text(player.matches);
  $('#player-runs-value').text(player.runs);
  $('#player-wickets-value').text(player.wickets);
  $('#player-name').text(player.name);
  $('#player-team').text(player.team);
  $('#player-position').text(player.position);
  $bidAmount.attr('min', 10);
  $bidAmount.val(10).change();
  $bidAmount.rangeslider('update', true);
  $('#home-container-content-bid-bids').empty();
});

socket.on('countdown', function(timer) {
  $('#countdown').text(timer);
});

setTimeout(function() {
  socket.emit('startBidding');
}, 3000);

$('#action-pause').click(function() {
  if (isPaused) {
    socket.emit('actionResume');
  } else {
    socket.emit('actionPause');
  }
});

$('#action-reject').click(function() {
  socket.emit('actionReject');
});

$('#action-bid').click(function() {
  socket.emit('actionBid', $bidAmount.val());
});

function decorateBidHistory(summary) {
  var result = '';
  if (summary.bidder !== undefined) {
    result = result + '<div><b>' + summary.bidder + '</b> bought <b>' +
             summary.player.name + '</b> for <b>' + summary.amount + '</b></div>';
  } else {
    result = result + '<div><b>' + summary.player.name + '</b> went unsold</div>';
  }
  var html = $.parseHTML(result);
  $('#home-container-left-panel-history').append(html);
}

function convertLastBidToRecentBid() {
  var $lastBid = $('.last-bid');
  $lastBid.removeClass('last-bid');
  $lastBid.addClass('recent-bid');

  $lastBid.find('.last-bid-content').removeClass('last-bid-content').addClass('recent-bid-content');
  $lastBid.find('.last-bid-content-username').removeClass('last-bid-content-username').addClass('recent-bid-content-username');
  $lastBid.find('.last-bid-content-value').removeClass('last-bid-content-value').addClass('recent-bid-content-value');

  if ($('#home-container-content-bid-bids').last().index() === 3) {
    $('#home-container-content-bid-bids').last().remove();
  }
}

function decorateBid(bid) {
  var $lastBid = $('<div>');
  $lastBid.addClass('home-container-content-bid-bids-item');
  $lastBid.addClass('last-bid');

  var $lastBidContent = $('<div>');
  $lastBidContent.addClass('last-bid-content');

  var $lastBidContentUsername = $('<span>');
  $lastBidContentUsername.addClass('last-bid-content-username');
  $lastBidContentUsername.text(bid.bidder.name + ' bid ');

  var $lastBidContentValue = $('<span>');
  $lastBidContentValue.addClass('last-bid-content-value');
  $lastBidContentValue.text('$' + bid.amount);

  $lastBidContent.append($lastBidContentUsername);
  $lastBidContent.append($lastBidContentValue);
  $lastBid.append($lastBidContent);
  $('#home-container-content-bid-bids').prepend($lastBid);
}

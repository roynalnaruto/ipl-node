var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var passportSocketIO = require('passport.socketio');
var flash = require('connect-flash');
var RedisStore = require('connect-redis')(session);

var sessionStore = new RedisStore({
  host: 'localhost',
  port: 6379
});

app.use(bodyParser());
app.use(cookieParser());
app.use(session({
  store: sessionStore,
  secret: 'ipl-secret'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.set('View engine', 'ejs');
app.use(express.static('public'));

var db = require('./db');
db.connect('mongodb://localhost:27017/ipl', function(err) {
  if (err) {
    console.log('unable to connect to MongoDB');
    process.exit(1);
  } else {
    var server = app.listen(3000, '0.0.0.0', function() {
      console.log('listening to port 3000');
    });
    require('./middlewares/passport.js')(passport);
    require('./routes/authenticate.js')(app, passport);
    require('./routes/user.js')(app);

    var io = require('socket.io')(server);

    io.use(passportSocketIO.authorize({
      cookieParser: cookieParser,
      secret: 'ipl-secret',
      store: sessionStore,
      success: function(data, accept) {
        accept();
      },
      fail: function(data, message, error, accept) {
        accept(null, false);
      }
    }));

    io.on('connection', function(socket) {
      var Chat = require('./socketHandlers/Chat');
      var Bidding = require('./socketHandlers/Bidding');
      var socketHandlers = {
        chat: new Chat(app, socket, io),
        bidding: new Bidding(app, socket, io)
      };
      for (var socketHandler in socketHandlers) {
        var handler = socketHandlers[socketHandler].handler;
        for (var event in handler) {
          socket.on(event, handler[event]);
        }
      }
    });
  }
});

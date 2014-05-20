
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

//define global vars to be used in templates
app.locals.title = "Concurrent Drawing";
app.locals.qrcodeUrl = "http://192.168.1.20:94";
app.locals.siteUrl = "http://192.168.1.20:8000";

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/list', routes.list);
app.get('/users', user.list);

var server = http.createServer(app).listen( app.get('port') );
var io = require('socket.io').listen(server, function() {
  console.log("Express server listening on port " + app.get('port'));
});

// A user connects to the server (opens a socket)
io.sockets.on('connection', function (socket) {
  socket.on( 'drawOnCanvas', function( data, session ) {
    socket.broadcast.emit( 'drawOnCanvas', data );
  });
  socket.on( 'clearCanvas', function( data, session ) {
    socket.broadcast.emit( 'clearCanvas', data );
  });
  socket.on( 'undoWork', function( data, session ) {
    socket.broadcast.emit( 'undoWork', data );
  });

});


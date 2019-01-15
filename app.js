process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  console.log(err.stack);
});

//const createError = require('http-errors');
const colyseus = require('colyseus');
const express = require('express');
//const path = require('path');
//const cookieParser = require('cookie-parser');
//const logger = require('morgan');
const http = require('http');

const app = express();
const server = http.createServer(app);

const gameServer = new colyseus.Server({server: server});
const BattleRoom = require('./battleRoom');

gameServer.register('testroom', BattleRoom);

const port = (process.env.PORT || 2657);
const host = (process.env.HOST || '51.15.91.6');
//const host = (process.env.HOST || '127.0.0.1');

app.use(express.static(__dirname));

server.listen(port, host, function() {
  const host = server.address();
  console.log('Listening on %s:%s', host.address, host.port);
});

module.exports = app;

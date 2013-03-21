//Creates a server at localhost, port 3000


var net = require('net');

var HOST = '127.0.0.1',
	PORT = '3000';

var server = net.createServer();
server.listen(PORT,HOST);

console.log('Server listening on ' + HOST + ':' + PORT);

server.on('connection',function(sock){
	rtsp = require('./RTSP');
	rtsp.handleClientJoining(sock); //called for each client joining
});

//This module is used to send and receive RTSP packets.  Additionally, it keeps track
//of clients and calls functions to create RTP packets.

var net = require("net");


//Stores information for each VideoPlayer.exe
function client() {

	this.id = 0;
	this.socket = 0;
	this.port = 0;
	this.state=0;
	this.c_mjpeg=0;
	this.c_rtp=0;
	this.interval=0;
	this.frameNo=0;
	this.seq = 0;
	this.special_socket=0;

}

function server_setup(data, c){
	var msg = "";

	//Get the ports, seq number, and video info
	c.seq = data.match(/CSeq: ([0-9]+)/)[1];
	var video = data.match(/video[0-9].mjpeg/);
	var port = data.match(/client_port= ([0-9]+)/)[1];
	//if(c.port == 0){
		c.port = port;
//	}
	c.state = 0;
	c.frameNo = 0;

	//Setup the ports and return RTSP
	console.log("Server setup for client " + c.id + " to port " + c.port);
	this.session = Math.round(Math.random() * 100000);
	msg += "RTSP/1.0 200 OK\n";
	msg += "CSeq: " + c.seq + "\n";
	msg += "Transport: RTP/AVP;unicast;client_port="+port+";server_port=3000\n";
	msg += "Session: " + this.session;
	c.seq++;

	//Read the video
	c.c_mjpeg = require("./MJPEGVIDEO.js");
	moviesize = c.c_mjpeg.load(video);

	//Initialize packet creator
		c.c_rtp = require("./RTPPacket.js");
		c.special_socket = c.c_rtp.init("127.0.0.1", c.port);


	return msg;


};



//Contains the function to handle client joining
var rtsp = {
	handleClientJoining:function(sock){
		console.log("A Client has Connected");

		//Create new client on join
		var c = new client();
		c.socket = sock;
		c.id = Math.round(Math.random() * 100000);

		//Upon receiving data, determine what to do and call appropriate function
		c.socket.on("data", function(rtspHeaderString){
			console.log("Client 127.0.0.1:" + c.port + " request:");
			var rtspHeader = rtspHeaderString.toString();
			console.log(rtspHeader);
			var play = rtspHeader.search(/PLAY/i);
			var pause = rtspHeader.search(/PAUSE/i);
			var setup = rtspHeader.search(/SETUP/i);
			if(play != -1){
				var msg = server_play(c);
				return c.socket.write(msg);
			}
			else if (pause!=-1){
				var msg = server_pause(c);
				return c.socket.write(msg);
			}
			else if (setup!=-1){
				var msg = server_setup(rtspHeader, c);
				return c.socket.write(msg);
			}
			else{
				var msg = server_teardown(rtspHeader, c);
				return c.socket.write(msg);
			}

		})

		//Handle disconnecting clients
		c.socket.on("end", function(){
			c.state = 3;
			return console.log("Client 127.0.0.1:"  + c.port + " has disconnected");
		})

	}
};
module.exports = rtsp;

//Loops through each packet and sends it through UDP
function server_play(c){
	c.state = 1;
	var msg = "";
	msg += "RTSP/1.0 200 OK\n";
	msg += "CSeq: " + c.seq + "\n";
	msg += "Session: " + this.session + "\n";
	msg += "RTP-Info : url=rtsp://PG\n";

	//Loop every 100ms until no more packets left
	//or if state changes (ie Teardown/Pause)
	c.interval = setInterval(function() {
		
		if(c.frameNo < c.c_mjpeg.maxFrame){
	
			if(c.state == 1){
				c.c_rtp.send(c.c_mjpeg.file_content[c.frameNo], c.frameNo*2, c.port);
				c.frameNo++;
			}
		}
		else{
			clearInterval(c.interval);
		}
		if(c.state == 3){
			c.frameNo = 0;
			clearInterval(c.interval);
		}
	}, 100);

	c.seq++;
	return msg;

};

//Pause the packet sending
function server_pause(c){
	c.state = 2;
	var msg = "";
	msg += "RTSP/1.0 200 OK\n";
	msg += "CSeq: " + c.seq + "\n";
	msg += "Session: " + this.session + "\n";
	msg += "RTP-Info : url=rtsp://PG\n";
	c.seq++;
	return msg;
};

//Stop the packet sending, reset frame number
function server_teardown(c){
	c.state = 3;
	var msg = "";
	msg += "RTSP/1.0 200 OK\n";
	msg += "CSeq: " + c.seq + "\n";
	msg += "Session: " + this.session + "\n";
	msg += "RTP-Info : url=rtsp://PG\n";
	c.seq++;
	return msg;
};

//This module is used to create and send RTP packets through UDP

module.exports = (function(){

	var dgram = require('dgram');
	var r = {

		time:0,
		max_time:0,
		seq:0,
		max_seq:0,
		SSRC:0,
		RTP:0,  //udp socket datagram
		ip:0,
		port:0,
		buf:0,
		packet_size:40960,
		receiver_event:0,
		nexttimestamp_event:0,
		nexttimestamp_event_origin_caller:0,

		make_packet:function(seq_in, timestamp_in, SSRC_in, payload_in){
			this.packet_size = payload_in.length;
			var r = new Buffer(12 + this.packet_size);  //12 bytes header
			var z = 0;
			r.fill(0,0,r.length);
			var SequenceNo = seq_in;


			//Create header
			r[0] = 0x80;
			r[1] = 26;
			r[2] = (SequenceNo >>> 8);
			r[3] = (SequenceNo & 0xFF);
			r[4] = 0;
			r[5] = 0;
			r[6] = 0;
			r[7] = 0;
			r[8] = 0;
			r[9] = 0;
			r[10] = 0;
			r[11] = 1;

			//Copy payload
			payload_in.copy(r,12,0,this.packet_size);

			//Return packet
			return r;

		},

		//Initializes the packet and creates socket
		init:function(ip_in, port_in){
			this.time = this.seq = 0;
			this.max_time = this.max_seq = -99999;
			this.RTP = dgram.createSocket("udp4");
			this.ip = ip_in;
			this.port = port_in;
			this.SSRC = Math.round(Math.random()*100000);
			this.buf = [];

			return this.RTP;
		},

		send:function(buffer_in, timestamp_in, port){
			//Create and send a packet to the UDP socket
			var s = this.make_packet(++this.seq, timestamp_in, this.SSRC, buffer_in);
			this.RTP.send(s,0,s.length,port,this.ip);
			//this.RTP.send(s,0,s.length,this.port,this.ip);

		}


	}
	return r;



})();

//This module is used to get an array of buffers of the video content of an mjpeg file
//Video stored in buffers[]


module.exports = (function(){

	fs = require("fs");
	var r = {
		total_len:0,
		file_size:[],
		file_size_raw:[],
		file_content:[],
		buffers:[],	//stores the buffers for the video
		maxFrame:0,


		load:function(file_name, write_flag){

			//Load video
			try{
				var fd = fs.openSync(file_name, "r");
			}
			catch(err){
				console.log("**Error loading file**");
				return null;
			}


			file_content = [];
			var totalSizeScanned = 0;
			var frameNo = 0;

			//Continue loading video until no more left to read
			while(true){

				//Read the size of the frame
				var tmp_buf = Buffer(5)
				try{
					fs.readSync(fd,tmp_buf,0,5, null);
				}
				catch(err){
					break;
				}

				totalSizeScanned += 5;

				//Get the size of the frame
				var stringBuffer = tmp_buf.toString("utf-8");
				this.total_len = parseInt(stringBuffer, 10);
				var frame_buf = Buffer(this.total_len);

				//Read the frame
				try{
					fs.readSync(fd, frame_buf, 0, this.total_len, null);
				}
				catch(err){
					break;
				}
				this.file_content[frameNo] = frame_buf;
				this.maxFrame = frameNo;
				frameNo++;
				totalSizeScanned += this.total_len;
				totalSizeScanned++;

			}
			return this.total_len;
		}
	}
	return r;


})();
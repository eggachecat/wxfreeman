var http = require("http")

var request = function(fn, reqObj, callback){

	var body = JSON.stringify(reqObj["body"]) || "";

	if (body) {
		reqObj.options.headers["Content-Length"] = Buffer.byteLength(body, 'utf8');
	}


	var req = fn(reqObj.options, function(res){
		var ans = '';
		req.on("data", function(chunk){
			ans += chunk;
		})

		res.on("end", function(){
			callback(data);
		})
	})

	if (body) {
		req.write(body)
	}
	
	req.end();
}

var requestData = function(reqObj, callback){
	request(http.request, reqObj, callback);
}

var getData = function(callback){
	request(http.get, reqObj, callback);
}


exports.requestData = requestData;
exports.getData = getData;

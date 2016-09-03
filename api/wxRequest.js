var http = require("http")
var https = require("https")

 
var request = function(fn, reqObj, callback){

	var body = JSON.stringify(reqObj["body"]) || "";

	if (body) {
		reqObj.options.headers["Content-Length"] = Buffer.byteLength(body, 'utf8');
	}


	var req = fn(reqObj.options, function(res){

		var ans = '';
		res.on("data", function(chunk){
			ans += chunk;
		})

		res.on("end", function(){
			callback(ans, res);
		})
	})

	if (body) {
		req.write(body)
	}

	req.end();
}

var requestData = function(reqObj, callback){
	return request(http.request, reqObj, callback);
}

var getData = function(url, callback){
	return request(http.get, { options: url }, callback);
}

var httpsGetData = function(url, callback){
	return request(https.get, { options: url }, callback);
}

var httpsRequestData = function(reqObj, callback){
	return request(https.request, reqObj, callback);
}

exports.requestData = requestData;
exports.getData = getData;
exports.httpsGetData = httpsGetData;
exports.httpsRequestData = httpsRequestData;

var https = require("https")
var http = require("http")
var fs = require("fs")

var LIB_PATH = `${__dirname}/libs`
var _CONF = require(`${LIB_PATH}/conf`)


var request = function(fn, parameter, callback){
	var req = fn(parameter, function(res){
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			callback(body, res);
		});
	})

	req.end();
}

var httpRequest = function(type, parameter, callback){
	var fn =  http[type];
	request(fn, parameter, callback)
}
var httpsRequest = function(type, parameter, callback){
	var fn =  https[type];
	request(fn, parameter, callback)
}

var toCookiesHeader = function(cookies){
	var strHeader = JSON.stringify(cookies)
		.replace(/:/g, "=").replace(/,/g, ";").replace(/"/g, "");

	return strHeader.substr(1, strHeader.length - 2)
}

module.exports = {
	httpRequestData: function(options, callback){
		httpRequest("request", options, callback)
	},

	httpGetData: function(url, callback){
		httpRequest("get", url, callback)
	},

	httpsRequestData: function(options, callback){
		httpsRequest("request", options, callback)
	},

	httpsGetData: function(url, callback){
		httpsRequest("get", url, callback)
	},

	cookiesParser: function(cookies){

		for (var i = 0; i < cookies.length; i++) {
			cookie = cookies[i].split(";")[0].split("=");
			global.cookies[cookie[0]] = cookie[1]
		}
	},

	scriptParser: function(script){	
		script = script.replace(/window/g, "global.window")
		eval(script);
		return global.window
	},

	saveCookies: function(){
		  fs.writeFileSync(`${LIB_PATH}/cookies.json`, JSON.stringify(global.cookies));
	},

	saveValues: function(){
		  fs.writeFileSync(`${LIB_PATH}/values.json`, JSON.stringify(global.values));
	},

	getHeaders: function(fileName){	
		var headers = JSON.parse(fs.readFileSync(`${LIB_PATH}/${fileName}.json`, 'utf8'))
		headers["Cookie"] = toCookiesHeader(global.cookies)
		return headers;
	},

	getDeviceID: function() {
	    return "e" + ("" + Math.random().toFixed(15)).substring(2, 17)
	},
	now: function(){
		return +new Date;
	}
}

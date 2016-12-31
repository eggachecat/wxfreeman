var fs = require("fs")


var wxFiles = require("./wxConf").files;

 


function readJson(filePath){
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf-8"));
	} catch(e) {
		throw e;
	}
}

function writeJson(filePath, content){
	try {
		fs.writeFileSync(filePath, JSON.stringify(content));
	} catch(e) {
		throw e;
	}
}

function toCookiesHeader(cookies){
	var strHeader = JSON.stringify(cookies)
		.replace(/:/g, "=").replace(/,/g, ";").replace(/"/g, "");

	return strHeader.substr(1, strHeader.length - 2)
}

var loadConfig = function(){
	try{
		global.wx = readJson(wxFiles["wxConfig"]);
	} catch(e) {
		console.log(e)
	}
}

var saveConfig = function(){
	try{
		writeJson(wxFiles["wxConfig"], global.wx);
	} catch(e) {
		console.log(e)
		throw e;
	}
}

var loadMessages = function(filePath){
	var filePath = filePath || wxFiles["messages"];
	try{
		global.wx["messages"] = readJson(filePath);
	} catch(e) {
		console.log(e)
		throw e;
	}
}

var saveMessages = function(messages){
	var messages = messages || global.wx.messages;
	try{
		writeJson(wxFiles["messages"], messages);
	} catch(e) {
		console.log(e)
		throw e;
	}
}



var getHeaders = function(filePath){
	var filePath = filePath || wxFiles["headers"];
	var headers = readJson(filePath);
	headers["Cookie"] = toCookiesHeader(global.wx.cookies)
	return headers;
}

var getCookies = function(){
	return toCookiesHeader(global.wx.cookies)
}


exports.readJson = readJson;
exports.writeJson = writeJson;


exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.loadMessages = loadMessages;
exports.saveMessages = saveMessages;
exports.getHeaders = getHeaders;

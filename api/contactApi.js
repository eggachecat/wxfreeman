var https = require("https")
var http = require("http")
var fs = require("fs")

var common = require("./common")

var LIB_PATH = `${__dirname}/libs`
var _CONF = require(`${LIB_PATH}/conf`)


function getContact(callback){
	var headers = common.getHeaders("check-login")


	var options = {
		"hostname": _CONF.host.wx,
		"path": "/cgi-bin/mmwebwx-bin/webwxgetcontact",
		"method": "GET",
		"headers": headers
	}


	common.httpRequestData(options, function(body){
		callback(body)
	})
}


exports.getContact = getContact;
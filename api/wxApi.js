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
       
		callback(JSON.parse(body))
	})
}

function getBaseRequest(){

}

function iniWechat(callback){

	var headers = common.getHeaders("check-login")
	var options = {
        "hostname": _CONF.host.wx,
        "path": `/cgi-bin/mmwebwx-bin/webwxinit?r=${~new Date}`,
        "method": "POST",
        "headers": headers
    }

    var postData = {
        BaseRequest: {
            "Uin": global.cookies["wxuin"],
            "Sid": global.cookies["wxsid"],
            "Skey": "",
            "DeviceID": common.getDeviceID()
        }
    }

    postData = JSON.stringify(postData); 
	options.headers["Content-Length"] = postData.length

    var req = http.request(options, function(res) {
        var data = '';
        res.on("data", function(chunk){
            data += chunk;
        })
        res.on("end", function(){
           global.values["user"] = JSON.parse(data)["User"];
           global.values["SyncKey"] = JSON.parse(data)["SyncKey"];
           callback(JSON.parse(data));
           //wxSync(callback)
        })
    })
    req.write(postData);
    req.end();
}


function wxSync(callback){

    var headers = common.getHeaders("send-message")

    var options = {
        hostname: _CONF.host.wx,
        path: `/cgi-bin/mmwebwx-bin/webwxsync?sid=${global.cookies["wxsid"]}&skey=${global.values["skey"]}&pass_ticket=${global.values["pass_ticket"]}`,
        method: 'POST',
        headers: headers
    };

    var postData = {
        BaseRequest: {
            "Uin": global.cookies["wxuin"],
            "Sid": global.cookies["wxsid"],
            "Skey": global.values["skey"],
            "DeviceID": common.getDeviceID()
        },
        SyncKey: global.values["SyncKey"],
        rr: ~new Date
    }

    postData = JSON.stringify(postData); 
    options.headers["Content-Length"] = Buffer.byteLength(postData, 'utf8');

    console.log(options, postData)

     var req = http.request(options, function(res) {
        console.log(res)


        var data = '';
        res.on("data", function(chunk){
            data += chunk;
        })
        res.on("end", function(){
            console.log(data)
            callback()
        })
    })
    req.write(postData);
    req.end();
}




exports.getContact = getContact;
exports.iniWechat = iniWechat;
exports.wxSync = wxSync;
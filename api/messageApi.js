var https = require("https")
var http = require("http")
var fs = require("fs")

var common = require("./common")

var LIB_PATH = `${__dirname}/libs`
var _CONF = require(`${LIB_PATH}/conf`)


// global.messages = {}

// // load messages.json
// function loadMessage(){
// 	global.messages = JSON.parse(fs.readFileSync( `${__dirname}/assets/messages.json`, 'utf8'))
// 	console.log(global.messages)
// }




function createMsgPostData(content, targetName){

	var MsgId = (common.now() + Math.random().toFixed(3)).replace(".", "");


	return {
		"BaseRequest": {
			"Uin": parseInt(global.cookies["wxuin"]),
			"Sid": global.cookies["wxsid"],
			"Skey": global.values["skey"],
			"DeviceID": common.getDeviceID()
		},
		"Msg": {
			"Type": 1,
			"Content": content,
			"FromUserName": global.values["user"]["UserName"],
			"ToUserName": targetName,
			"LocalID": MsgId,
			"ClientMsgId": MsgId
		},
		"Scene": 0
	}
}



function sendMessage(content, targetName, callback){
	
	console.log(content, targetName)	
			
	var msgPostData = createMsgPostData(content, targetName);
	
	msgPostData = JSON.stringify(msgPostData); 

	var headers = common.getHeaders("send-message")
	var options = {
        "hostname": _CONF.host.wx,
        "path": `/cgi-bin/mmwebwx-bin/webwxsendmsg?pass_ticket=${global.values["pass_ticket"]}`,
        "method": "POST",
        "headers": headers
    }


	options.headers["Content-Length"] = Buffer.byteLength(msgPostData, 'utf8');
	console.log(options, msgPostData)


	var req = http.request(options, function(res) {
		var body = '';
		res.on("data", function(chunk){
			body += chunk;
		})
      	res.on("end", function(){
      		callback(body)
      	})

    })
    req.write(msgPostData + "/n");
	req.end();
}

exports.sendMessage = sendMessage;
// exports.loadMessage = loadMessage;
// loadMessage()
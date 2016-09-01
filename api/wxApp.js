var wxRequest = require("./wxRequest")
var wxIO = require("./wxIO")
var defaultHost = require("./wxConf").host





function createMsgPostData(content, targetName){

    var MsgId = (common.now() + Math.random().toFixed(3)).replace(".", "");

    return {
        "BaseRequest": {
            "Uin": parseInt(global.wx.cookies["wxuin"]),
            "Sid": global.wx.cookies["wxsid"],
            "Skey": global.wx.values["skey"],
            "DeviceID": common.getDeviceID()
        },
        "Msg": {
            "Type": 1,
            "Content": content,
            "FromUserName": global.wx.values["user"]["UserName"],
            "ToUserName": targetName,
            "LocalID": MsgId,
            "ClientMsgId": MsgId
        },
        "Scene": 0
    }
}



var iniWechat = function(callback){

	var headers = wxIO.getHeaders() 

    var reqObj = {
        "options": {
            "hostname": defaultHost.wx,
            "path": `/cgi-bin/mmwebwx-bin/webwxinit?r=${~new Date}`,
            "method": "POST",
            "headers": headers
        },
        "body": {
            "BaseRequest": {
                "Uin": global.wx.values["wxuin"],
                "Sid": global.wx.values["wxsid"],
                "Skey": "",
                "DeviceID": common.getDeviceID()
            }
        }
    }

    wxRequest.requestData(reqObj, function(data) {
        var obj = JSON.parse(data)
        global.wx.values["user"] = obj["User"];
        global.wx.values["SyncKey"] = obj["SyncKey"];
        callback(obj);
    })
}

var getContact = function(callback){

    var headers = wxIO.getHeaders()

    var reqObj = {
        "options": {
            "hostname": defaultHost.wx,
            "path": "/cgi-bin/mmwebwx-bin/webwxgetcontact",
            "method": "GET",
            "headers": headers
        }
    }

    wxRequest.requestData(reqObj, function(body){
        callback(JSON.parse(body))
    })
}



function sendMessage(content, targetName, callback){
    
    var headers = common.getHeaders()

    var reqObj = {
        "options": {
            "hostname":defaultHost.wx,
            "path": `/cgi-bin/mmwebwx-bin/webwxsendmsg?pass_ticket=${global.wx.cookies["pass_ticket"]}`,
            "method": "POST",
            "headers": headers
        },
        "body": createMsgPostData(content, targetName)
    }

    wxRequest.requestData(reqObj, function(res) {
       callback(res)
    })
}

exports.getContact = getContact;
exports.iniWechat = iniWechat;

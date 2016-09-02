var wxRequest = require("./wxRequest")
var wxIO = require("./wxIO")
var defaultHost = require("./wxConf").host


function getDeviceID() {
    return "e" + ("" + Math.random().toFixed(15)).substring(2, 17)
}

function getBaseRequest() {
    return {
        "Uin": parseInt(global.wx.cookies["wxuin"]),
        "Sid": global.wx.cookies["wxsid"],
        "Skey": global.wx.values["skey"] || "",
        "DeviceID": getDeviceID()
    }
}

function scriptParser(script) {
    script = script.replace(/window/g, "global.wx.window")
    eval(script);
    return global.wx.window
}

function createMsgPostData(content, targetName){

    var MsgId = (common.now() + Math.random().toFixed(3)).replace(".", "");

    return {
        "BaseRequest": getBaseRequest(),
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

function getFormateSyncKey() {
    for (var e = global.wx.values["SyncKey"].List, t = [], o = 0, n = e.length; n > o; o++) t.push(e[o].Key + "_" + e[o].Val);
    return t.join("|")
}


var iniWx = function(callback){

	var headers = wxIO.getHeaders() 

    var reqObj = {
        "options": {
            "hostname": defaultHost.wx,
            "path": `/cgi-bin/mmwebwx-bin/webwxinit?r=${~new Date}`,
            "method": "POST",
            "headers": headers
        },
        "body": {
            "BaseRequest": getBaseRequest()
        }
    }

    wxRequest.requestData(reqObj, function(data) {
        var obj = JSON.parse(data)
        global.wx.values["user"] = obj["User"];
        global.wx.values["SyncKey"] = obj["SyncKey"];
        wxIO.saveConfig();
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
    
    var headers = wxIO.getHeaders()


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

 var syncCheck = function(callback) {
    
    var headers = wxIO.getHeaders()
    var reqObj = {
        "options": {
            "hostname":defaultHost.webpush,
            "path": `/cgi-bin/mmwebwx-bin/synccheck?r=${+new Date}&skey=${global.wx.values["skey"]}&sid=${global.wx.values["sid"]}&uin=${global.wx.values["uin"]}&deviceid=${getDeviceID()}&synckey=${getFormateSyncKey()}`,
            "method": "POST",
            "headers": headers
        }
    }  

     wxRequest.requestData(reqObj, function(res) {
        console.log(res);
       var rtn = scriptParser(res)["synccheck"]
       callback(rtn)
    })
 }

var webwxsync = function(callback) {


    var headers = wxIO.getHeaders()

    var reqObj = {
        "options": {
            "hostname":defaultHost.wx,
            "path": `/cgi-bin/mmwebwx-bin/webwxsync?sid=${global.wx.values["wxsid"]}&skey=${global.wx.values["skey"]}&pass_ticket=${global.wx.values["pass_ticket"]}`,
            "method": "POST",
            "headers": headers
        },
        "body": {
            "BaseRequest": getBaseRequest(),
            "SyncKey": global.wx.values["SyncKey"],
            "rr": ~new Date
        }
    }  

    wxRequest.requestData(reqObj, function(res) {
        console.log(res);
       callback(res)
    })
}

var syncWx = function(callback){
    syncCheck(function(rtn){
        if(rtn && rtn.selector){
            webwxsync(function(data){
                callback(data);
                syncWx(callback);
            })
        } else {
            syncWx(callback)
        }
    })
}

exports.getContact = getContact;
exports.iniWx = iniWx;
exports.syncWx = syncWx;



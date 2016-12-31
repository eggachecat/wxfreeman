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

    var MsgId = (+new Date + Math.random().toFixed(3)).replace(".", "");

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
 
 var syncWx = function(callback) {
    console.log("syncCheck!!")
    var headers = wxIO.getHeaders()
    var wxValues = global.wx.values;

    var reqObj = {
        "options": {
            "hostname":defaultHost.webpush,
            "path": '/cgi-bin/mmwebwx-bin/synccheck' + "?" + ["r=" + (+new Date), "skey=" + encodeURIComponent(wxValues["skey"]), "sid=" + encodeURIComponent(wxValues["wxsid"]), "uin=" + wxValues["wxuin"], "deviceid=" + getDeviceID(), "synckey=" + encodeURIComponent(getFormateSyncKey())].join("&"),
            "method": "GET",
            "agent": false,
            "headers": headers
        }
    }  

    console.log(reqObj)

    wxRequest.httpsRequestData(reqObj, function(data, res) {
      
        var rtn = scriptParser(data)["synccheck"]
        console.log(rtn)
        if (!rtn || rtn.retcode !== "0") {
            callback();
        } else {
            if (rtn.selector !== "0") {
                webwxsync(function(data) {
                    callback(data);
                    syncWx(callback)
                })
            } else {
                syncWx(callback)
            }
        }
    })
 }


var getHeaderImage = function(headerPath, callback){
    var headers = wxIO.getHeaders()
    var reqObj = {
        "options": {
            "hostname":defaultHost.wx,
            "path": headerPath,
            "method": "GET",
            "headers": headers
        }
    }  
    var http = require("http")
    var fs = require("fs")

    var req = http.request(reqObj.options, function(res){
        var imagedata = ''
        res.setEncoding('binary')

        res.on('data', function(chunk){
            imagedata += chunk
        })

        res.on('end', function(){
           callback(new Buffer(imagedata, 'binary').toString('base64'));
        })

    })

    req.end();


    // wxRequest.requestData(reqObj, function(data, res) {

    //     console.log(new Buffer(data).toString('base64'))
    // })
}

var webwxsync = function(callback) {

    var headers = wxIO.getHeaders()
    var wxValues = global.wx.values;

    var reqObj = {
        "options": {
            "hostname":defaultHost.wx,
            "path": `/cgi-bin/mmwebwx-bin/webwxsync?sid=${wxValues["wxsid"]}&skey=${wxValues["skey"]}&pass_ticket=${wxValues["pass_ticket"]}`,
            "method": "POST",
            "headers": headers
        },
        "body": {
            "BaseRequest": getBaseRequest(),
            "SyncKey": global.wx.values["SyncKey"],
            "rr": ~new Date
        }
    }  

    wxRequest.requestData(reqObj, function(data) {
        var obj = JSON.parse(data)
        global.wx.values["SyncKey"] = obj["SyncKey"];
        callback(data)
    })
}





exports.getContact = getContact;
exports.iniWx = iniWx;
exports.syncWx = syncWx;
exports.sendMessage = sendMessage;

exports.getHeaderImage = getHeaderImage;


// "/cgi-bin/mmwebwx-bin/synccheck?r=1472815053018&skey=%40crypt_4896113d_68eedb8c9cafb213567ed085ff58523e&sid=kjnNHtUprykXNlTa&uin=779148661&deviceid=e717783176972749&synckey=1_650789635%7C2_650794654%7C3_650794583%7C11_650794619%7C13_650720002%7C201_1472815050%7C203_1472814595%7C1000_1472812382%7C1001_1472812412&_=1472814986071
// "/cgi-bin/mmwebwx-bin/synccheck?r=1472815707694&skey=%40crypt_4896113d_65e8d1dbf6d9127adb83748e6867350e&sid=WyQK3QhMY9PYzFtA&uin=779148661&deviceid=e445904521497093&synckey=1_650789635%7C2_650794655%7C3_650794583%7C1000_1472812382"



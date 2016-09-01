
var wxRequest = require("./wxRequest")
var wxIO = require("./wxIO")
var defaultHost = require("./wxConf").host
var defaultConf = require("./wxConf")

function cookiesParser(cookies) {
    for (var i = 0; i < cookies.length; i++) {
        cookie = cookies[i].split(";")[0].split("=");
        global.wx.cookies[cookie[0]] = cookie[1]
    }
}

function scriptParser(script) {
    script = script.replace(/window/g, "global.wx.window")
    eval(script);
    return global.wx.window
}

function initGlobal(){
	global.wx = {
		"cookies": {},
		"values": {},
		"window": {}
	}
}

function initCookies(){

    function r(c) {
        return (c || "") + Math.round(2147483647 * (Math.random() || .5)) * +new Date % 1E10
    }

    initGlobal();
    
    global.wx.cookies = {
    	"pgv_pvi": r(),
    	"pgv_si": r("s")
    }
}


function getQrcode(callback) {

	initCookies();

	var redirect_uri = encodeURIComponent(defaultConf.protocol + "//" + defaultHost.wx + "/cgi-bin/mmwebwx-bin/webwxnewloginpage");
	var headers = wxIO.getHeaders();

	var reqObj = {
		options: {
			hostname: defaultHost.login,
			path: `/jslogin?appid=wx782c26e4c19acffb&redirect_uri=${redirect_uri}&fun=new&lang=${defaultConf.lang}`,
			method: 'GET',
			headers: headers
		}
	}

	wxRequest.requestData(reqObj, function(body){
		global.wx.window.QRLogin = {}
		callback(scriptParser(body)["QRLogin"]);
	})
}


function redirect(status, callback){
	
	var redirect_uri = scriptParser(status)["redirect_uri"];

	wxRequest.httpsGetData(redirect_uri, function(body, res){

		var cookies = res.headers["set-cookie"];
		cookiesParser(cookies)

        global.wx.values = {
            "ret": body.match(/<ret>(.*)<\/ret>/)[1],
            "skey": body.match(/<skey>(.*)<\/skey>/)[1],
            "wxsid": body.match(/<wxsid>(.*)<\/wxsid>/)[1],
            "wxuin": body.match(/<wxuin>(.*)<\/wxuin>/)[1],
            "pass_ticket": body.match(/<pass_ticket>(.*)<\/pass_ticket>/)[1]
        }

        wxIO.saveConfig();
        callback();
	})
}

function checkLogin(uuid, callback) {

	var headers = wxIO.getHeaders()

	console.log("check login", callback);

    var reqObj = {
        "options": {
            hostname: defaultHost.login,
            path: `/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid=${uuid}&tip=0&r=${~new Date}`,
            method: 'GET',
            headers: headers
        }
    };


	wxRequest.requestData(reqObj, function(status){
		var statusCode = scriptParser(status)["code"];		
		console.log(`statusCode is ${statusCode}`);	
		switch(statusCode){
			case 408:
			case 400:
			case 201: checkLogin(uuid, callback);  break;
			case 200: redirect(status, callback); break;
		}
	})
}

var isLogin = function(onSuccess, onFailed){
	wxRequest.httpsGetData("https://wx.qq.com", function(body, res){
		console.log(body, res)	
		console.log(body.match(/{isLogin:(.*)}/)[1])
	})
}

exports.getQrcode = getQrcode;
exports.checkLogin = checkLogin;
exports.isLogin = isLogin;

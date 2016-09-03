
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

var isLogin = function(callback){

	var headers = wxIO.getHeaders()
    var reqObj = {
        "options": {
            "hostname": defaultHost.wx,
            "path": '/',
            "method": "GET",
            "agent": false,
            "headers": headers
        }
    }

	wxRequest.httpsRequestData(reqObj, function(body, res){
		var result = String(body).match(/isLogin:(.*)/)[1];
		callback(eval(result))
	})
} 

exports.getQrcode = getQrcode;
exports.checkLogin = checkLogin;
exports.isLogin = isLogin;



// "/cgi-bin/mmwebwx-bin/synccheck?r=1472814901825&skey=@crypt_4896113d_98da6104c4db5adc8d26cee0b7e72f30&sid=jky2iRxhsUK1ybjR&uin=779148661&deviceid=e800515288804332&synckey=1_650789635|2_650794631|3_650794583|1000_1472812382"__proto__: Object__proto__: Object

// "/cgi-bin/mmwebwx-bin/synccheck?r=1472815016083&skey=%40crypt_4896113d_68eedb8c9cafb213567ed085ff58523e&sid=kjnNHtUprykXNlTa&uin=779148661&deviceid=e123172659733209&synckey=1_650789635%7C2_650794651%7C3_650794583%7C11_650794619%7C13_650720002%7C201_1472815013%7C203_1472814595%7C1000_1472812382%7C1001_1472812412&_=1472814986067

var https = require("https")
var http = require("http")
var fs = require("fs")

var common = require("./common")


// load messages.json
// function loadMessage(){
// 	global.wx.messages = JSON.parse(fs.readFileSync( `${__dirname}/assets/messages.json`, 'utf8'))
// 	console.log(global.wx.messages["yjsb"])
// }
// loadMessage();

function initApp(){
	common.loadConfig();
	console.log(global.wx.cookies, global.wx.cookies);
}


var LIB_PATH = `${__dirname}/libs`
var _CONF = require(`${LIB_PATH}/conf`)

function initCookies(){

     function q(c, a, b) {
        var d = window.location.host,
            e = {
                "com.cn": 1,
                "net.cn": 1,
                "gov.cn": 1,
                "com.hk": 1,
                "co.nz": 1,
                "org.cn": 1,
                "edu.cn": 1
            },
            f = d.split(".");
        2 < f.length && (d = (e[f.slice(-2).join(".")] ? f.slice(-3) : f.slice(-2)).join("."));
        global.wx.cookies[c] = a;
       	common.saveCookies();
    }

    function r(c) {
        return (c || "") + Math.round(2147483647 * (Math.random() || .5)) * +new Date % 1E10
    }


    q("pgv_pvi",  r(), "Sun, 18 Jan 2038 00:00:00 GMT;");
    q("pgv_si", r("s"))
}

function getQrcode(callback) {

	initCookies();
	//loadMessage();
	var redirect_uri = encodeURIComponent(_CONF.protocol + "//" + _CONF.host.wx + "/cgi-bin/mmwebwx-bin/webwxnewloginpage");
	var headers = common.getHeaders("check-login");

	var options = {
		hostname: _CONF.host.login,
		path: `/jslogin?appid=wx782c26e4c19acffb&redirect_uri=${redirect_uri}&fun=new&lang=${_CONF["lang"]}`,
		method: 'GET',
		headers: headers
	};

	common.httpRequestData(options, function(body){
		global.wx.window["QRLogin"] = {}
		callback(common.scriptParser(body)["QRLogin"]);
	})
}

function redirect(status, callback){
	
	var redirect_uri = common.scriptParser(status)["redirect_uri"];

	console.log(callback);

	common.httpsGetData(redirect_uri, function(body, res){
		var newCookies = res.headers["set-cookie"];
		common.cookiesParser(newCookies)
		common.saveCookies();
        global.wx.cookies = {
            "ret": body.match(/<ret>(.*)<\/ret>/)[1],
            "skey": body.match(/<skey>(.*)<\/skey>/)[1],
            "wxsid": body.match(/<wxsid>(.*)<\/wxsid>/)[1],
            "wxuin": body.match(/<wxuin>(.*)<\/wxuin>/)[1],
            "pass_ticket": body.match(/<pass_ticket>(.*)<\/pass_ticket>/)[1]
        }
        console.log(global.wx.cookies)
        common.saveValues();
        callback();
	})
}

function checkLogin(uuid, callback) {

	var headers = common.getHeaders("check-login")

	console.log("check login");

	console.log(callback);

	var options = {
		hostname: _CONF.host.login,
		path: `/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid=${uuid}&tip=0&r=${~new Date}`,
		method: 'GET',
		headers: headers
	};


	common.httpRequestData(options, function(status){
		var statusCode = common.scriptParser(status)["code"];		
		console.log(`statusCode is ${statusCode}`);	
		switch(statusCode){
			case 408:
			case 400:
			case 201: checkLogin(uuid, callback);  break;
			case 200: redirect(status, callback); break;
		}
	})
}
 





exports.getQrcode = getQrcode;
exports.checkLogin = checkLogin;







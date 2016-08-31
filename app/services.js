// node-modules all in services


var cookiesApi = require('./api/cookiesApi')
var wxApi = require('./api/wxApi')
var messageApi = require("./api/messageApi")

app.service('ngNode', ['$q', function($q){
	this.execute = function(asyncFn){
		var linker = $q.defer();


		var arrArgs = Array.prototype.slice.call(arguments, 1)[0];
		arrArgs.push(function(data){
			linker.resolve(data);
		});
	
		asyncFn.apply(this, arrArgs);
		return linker.promise;
	}

	this.executeSync = function(asyncFn){		
		var arrArgs = Array.prototype.slice.call(arguments, 1)[0];
		console.log(arrArgs)
		return asyncFn.apply(this, arrArgs);
	}
}])

app.service('AuthService', ['ngNode', function(ngNode){
	
	this.getQrcode = function(){
		return ngNode.execute(cookiesApi.getQrcode, Array.prototype.slice.call(arguments));
	}

	this.checkLogin = function(){
		return ngNode.execute(cookiesApi.checkLogin, Array.prototype.slice.call(arguments));
	}

}])

app.service('DataService', function(){

	var data = global.wx;

	this.set = function(key, value){
		data[key] = value;
	}
	this.get = function(key){
		return data[key];
	}
})

app.service('WxService', ['ngNode', function(ngNode){
	this.getContact = function(){
		return ngNode.execute(wxApi.getContact, Array.prototype.slice.call(arguments));
	}
	this.iniWechat = function(){
		return ngNode.execute(wxApi.iniWechat, Array.prototype.slice.call(arguments));
	}
	this.wxSync = function(){
		return ngNode.execute(wxApi.wxSync, Array.prototype.slice.call(arguments));
	}
	this.sendMessage = function(){
		return ngNode.execute(messageApi.sendMessage, Array.prototype.slice.call(arguments));
	}

	this.saveConfig = function(){
		return ngNode.execute(wxApi.saveConfig, Array.prototype.slice.call(arguments));
	}
}])
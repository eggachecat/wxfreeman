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
		var arrArgs = Array.prototype.slice.call(arguments);
		return ngNode.execute(cookiesApi.getQrcode, arrArgs);
	}

	this.checkLogin = function(){
		console.log(arguments)
		var arrArgs = Array.prototype.slice.call(arguments);
		return ngNode.execute(cookiesApi.checkLogin, arrArgs);
	}

}])

app.service('DataService', function(){
	var data = {
		"cookies": global.cookies,
		"values": global.values,
		"messages": global.messages
	};
	this.set = function(key, value){
		data[key] = value;
	}
	this.get = function(key){
		return data[key];
	}
})

app.service('WxService', ['ngNode', function(ngNode){
	this.getContact = function(){
		var arrArgs = Array.prototype.slice.call(arguments);
		return ngNode.execute(wxApi.getContact, arrArgs);
	}
	this.iniWechat = function(){
		var arrArgs = Array.prototype.slice.call(arguments);
		return ngNode.execute(wxApi.iniWechat, arrArgs);
	}
	this.wxSync = function(){
		var arrArgs = Array.prototype.slice.call(arguments);
		return ngNode.execute(wxApi.wxSync, arrArgs);
	}
	this.sendMessage = function(){
		var arrArgs = Array.prototype.slice.call(arguments);
		return ngNode.execute(messageApi.sendMessage, arrArgs);
	}
}])
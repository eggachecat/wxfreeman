// node-modules all in services

var wxCookies = require('./api/wxCookies')
var wxApp = require('./api/wxApp')

var argsToArr = Array.prototype.slice;

app.service('ngNode', ['$q', function($q){
	this.execute = function(asyncFn){
		var linker = $q.defer();


		var arrArgs = argsToArr.call(arguments, 1)[0];
		arrArgs.push(function(data){
			linker.resolve(data);
		});
	
		asyncFn.apply(this, arrArgs);
		return linker.promise;
	}

	this.executeAlive = function(asyncFn){
		var linker = $q.defer();


		var arrArgs = argsToArr.call(arguments, 1)[0];
		arrArgs.push(function(data){
			linker.notify(data);
		});
	
		asyncFn.apply(this, arrArgs);
		return linker.promise;
	}

	this.executeSync = function(asyncFn){		
		var arrArgs = argsToArr.call(arguments, 1)[0];
		console.log(arrArgs)
		return asyncFn.apply(this, arrArgs);
	}
}])

app.service('AuthService', ['ngNode', function(ngNode){
	
	this.getQrcode = function(){
		return ngNode.execute(wxCookies.getQrcode, argsToArr.call(arguments));
	}

	this.checkLogin = function(){
		return ngNode.execute(wxCookies.checkLogin, argsToArr.call(arguments));
	}

	this.isLogin = function(){
		return ngNode.execute(wxCookies.isLogin, argsToArr.call(arguments));
	}

}])

app.service('DataService', function(){

	var data = {};


	this.set = function(key, value){
		data[key] = value;
	}
	this.get = function(key){
		return data[key];
	}
	this.getWx = function(key){
		return global.wx[key];
	}
})

app.service('WxService', ['ngNode', function(ngNode){
	this.getContact = function(){
		return ngNode.execute(wxApp.getContact, argsToArr.call(arguments));
	}
	this.iniWx = function(){
		return ngNode.execute(wxApp.iniWx, argsToArr.call(arguments));
	}
	this.syncWx = function(){
		return ngNode.execute(wxApp.syncWx, argsToArr.call(arguments));
	}
	this.sendMessage = function(){
		return ngNode.execute(wxApp.sendMessage, argsToArr.call(arguments));
	}
}])
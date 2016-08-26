// node-modules all in services


var cookiesApi = require('./api/cookiesApi')
var contactApi = require('./api/contactApi')

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

app.service('ContactService', ['ngNode', function(ngNode){
	this.getContact = function(){
		var arrArgs = Array.prototype.slice.call(arguments);
		return ngNode.execute(contactApi.getContact, arrArgs);
	}
}])
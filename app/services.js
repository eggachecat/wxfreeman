// node-modules all in services



var __$argsToArr = Array.prototype.slice;

(function(){
	angular
		.module("wxfreeman")
		.service("ngNode", ngNode);

	ngNode.$inject = ["$q"];

	function ngNode($q){
		this.execute = function(asyncFn){
			var linker = $q.defer();


			var arrArgs = __$argsToArr.call(arguments, 1)[0];
			arrArgs.push(function(data){
				linker.resolve(data);
			});
		
			asyncFn.apply(this, arrArgs);
			return linker.promise;
		}

		this.executeAlive = function(asyncFn){
			var linker = $q.defer();


			var arrArgs = __$argsToArr.call(arguments, 1)[0];
			arrArgs.push(function(data){
				linker.notify(data);
			});
		
			asyncFn.apply(this, arrArgs);
			return linker.promise;
		}

		this.executeSync = function(asyncFn){		
			var arrArgs = __$argsToArr.call(arguments, 1)[0];
			console.log(arrArgs)
			return asyncFn.apply(this, arrArgs);
		} 
	}
})();


(function(){

	var wxCookies = require('./api/wxCookies');
	var wxIO = require('./api/wxIO');

	angular
		.module("wxfreeman")
		.service("AuthService", AuthService);

	AuthService.$inject = ['ngNode', '$state', 'DataService'];

	function AuthService(ngNode, $state, DataService){

		this.valid = false;
		
		this.getQrcode = function(){
			return ngNode.execute(wxCookies.getQrcode, __$argsToArr.call(arguments));
		}

		this.checkLogin = function(){
			return ngNode.execute(wxCookies.checkLogin, __$argsToArr.call(arguments));
		}

		this.isLogin = function(){
			return ngNode.execute(wxCookies.isLogin, __$argsToArr.call(arguments));
		}

		this.loadConfig = function(){
			return ngNode.execute(wxIO.loadConfig, __$argsToArr.call(arguments));
		}
	}
})();

(function(){
	angular
		.module("wxfreeman")
		.service("DataService", DataService);


	function DataService(){

		var data = {};


		this.set = function(key, value){
			data[key] = value;
		}
		this.get = function(){
			return data;
		}
		this.getWx = function(key){
			return global.wx[key];
		}
	}
})();

(function(){

	var wxApp = require('./api/wxApp');

	angular
		.module("wxfreeman")
		.service("WxService", WxService);

	WxService.$inject = ['ngNode', 'AuthService', 'DataService'];


	function WxService(ngNode, AuthService, DataService){
		var getContact = this.getContact = function(){
			return ngNode.execute(wxApp.getContact, __$argsToArr.call(arguments));
		}
		var iniWx = this.iniWx = function(){
			return ngNode.execute(wxApp.iniWx, __$argsToArr.call(arguments));
		}
		this.syncWx = function(){
			return ngNode.execute(wxApp.syncWx, __$argsToArr.call(arguments));
		}
		this.sendMessage = function(){
			return ngNode.execute(wxApp.sendMessage, __$argsToArr.call(arguments));
		}

		this.getHeaderImage = function(){
			return ngNode.execute(wxApp.getHeaderImage, __$argsToArr.call(arguments));
		}

		this.changeRemarkName = function(){
			return ngNode.execute(wxApp.changeRemarkName, __$argsToArr.call(arguments));
		}

	    this.getInfo = function(callback) {
	        getContact()
	            .then(function(contactList) {
	                DataService.set("contactList", contactList["MemberList"])
	                console.log(contactList["MemberList"])
	                return iniWx()
	            })
	            .then(function(iniData) {
	                DataService.set("user", iniData["User"]);
	                callback();
	            })
	    }
	}
})();

(function(){

	var nativeService = require('./api/nativeService');

	angular
		.module("wxfreeman")
		.service("NativeService", NativeService);

	NativeService.$inject = ['ngNode'];

	function NativeService(ngNode){
	
	
		this.loadOneFile = function(){
			return ngNode.execute(nativeService.loadOneFile, __$argsToArr.call(arguments));
		}

		this.saveToFile = function(){
			return ngNode.execute(nativeService.saveToFile, __$argsToArr.call(arguments));
		}

		this.getCharMatrix = function(){
			return ngNode.executeSync(nativeService.getCharMatrix, __$argsToArr.call(arguments));
		}
	}
})();


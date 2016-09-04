// node-modules all in services

var wxCookies = require('./api/wxCookies')
var wxApp = require('./api/wxApp')
var wxIO = require('./api/wxIO')

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

app.service('AuthService', ['ngNode', '$state', 'DataService', '$cookies', function(ngNode, $state, DataService, $cookies){

	this.valid = false;
	
	this.getQrcode = function(){
		return ngNode.execute(wxCookies.getQrcode, argsToArr.call(arguments));
	}

	this.checkLogin = function(){
		return ngNode.execute(wxCookies.checkLogin, argsToArr.call(arguments));
	}

	this.isLogin = function(){
		return ngNode.execute(wxCookies.isLogin, argsToArr.call(arguments));
	}

	this.loadConfig = function(){
		return ngNode.execute(wxIO.loadConfig, argsToArr.call(arguments));
	}

	this.getCookies = function(){
		return ngNode.execute(wxIO.getCookies, argsToArr.call(arguments));
	}

	this.setCookies = function(){
		var cookies = DataService.getWx("cookies");
		angular.forEach(cookies, function(v, k){
			console.log(k,v);
			$cookies.put(k, v);
		})
	}

	

  //   try {
		// wxIO.loadConfig();
  //       wxCookies
  //           .isLogin(function(isLogin) {
		// 		this.isLogin = isLogin;
		// 		if(! this.isLogin){
		// 			console.log("not login")
		// 			$state.go("login")
		// 		} else {
  //              	 	WxService
	 //               	 	.getContact()
	 //                    .then(function(contactList) {
	 //                        DataService.set("contactList", contactList["MemberList"])
	 //                        return WxService.iniWx()
	 //                    })
	 //                    .then(function(iniData) {
	 //                        DataService.set("user", iniData["User"]);
	 //                        $state.go("app.sendMessage")
	 //                    })
		// 		}
  //           })
  //   } catch (e) {
  //   	console.log("error")
  //   	$state.go("login")
  //   }

}])

app.service('DataService', function(){

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
})

app.service('WxService', ['ngNode', 'AuthService', 'DataService', function(ngNode, AuthService, DataService){
	var getContact = this.getContact = function(){
		return ngNode.execute(wxApp.getContact, argsToArr.call(arguments));
	}
	var iniWx = this.iniWx = function(){
		return ngNode.execute(wxApp.iniWx, argsToArr.call(arguments));
	}
	this.syncWx = function(){
		return ngNode.execute(wxApp.syncWx, argsToArr.call(arguments));
	}
	this.sendMessage = function(){
		return ngNode.execute(wxApp.sendMessage, argsToArr.call(arguments));
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
}])
(function(){

	angular
		.module("wxfreeman")
		.controller("LoginCtrl", LoginCtrl);


	LoginCtrl.$inject = ['$scope', '$timeout', 'AuthService', 'WxService', 'DataService', '$state', '$http'];

	function LoginCtrl($scope, $timeout, AuthService, WxService, DataService, $state, $http){

		var vm = this;
		vm.qrcode = "";

		var forward = forward;


		try {
	    	AuthService.loadConfig();
	    	console.log(DataService.getWx("cookies"));
		    AuthService
				.isLogin()
				.then(function(result){
					console.log(DataService.getWx("cookies"));
					AuthService.valid = result;
					console.log(result)
			        if (result) {
			        	WxService.getInfo(function(){
			        		$state.go("app.sendMessage")
			        	})
			        } else {
			        	iniLogin();
			        }
				})
	    } catch (e) {
	    	iniLogin();
	    }

	    function iniLogin(){	 
	    		    	console.log("22211")

	 		AuthService
				.getQrcode()
				.then(function(qrcode){
					var uuid = qrcode["uuid"];			
					vm.qrcode = `http://login.weixin.qq.com/qrcode/${uuid}`
			
					return AuthService.checkLogin(uuid)
				})
				.then(function(){ 
						return WxService.getContact()
				})
				.then(function(contactList){
					DataService.set("contactList", contactList["MemberList"])
					return WxService.iniWx()
				})
		 		.then(function(iniData){
		 			DataService.set("user", iniData["User"]);
		 			AuthService.valid = true;
		 			$state.go("app.sendMessage")
		 		})
	 	}
		
	 	
	 	function forward(){
	 		$state.go("app.sendMessage")
	 	}
	}

})();
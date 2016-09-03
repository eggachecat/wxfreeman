
app.controller('LoginCtrl', ['$scope', '$timeout', 'AuthService', 'WxService', 'DataService', '$state', function($scope, $timeout, AuthService, WxService, DataService, $state){

	$scope.qrcode = "";
 
	AuthService
		.getQrcode()
		.then(function(qrcode){
			var uuid = qrcode["uuid"];			
			$scope.qrcode = `http://login.weixin.qq.com/qrcode/${uuid}`
	
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
 			AuthService.isLogin = true;
 			$state.go("app.sendMessage")
 		})
 	
 	$scope.go = function(){
 		$state.go("app.sendMessage")
 	}
}])

app.controller('SendMessageCtrl', ['$scope', '$state', 'DataService', 'WxService', function($scope, $state, DataService, WxService){

	$scope.data = DataService.get();
	
	$scope.contactList = $scope.data["contactList"];
	$scope.user = $scope.data["user"];
	$scope.messages = $scope.data["messages"] || {};

	// var tmp = require("./api/wxIO");
	// tmp.loadConfig();
	WxService.syncWx(function(data){
		console.log("new messages comming!!", data)
	})
	// .then(function(data){
	// 	console.log(data);
	// }, function(data){
	// 	console.log(data);
	// }, function(data){
	// 	console.log(data);
	// })

	console.log($scope.contactList, $scope.user)
	
	$scope.goBack = function(){
		$state.go("login")
	}

	$scope.sendMessage = function(msg, target){
		WxService
			.sendMessage(msg,target)
			.then(function(ret){
				console.log(ret);
			})
	}

	$scope.sendAllMessage = function(){
		angular.forEach($scope.contactList, function(contact){

			var remarkName = contact["RemarkName"];
			var msgObj = $scope.messages[remarkName]

			if(msgObj){
				console.log(msgObj, contact["UserName"])
				var msg = msgObj["message"]
				WxService
				.sendMessage(msg, contact["UserName"])
				.then(function(ret){
					console.log(ret);
				})
			}
		})
	}
 
}])

app.controller('NavCtrl', ['$scope', '$state', function($scope, $state){
	console.log("i am here")
	$scope.navigation = [
		
		{ state: "app.sendMessage" }
	

	];
	$scope.stateNameTable = {
		"app.sendMessage": "信息"
	}
	$scope.current = $state.current.name;
}])
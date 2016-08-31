
app.controller('LoginCtrl', ['$scope', '$timeout', 'AuthService', 'WxService', 'DataService', '$state', function($scope, $timeout, AuthService, WxService, DataService, $state){

	$scope.qrcode = "";
 
	// AuthService
	// 	.getQrcode()
	// 	.then(function(qrcode){
	// 		var uuid = qrcode["uuid"];			
	// 		$scope.qrcode = `http://login.weixin.qq.com/qrcode/${uuid}`
	
	// 		return AuthService.checkLogin(uuid)
	// 	})
	// 	.then(function(){ 
	// 			return WxService.getContact()
	// 	})
	// 	.then(function(contactList){
	// 		DataService.set("contactList", contactList["MemberList"])
	// 		return WxService.iniWechat()
	// 	})
	// 	// .then(function(){
	// 	// 	return WxService.wxSync()
	// 	// })
 // 		.then(function(iniData){
 // 			console.log(iniData["User"])
 // 			WxService.saveConfig();
 // 			DataService.set("user", iniData["User"])
 // 			$state.go("app.sendMessage")
 // 		})



	WxService.getContact()
		.then(function(contactList){
			console.log(contactList)
			DataService.set("contactList", contactList["MemberList"])
			return WxService.iniWechat()
		})
		// .then(function(){
		// 	return WxService.wxSync()
		// })
 		.then(function(iniData){
 			console.log(iniData)
 			DataService.set("user", iniData["User"])
 			// $state.go("app.sendMessage")
 		})

 	$scope.go = function(){
 		$state.go("app.sendMessage")
 	}
}])

app.controller('SendMessageCtrl', ['$scope', '$state', 'DataService', 'WxService', function($scope, $state, DataService, WxService){
	
	$scope.contactList = DataService.get("contactList");
	$scope.user = DataService.get("user");
	$scope.messages = DataService.get("messages");
	console.log($scope.messages, $scope.messages)

	console.log($scope.contactList, $scope.user)
	
	$scope.goBack = function(){
		$state.go("login")
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
		"app.sendMessage": "发送信息"
	}
	$scope.current = $state.current.name;
}])

app.controller('LoginCtrl', ['$scope', '$timeout', 'AuthService', 'WxService', 'DataService', '$state', '$http', function($scope, $timeout, AuthService, WxService, DataService, $state, $http){

	$scope.qrcode = "";
 
 	$scope.$on("not-login", function(){
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
	 			AuthService.valid = true;
	 			$state.go("app.sendMessage")
	 		})
 	})
	
 	
 	$scope.go = function(){
 		$state.go("app.sendMessage")
 	}
}])

app.controller('SendMessageCtrl', ['$scope', '$state', 'DataService', 'WxService', 'NativeService', '$mdDialog', function($scope, $state, DataService, WxService, NativeService, $mdDialog){

	$scope.data = DataService.get();
	
	$scope.contactList = $scope.data["contactList"];
	$scope.user = $scope.data["user"];
	$scope.messages = $scope.data["messages"] || {};


	$scope.repeatRobot = {}
	$scope.inverseRobot = {}

	// var tmp = require("./api/wxIO");
	// tmp.loadConfig();
	WxService.syncWx(function(data){
		var data = JSON.parse(data)
		console.log("new messages comming!!", data)
		angular.forEach(data["AddMsgList"], function(obj){
			var src = obj["FromUserName"];
			console.log(src, $scope.repeatRobot[src], obj["Content"])
			if($scope.repeatRobot[src]){
				$scope.sendMessage(obj["Content"], src);
			}
			if($scope.inverseRobot[src]){
				$scope.sendMessage(obj["Content"].split("").reverse().join(""), src);
			}
		})
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

	$scope.saveContactList = function(){
		var fs = require("fs");
		fs.writeFileSync("contactList.json", JSON.stringify($scope.contactList))
	}

	$scope.getHeaderImage = function(contact){
		WxService.getHeaderImage(contact.HeadImgUrl).then(function(base64Image){
			contact.src = base64Image;
		})
	}

	$scope.loadMessages = function(){
		NativeService
			.loadOneFile()
			.then(function(data){
				$scope.messages = data;
			})
	}

	$scope.saveMessages = function(){
		NativeService.saveToFile($scope.messages)
	}

	// function getAllImages(){
	// 	angular.forEach($scope.contactList, function(contact){
	// 		if(contact.KeyWord != 'gh_'){
	// 			WxService.getHeaderImage(contact.HeadImgUrl).then(function(base64Image){
	// 				contact.src = base64Image;
	// 			})
	// 		}
	// 	})
	// }

	// getAllImages();

	$scope.sendAllMessage = function(){
		angular.forEach($scope.contactList, function(contact){
			if(msg = $scope.messages[contact["NickName"]]){
				console.log(msg)
				$scope.sendMessage(msg, contact["UserName"]);
			}
		})
	}

	$scope.addMessagesToAll = function(ev){
		 var confirm = $mdDialog.prompt()
	      .title('标准化信息')
	      .textContent('{{R}} -> RemarkName 或者 {{N}} -> NickName')
	      .placeholder('信息')
	      .ariaLabel('信息')
	      .targetEvent(ev)
	      .ok('确认')
	      .cancel('取消');

	    $mdDialog.show(confirm).then(function(result) {
	      addMessages(result || "")
	    }, function() {
	      console.log("canceled")
	    });
	}


	function addMessages(content){
		console.log("!!!!")
		angular.forEach($scope.contactList, function(contact){

			var value = content.replace("{{R}}", contact.RemarkName || contact.NickName)
								.replace("{{N}}", contact.NickName || contact.RemarkName);
			$scope.messages[contact.NickName] = value;
		})
	}
 
}])

app.controller('NavCtrl', ['$scope', '$state', function($scope, $state){
	console.log("i am here")
	$scope.navigation = [
		
		{ state: "app.sendMessage" }
	

	];
	$scope.stateNameTable = {
		"app.sendMessage": "群发"
	}
	$scope.current = $state.current.name;
}])
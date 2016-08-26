
app.controller('SendMessageCtrl', ['$scope', '$timeout', 'AuthService', 'ContactService', function($scope, $timeout, AuthService, ContactService){

	$scope.qrcode = "";


	AuthService
		.getQrcode()
		.then(function(qrcode){
			var uuid = qrcode["uuid"];			
			$scope.qrcode = `http://login.weixin.qq.com/qrcode/${uuid}`
	
			return AuthService.checkLogin(uuid)
		})
		.then(function(data){
				return ContactService.getContact()
		})
		.then(function(data){
			console.log(data)
		})
 


	$scope.welcome = "Hello world";
}])

app.controller('LoginCtrl', ['$scope', '$state', function($scope, $state){
	
	$scope.qrcode = "";

	AuthService.getQrcode().then(function(qrcode){
		var uuid = qrcode["uuid"];
		
		$scope.qrcode = `http://login.weixin.qq.com/qrcode/${uuid}`
		console.log($scope.qrcode)
		AuthService.checkLogin(uuid).then(function(){
			$state.go("'app.sendMessage");
		});	
	})
 
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
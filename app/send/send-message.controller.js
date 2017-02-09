(function(){
	angular
		.module("wxfreeman")
		.controller('SendMessageCtrl', SendMessageCtrl);

	SendMessageCtrl.$inject = ['$scope', '$state', 'DataService', 'WxService', 'NativeService', '$mdDialog', '$interval', '$timeout', 'SendService'];

	function SendMessageCtrl($scope, $state, DataService, WxService, NativeService, $mdDialog, $interval, $timeout, SendService){


		var vm = this;
//variables
		vm.alive = {alive : false}

		vm.data = DataService.get();
		
		vm.contactList = vm.data["contactList"];
		vm.user = vm.data["user"];
		vm.text_array = vm.data["text_array"] || {};
		vm.led_array = {};


		vm.repeatRobot = {}
		vm.inverseRobot = {}


//methods

		var sendLed = vm.sendLed = SendService.sendLed;
		var sendText = vm.sendText = SendService.sendText;


		vm.goBack = goBack;

		vm.sendAllText = sendAllText;
		vm.sendAllLed = sendAllLed;

		vm.addTextToAllDialog = addTextToAllDialog;

		vm.saveContactList = saveContactList;

		vm.getHeaderImage = getHeaderImage;
		vm.getAllImages = getAllImages;

		
		vm.saveMessages = saveMessages;
		vm.loadMessages = loadMessages;

		vm.beOrNotToBe = beOrNotToBe;


		vm.changeRemarkNameDialog = changeRemarkNameDialog;


		function sendAllText(){
			var sendObjArr = SendService.prepareToSend(vm.text_array, vm.contactList, "NickName", "UserName");
			console.log(sendObjArr)
			SendService.sendToAll(sendText, sendObjArr);
		}

		function sendAllLed(){
			var sendObjArr = SendService.prepareToSend(vm.led_array, vm.contactList, "NickName", "UserName", "content");
			console.log(sendObjArr)
			SendService.sendToAll(sendLed, sendObjArr);
		}

		function changeRemarkNameDialog(ev, user){

			var remarkName = user.RemarkName;
			var confirm = $mdDialog.prompt()
		      	.title('新备注')
				.textContent('填入新备注确认，我在做什么？')
		      	.placeholder('Nick Name')
		      	.ariaLabel('新备注')
		    	.initialValue(remarkName)
		      	.targetEvent(ev)
		      	.ok('确认')
		      	.cancel('取消');

		    $mdDialog.show(confirm).then(function(remarkName) {
				changeRemarkName(remarkName, user);
		    }, function() {
		      console.log("canceled")
		    });
		}

		function changeRemarkName(remarkName, user){
			WxService.changeRemarkName(remarkName, user.UserName, function(res){
				if(res.BaseResponse.Ret == 0){
					$scope.$apply(function(){
						user.RemarkName = remarkName;
					})
				}
			})
		}


		function syncWechat(){
			WxService.syncWx(function(data){
				var data = JSON.parse(data);
				angular.forEach(data["AddMsgList"], function(obj){
					console.log(obj)
					var src = obj["FromUserName"];
					if(vm.repeatRobot[src]){
						sendText(obj["Content"], src);
					}
					if(vm.inverseRobot[src]){
						sendText(obj["Content"].split("").reverse().join(""), src);
					}
				})
			})
		}
		syncWechat();
	
		
		function goBack(){
			$state.go("login")
		}

	
		function saveContactList(){
			var fs = require("fs");
			fs.writeFileSync("contactList.json", JSON.stringify(vm.contactList))
		}

		function getHeaderImage(contact){
			WxService.getHeaderImage(contact.HeadImgUrl).then(function(base64Image){
				contact.src = base64Image;
			})
		}

		function loadMessages(){
			NativeService
				.loadOneFile()
				.then(function(data){
					vm.text_array = data.text;
					vm.led_array = data.led_array;
				})
		}

		function mergeContentObjects(obj1, obj2){
			var obj = {};

			angular.forEach(obj1, function(contact){})
		}

		function saveMessages(){
			NativeService.saveToFile({
				"text":	vm.text_array,
				"led_array": vm.led_array
			})
		}

		

		function keepAlive(){
			var _keepAlive = function(){
				sendText("keep-alive", vm.user["UserName"])
			}

			vm.alive.promise = $interval(_keepAlive, 120000);// two minutes
			vm.alive.alive = true;

		}

		function finishMyLife(){
			$interval.cancel(vm.alive.promise);
			vm.alive.alive = false;
		}

		function beOrNotToBe(){
			if(!vm.alive.alive){
				keepAlive();
			}else{
				finishMyLife();
			}
		}


		function getAllImages(){
			angular.forEach(vm.contactList, function(contact){
				if(contact.KeyWord != 'gh_'){
					WxService.getHeaderImage(contact.HeadImgUrl).then(function(base64Image){
						contact.src = base64Image;
					})
				}
			})
		}


		function addTextToAllDialog(ev){
			 var confirm = $mdDialog.prompt()
		      .title('标准化信息')
		      .textContent('{{R}} -> RemarkName 或者 {{N}} -> NickName')
		      .placeholder('信息')
		      .ariaLabel('信息')
		      .targetEvent(ev)
		      .ok('确认')
		      .cancel('取消');

		    $mdDialog.show(confirm).then(function(result) {
		    	console.log(result)
		      	addTextToAll(result || "")
		    }, function() {
		      console.log("canceled")
		    });
		}


		function addTextToAll(content){
			angular.forEach(vm.contactList, function(contact){



				var value = content.replace(/\{\{\R\}\}/g, contact.RemarkName || contact.NickName)
									.replace(/\{\{\N\}\}/g, contact.NickName || contact.RemarkName);
				vm.text_array[contact.NickName] = value;
			})
		}
	 
	}
})();
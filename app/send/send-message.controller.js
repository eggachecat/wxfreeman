(function(){
	angular
		.module("wxfreeman")
		.controller('SendMessageCtrl', SendMessageCtrl);

	SendMessageCtrl.$inject = ['$scope', '$state', 'DataService', 'WxService', 'NativeService', '$mdDialog', '$interval', '$timeout'];

	function SendMessageCtrl($scope, $state, DataService, WxService, NativeService, $mdDialog, $interval, $timeout){


		var vm = this;
//variables
		vm.alive = {alive : false}

		vm.data = DataService.get();
		
		vm.contactList = vm.data["contactList"];
		vm.user = vm.data["user"];
		vm.messages = vm.data["messages"] || {};


		vm.repeatRobot = {}
		vm.inverseRobot = {}


//methods
		vm.goBack = goBack;

		vm.sendMessage = sendMessage;
		vm.sendAllMessage = sendAllMessage;
		vm.addMessagesToAll = addMessagesToAll;

		vm.saveContactList = saveContactList;

		vm.getHeaderImage = getHeaderImage;
		vm.getAllImages = getAllImages;

		
		vm.saveMessages = saveMessages;
		vm.loadMessages = loadMessages;

		vm.beOrNotToBe = beOrNotToBe;
	

		function syncWechat(){
			WxService.syncWx(function(data){
				var data = JSON.parse(data);
				angular.forEach(data["AddMsgList"], function(obj){
					var src = obj["FromUserName"];
					if(vm.repeatRobot[src]){
						sendMessage(obj["Content"], src);
					}
					if(vm.inverseRobot[src]){
						sendMessage(obj["Content"].split("").reverse().join(""), src);
					}
				})
			})
		}
		syncWechat();
	
		
		function goBack(){
			$state.go("login")
		}

		function sendMessage(msg, target){
			WxService
				.sendMessage(msg,target)
				.then(function(ret){
					console.log(ret);
				})
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
					vm.messages = data;
				})
		}

		function saveMessages(){
			NativeService.saveToFile(vm.messages)
		}

		

		function keepAlive(){
			var _keepAlive = function(){
				sendMessage("keep-alive", vm.user["UserName"])
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


		function sendAllMessage(){

			var timePoint = 0;
			angular.forEach(vm.contactList, function(contact){

				if(msg = vm.messages[contact["NickName"]]){

					$timeout(function(_msg, _target){
						sendMessage(_msg, _target);
					}, timePoint, true, msg, contact["UserName"]);

					timePoint += 100;
				}
			})
		}

		function addMessagesToAll(ev){
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
		      addMessages(result || "")
		    }, function() {
		      console.log("canceled")
		    });
		}


		function addMessages(content){
			angular.forEach(vm.contactList, function(contact){

				var value = content.replace("{{R}}", contact.RemarkName || contact.NickName)
									.replace("{{N}}", contact.NickName || contact.RemarkName);
				vm.messages[contact.NickName] = value;
			})
		}
	 
	}
})();
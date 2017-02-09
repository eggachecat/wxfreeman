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
		this.iniWx_V2 = function(){
			return ngNode.execute(wxApp.iniWx_V2, __$argsToArr.call(arguments));
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

(function(){

	angular
		.module("wxfreeman")
		.service("SendService", SendService);

	SendService.$inject = ['WxService', '$q', 'NativeService', '$timeout'];

	function SendService(WxService, $q, NativeService, $timeout){



		this.sendText = sendText;
		this.sendLed = sendLed;
		this.prepareToSend = prepareToSend;
		this.sendToAll = sendToAll;


		function generateLed(led_item){

			var leds = [];
			var content = led_item.content;
			var symbol = led_item.symbol || "[呲牙]";
			for (var i = 0; i < content.length; i++) {

				var char = content[i];
				var charMatrix = NativeService.getCharMatrix(char);

				var str = "";
				for (var h = 0; h < charMatrix.height; h++) {
					for (var w = 0; w < charMatrix.width; w++) {
						if(charMatrix.map[[h, w]]){
							str += symbol;
						}else{
							str += "     ";
						}
					}
					str += "\n";
				}
				leds.push(str);
			}

			return leds;
		}



		function sendInOrder(sendFunc, content_queue, target, index){

			index = index || 0;
			var content = content_queue[index];

			if(content){
				sendFunc(content, target, function(){
					return sendInOrder(sendFunc, content_queue, target, index + 1);
				}, function(){
					console.log("Error occurred when send to [", target, "] with content [", content, "]");
					return ;
				})
			} else {
				return;
			}
		}

		function prepareToSend(content_queue, contact_queue, connect_key, target_key, content_sub_key){

			var sendObjArr = [];

			angular.forEach(contact_queue, function(contact){

				var index = contact[connect_key];
				var content = content_queue[index];
				var target = contact[target_key];

				if(content && target){

					var has_real_content = true;
					if(content_sub_key){
						if(!content[content_sub_key]){
							has_real_content = false;
						}
					}

					if(has_real_content){
						sendObjArr.push({
							"content": content,
							"target": target
						})
					}
				}
			}) 

			return sendObjArr;
		}
		/*
			@paramters
				index: the key that conmnect content_queue to target_queue
		*/

		function sendToAll(sendFunc, sendObjArr, time_step){


			time_step = time_step || 100;
			
			var timePoint = 0;

			angular.forEach(sendObjArr, function(obj){

			
				var content = obj.content;
				var target = obj.target;

				if(content && target){

					$timeout(function(_c, _t){
						sendFunc(_c, _t);
					}, timePoint, true, content, target);

					timePoint += time_step;
				}
			})
		}

		function sendText(msg, target, onSuccess, onFailed){
			WxService
				.sendMessage(msg, target)
				.then(function(ret){
					
					var err = !! JSON.parse(ret).BaseResponse.Ret;
					if(err){
						console.log("Failed to send to [", target, "] with text [", msg, "] !!!!");
						if(onFailed){
							onFailed();
						}
					}else{
						console.log("Managed to send to [", target, "] with text [", msg, "] !!!!");
						if(onSuccess){
							onSuccess();
						}
					}

				})
		}

		function sendLed(led_item, target){


			if(!led_item.content){
				console.log("empty content");
				return;
			}

			var led_queue = generateLed(led_item);
			return sendInOrder(sendText, led_queue, target);
		}

	}
})();
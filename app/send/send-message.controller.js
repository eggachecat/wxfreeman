angular
    .module("wxfreeman.message", [])
    .controller('SendMessageCtrl', function ($scope, $state, $filter, DataService, WxService, NativeService, $mdDialog, $interval, $timeout, SendService) {


        var vm = this;
//variables


        function chunk(arr, size) {
            var newArr = [];
            for (var i = 0; i < arr.length; i += size) {
                newArr.push(arr.slice(i, i + size));
            }
            return newArr;
        }

        // function preprocessContactList(contactList) {
        //     var _contactList = [];
        //     angular.forEach(contactList, function (k, v) {
        //         if (!v.hasOwnProperty('priority')) {
        //             v['priority'] = 0;
        //         }
        //         _contactList.push(v);
        //     })
        //     console.log(_contactList)
        //     return _contactList;
        // }


        $scope.keepUser = true;

        $scope.alive = {alive: false};

        $scope.data = DataService.get();

        $scope.timingMission = {};

        $scope.contactList = $scope.data["contactList"];


        $scope.user = $scope.data["user"];
        $scope.text_array = $scope.data["text_array"] || {};
        $scope.led_array = {};
        $scope.delay_time = {};

        $scope.repeatRobot = {};
        $scope.inverseRobot = {};
        $scope.priority_array = {};


        var startSetTimingMission = $scope.startSetTimingMission = false;
        var timingMission_array = $scope.timingMission_array = {};

//methods

        var sendLed = $scope.sendLed = SendService.sendLed;
        var sendText = $scope.sendText = SendService.sendText;
        
        $scope.sendTextQuick = function (contact) {
            sendText($scope.text_array[contact.NickName], contact.UserName);
            contact.priority = -1
        };

        $scope.goBack = goBack;

        $scope.sendAllText = sendAllText;
        $scope.sendAllLed = sendAllLed;

        $scope.addTextToAllDialog = addTextToAllDialog;

        $scope.saveContactList = saveContactList;

        $scope.getHeaderImage = getHeaderImage;
        $scope.getAllImages = getAllImages;


        $scope.saveMessages = saveMessages;
        $scope.loadMessages = loadMessages;

        $scope.SetTimingMissionStart = SetTimingMissionStart;
        $scope.SetTimingMissionEnd = SetTimingMissionEnd;


        $scope.beOrNotToBe = beOrNotToBe;


        $scope.changeRemarkNameDialog = changeRemarkNameDialog;
        $scope.changeChatroomNameDialog = changeChatroomNameDialog;

        $scope.test_id = [];
        $scope.test = test;

        function test(ctr, times) {

            var testTextArr = [];
            var prefix = +new Date();
            for (var i = 0; i < times; i++) {
                testTextArr.push({
                    "content": String(prefix) + '-' + String(i),
                    "target": $scope.test_id[i % ctr]
                })
            }

            var testLedArr = [];
            for (var i = 0; i < times; i++) {
                testLedArr.push({
                    "content": {
                        "content": String(i),
                        "symbol": "[福]"
                    },
                    "target": $scope.test_id[i % ctr]
                })
            }

            console.log(testLedArr);
            // SendService.sendAllInOrder(SendService.sendTextWithGap, testArr, 200);

            // SendService.sendAllInOrderWithDelay(sendText, testTextArr, 200);
            SendService.sendAllInOrder(sendLed, testLedArr, 200);

            // SendService.sendToAll(sendText, testArr, );

        }

        $scope.isLegalTime = function (timeStr) {
            try {
                var date = timeStr.split(" ")[0];
                var time = timeStr.split(" ")[1];


                var year = date.split("-")[0];
                var month = date.split("-")[1];
                var day = date.split("-")[2];
                var hour = time.split(":")[0];
                var minute = time.split(":")[1];
                var second = time.split(":")[2];

                if (typeof year === 'undefined' ||
                    typeof month === 'undefined' ||
                    typeof day === 'undefined' ||
                    typeof hour === 'undefined' ||
                    typeof minute === 'undefined' ||
                    typeof second === 'undefined'){
                    return false;
                }


                if (2017 <= parseInt(year, 10)
                    && 0 <= parseInt(month, 10) <= 12
                    && 0 <= parseInt(day, 10) <= 30
                    && 0 <= parseInt(hour, 10) <= 12
                    && 0 <= parseInt(minute, 10) <= 60
                    && 0 <= parseInt(second, 10) <= 60) {
                    return true;
                } else {
                    return false;
                }

            }
            catch (err) {
                return false;
            }
        }

        $scope.delaySendText = function (contact, timeStr) {
            var targetTime = new Date(timeStr);
            _timeout = targetTime - Date.now();
            if (_timeout < 0) {
                sendText($scope.text_array[contact.NickName], contact.UserName);
            } else {
                $timeout(function () {
                    sendText($scope.text_array[contact.NickName], contact.UserName);
                }, _timeout)
            }
        }

        $scope.delayChangeChatroomNameDialog = function (ev, chatroom, timeStr) {

            var targetTime = new Date(timeStr);
            _timeout = targetTime - Date.now();

            console.log(chatroom)
            var remarkName = chatroom.NickName;
            var confirm = $mdDialog.prompt()
                .title('新聊天室名称')
                .textContent('填入新聊天室名称确认，我在做什么？')
                .placeholder('Topic')
                .ariaLabel('New Topic')
                .initialValue(remarkName)
                .targetEvent(ev)
                .ok('确认')
                .cancel('取消');

            $mdDialog.show(confirm).then(function (remarkName) {
                if (_timeout < 0) {
                    changeChatroomName(remarkName, chatroom);
                } else {
                    $timeout(function () {
                        changeChatroomName(remarkName, chatroom);
                    }, _timeout)
                }
            }, function () {
                console.log("canceled")
            });
        }


        $scope.sendAll = sendAll;

        function sendAll(times) {

            var timePoint = 0;

            // var _contactList = $scope.contactList;

            var _contactList = [];
            for (var i = 0; i < times; i++) {
                _contactList.push({
                    "UserName": $scope.test_id[0],
                    "NickName": "瑶瑶"
                })
            }

            angular.forEach(_contactList, function (contact) {

                var _key = contact["NickName"];

                var textItem = $scope.text_array[_key];
                var ledItem = $scope.led_array[_key];
                var target = contact["UserName"];

                $timeout(function (_textItem, _target) {
                    sendText(textItem, _target);
                }, timePoint, true, textItem, target);

                $timeout(function (_ledItem, _target) {
                    if (!!_ledItem) {
                        sendLed(_ledItem, _target);
                    }
                }, timePoint, true, ledItem, target);

                timePoint += 1000;
            })
        }

        $scope.addPriority = function (contact) {
            contact.priority += 1;
        };

        $scope.minusPriority = function (contact) {
            contact.priority -= 1;
        };

        function sendAllText() {
            var sendObjArr = SendService.prepareToSend($scope.text_array, $scope.contactList, "NickName", "UserName");
            console.log(sendObjArr)
            // SendService.sendToAll(sendText, sendObjArr);
        }

        function sendAllLed() {
            var sendObjArr = SendService.prepareToSend($scope.led_array, $scope.contactList, "NickName", "UserName", "content");
            console.log(sendObjArr)
            // SendService.sendToAll(sendLed, sendObjArr);
        }

        function changeRemarkNameDialog(ev, user) {

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

            $mdDialog.show(confirm).then(function (remarkName) {
                changeRemarkName(remarkName, user);
            }, function () {
                console.log("canceled")
            });
        }

        function changeRemarkName(remarkName, user) {
            console.log(remarkName, user.UserName)
            WxService.changeRemarkName(remarkName, user.UserName, function (res) {
                if (res.BaseResponse.Ret == 0) {
                    $scope.$apply(function () {
                        user.RemarkName = remarkName;
                    })
                }
            })
        }

        function changeChatroomNameDialog(ev, chatroom) {
            console.log(chatroom)
            var remarkName = chatroom.NickName;
            var confirm = $mdDialog.prompt()
                .title('新聊天室名称')
                .textContent('填入新聊天室名称确认，我在做什么？')
                .placeholder('Topic')
                .ariaLabel('New Topic')
                .initialValue(remarkName)
                .targetEvent(ev)
                .ok('确认')
                .cancel('取消');

            $mdDialog.show(confirm).then(function (remarkName) {
                changeChatroomName(remarkName, chatroom);
            }, function () {
                console.log("canceled")
            });
        }

        function changeChatroomName(remarkName, user) {
            console.log(remarkName, user.UserName)
            WxService.changeChatroomName(remarkName, user.UserName, function (res) {
                if (res.BaseResponse.Ret === 0) {
                    $scope.$apply(function () {
                        user.RemarkName = remarkName;
                    })
                }
            })
        }

        function syncWechat() {
            WxService.syncWx(function (data) {
                var data = JSON.parse(data);
                angular.forEach(data["AddMsgList"], function (obj) {
                    console.log(obj);
                    var src = obj["FromUserName"];
                    if ($scope.repeatRobot[src]) {
                        sendText(obj["Content"], src);
                    }
                    if ($scope.inverseRobot[src]) {
                        sendText(obj["Content"].split("").reverse().join(""), src);
                    }
                })
            })
        }

        syncWechat();


        function goBack() {
            $state.go("login")
        }


        function saveContactList() {
            var fs = require("fs");
            fs.writeFileSync("contactList.json", JSON.stringify($scope.contactList))
        }

        function getHeaderImage(contact) {
            WxService.getHeaderImage(contact.HeadImgUrl).then(function (base64Image) {
                contact.src = base64Image;
            })
        }

        function loadMessages() {
            NativeService
                .loadOneFile()
                .then(function (data) {
                    $scope.text_array = data.text;
                    $scope.led_array = data.led_array;
                })
        }

        function saveMessages() {
            NativeService.saveToFile({
                "text": $scope.text_array,
                "led_array": $scope.led_array
            })
        }

        $scope.loadPriority = loadPriority;
        function loadPriority() {
            NativeService
                .loadOneFile()
                .then(function (data) {
                    var priority_obj = data.priority_obj;
                    for (var i = 0; i < $scope.contactList.length; i++) {
                        $scope.contactList[i].priority = priority_obj[$scope.contactList[i].UserName];
                    }
                })
        }

        $scope.savePriority = savePriority;
        function savePriority() {
            var priorityContactList = $filter('priorityFilter')($scope.contactList);
            var priority_obj = {};
            for (var i = 0; i < priorityContactList.length; i++) {
                var contact = priorityContactList[i];
                priority_obj[contact.UserName] = contact.priority;
            }
            console.log(priority_obj)
            NativeService.saveToFile({
                "priority_obj": priority_obj
            })
        }

        function mergeContentObjects(obj1, obj2) {
            var obj = {};

            angular.forEach(obj1, function (contact) {
            })
        }




        function keepAlive() {
            var _keepAlive = function () {
                sendText("keep-alive", $scope.user["UserName"])
            }

            $scope.alive.promise = $interval(_keepAlive, 120000);// two minutes
            $scope.alive.alive = true;

        }

        function finishMyLife() {
            $interval.cancel($scope.alive.promise);
            $scope.alive.alive = false;
        }

        function beOrNotToBe() {
            if (!$scope.alive.alive) {
                keepAlive();
            } else {
                finishMyLife();
            }
        }


        function getAllImages() {
            angular.forEach($scope.contactList, function (contact) {
                if (contact.KeyWord != 'gh_') {
                    WxService.getHeaderImage(contact.HeadImgUrl).then(function (base64Image) {
                        contact.src = base64Image;
                    })
                }
            })
        }


        function addTextToAllDialog(ev) {
            var confirm = $mdDialog.prompt()
                .title('标准化信息')
                .textContent('{{R}} -> RemarkName 或者 {{N}} -> NickName')
                .placeholder('信息')
                .ariaLabel('信息')
                .targetEvent(ev)
                .ok('确认')
                .cancel('取消');

            $mdDialog.show(confirm).then(function (result) {
                console.log(result)
                addTextToAll(result || "")
            }, function () {
                console.log("canceled")
            });
        }

        function addLedToAllDialog(ev) {
            var confirm = $mdDialog.prompt()
                .title('标准化信息')
                .textContent('{{R}} -> RemarkName 或者 {{N}} -> NickName')
                .placeholder('信息')
                .ariaLabel('信息')
                .targetEvent(ev)
                .ok('确认')
                .cancel('取消');

            $mdDialog.show(confirm).then(function (result) {
                console.log(result)
                addTextToAll(result || "")
            }, function () {
                console.log("canceled")
            });
        }


        function addTextToAll(content) {
            angular.forEach($scope.contactList, function (contact) {
                var value = content.replace(/\{\{\R\}\}/g, contact.RemarkName || contact.NickName)
                    .replace(/\{\{\N\}\}/g, contact.NickName || contact.RemarkName);
                $scope.text_array[contact.NickName] = value;
            })
        }

        function addLedToAll(content) {
            angular.forEach($scope.contactList, function (contact) {
                var value = content.replace(/\{\{\R\}\}/g, contact.RemarkName || contact.NickName)
                    .replace(/\{\{\N\}\}/g, contact.NickName || contact.RemarkName);
                $scope.text_array[contact.NickName] = value;
            })
        }

        function SetTimingMissionStart() {
            $scope.startSetTimingMission = true;
            return 0;
        }

        function SetTimingMissionEnd() {
            $scope.startSetTimingMission = false;
            $scope.timingMission_array["2333"] = {
                "text_array": $scope.text_array,
                "led_array": $scope.led_array
            }
            return 0;
        }
    });







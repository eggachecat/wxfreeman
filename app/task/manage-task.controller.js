(function() {
    angular
        .module("wxfreeman")
        .controller('ManageTaskCtrl', ManageTaskCtrl);

    ManageTaskCtrl.$inject = ['$scope', '$state', 'DataService', 'WxService', 'NativeService', '$mdDialog', '$interval', '$timeout', 'SendService'];

    function ManageTaskCtrl($scope, $state, DataService, WxService, NativeService, $mdDialog, $interval, $timeout, SendService) {
        var vm = this;
        console.log("???????????")
    }
})();
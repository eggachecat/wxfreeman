angular
    .module("wxfreeman.nav", [])
    .controller('NavCtrl', function ($scope, $state) {

        $scope.navigation = [
            {state: "app.sendMessage"},
            {state: "app.manageTask"}
        ];

        $scope.stateNameTable = {
            "app.sendMessage": "群发",
            "app.manageTask": "管理任务"
        };

        $scope.navigateTo = function (state) {
            $scope.current = state;
            $state.go(state);
        }

        $scope.current = $state.current.name;
    });




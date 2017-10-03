(function(){

	angular
		.module("wxfreeman")
		.controller('NavCtrl', NavCtrl);

	NavCtrl.$inject = ['$scope', '$state'];

	function NavCtrl($scope, $state){

		var vm = this;

		vm.navigation = [
			{ state: "app.sendMessage" },
			{ state: "app.manageTask" }
		];

		vm.stateNameTable = {
			"app.sendMessage": "群发",
			"app.manageTask": "管理任务"
		};

		vm.navigateTo = function(state){
			vm.current = state;
			$state.go(state);
		}

		vm.current = $state.current.name;
	}
})();
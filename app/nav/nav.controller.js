(function(){

	angular
		.module("wxfreeman")
		.controller('NavCtrl', NavCtrl);

	NavCtrl.$inject = ['$scope', '$state'];

	function NavCtrl($scope, $state){

		var vm = this;

		vm.navigation = [
			
			{ state: "app.sendMessage" }
		

		];

		vm.stateNameTable = {
			"app.sendMessage": "群发"
		};

		vm.current = $state.current.name;
	}
})();
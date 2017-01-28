
(function(){
	angular
		.module("wxfreeman", [
			'ngAnimate', 
			"ui.router", 
			'ngMaterial'
		]);
})();

(function(){
	angular
		.module("wxfreeman")
		.config(config);

	function config($stateProvider, $urlRouterProvider, $mdThemingProvider, $locationProvider, $httpProvider, $compileProvider) {

		$httpProvider.defaults.withCredentials = true;

		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);

		$mdThemingProvider.theme('docs-dark', 'default')
	      .primaryPalette('yellow')
	      .backgroundPalette('light-blue')
	      .dark();

	    $mdThemingProvider.theme("success-toast")
	    $mdThemingProvider.theme("error-toast")


		$urlRouterProvider.otherwise("/login");

		// $locationProvider.html5Mode({ enabled: true, requireBase: false });

	
		var TEMPLATE_ROOT_DIR = `./app/`

		$stateProvider
	    	.state('login', {
				url: "/login",
				controller: "LoginCtrl",
				controllerAs: "loginViewModel",
				templateUrl: TEMPLATE_ROOT_DIR +"login/login.html"
		    })
		    .state('app', {
		    	url: "/app",
		    	abstract: true,
		    	controller: "NavCtrl",
		    	controllerAs: "navViewModel",
		    	templateUrl: TEMPLATE_ROOT_DIR + "nav/nav.html",
		    })
		    .state('app.sendMessage', {
				url: "/app/sendMessage",
				controller: "SendMessageCtrl",
				controllerAs: "smViewModel",
				templateUrl: TEMPLATE_ROOT_DIR + "send/send-message.html"
		   });

	}
})();



(function(){
	angular
	    .module('wxfreeman')
	    .run(runBlock);

	runBlock.$inject = ['$rootScope', '$state', 'AuthService'];

	function runBlock($rootScope, $state, AuthService) {
	    
		$rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
			console.log(next.name, AuthService.valid)
			if (!AuthService.valid) {
				if (next.name !== 'login' && next.name !== 'splash') {
					event.preventDefault();
					$state.go('login');
				}
			}
		});
	}
})();


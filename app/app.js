


var app = angular.module('wxfreeman', ['ngAnimate', "ui.router", 'ngMaterial']);




app.config(['$stateProvider', '$urlRouterProvider' , '$mdThemingProvider', '$locationProvider',
	function($stateProvider, $urlRouterProvider, $mdThemingProvider, $locationProvider) {

		$mdThemingProvider.theme('docs-dark', 'default')
	      .primaryPalette('yellow')
	      .backgroundPalette('light-blue')
	      .dark();

	    $mdThemingProvider.theme("success-toast")
	    $mdThemingProvider.theme("error-toast")


		$urlRouterProvider.otherwise("/login");

		// $locationProvider.html5Mode({ enabled: true, requireBase: false });


		var TEMPLATE_ROOT_DIR = `./app/templates/`

		$stateProvider
	    	.state('login', {
				url: "/login",
				controller: "LoginCtrl",
				templateUrl: TEMPLATE_ROOT_DIR +"login.html"
		    })
		    .state('app', {
		    	url: "/app",
		    	abstract: true,
		    	controller: "NavCtrl",
		    	templateUrl: TEMPLATE_ROOT_DIR + "nav.html",
		    }).state('app.sendMessage', {
					url: "/app/sendMessage",
					controller: "SendMessageCtrl",
					templateUrl: TEMPLATE_ROOT_DIR + "send-message.html"
			   });

	}
])




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


app.run(function ($rootScope, $state, AuthService, DataService, WxService) { 

	$rootScope.login = false;

    try {
    	AuthService.loadConfig();
	    AuthService
			.isLogin()
			.then(function(isLogin){
				AuthService.login = isLogin;
				console.log(isLogin)
		        if (isLogin) {
		        	WxService.getInfo(function(){
		        		$state.go("app.sendMessage")
		        	})
		        } else {
		        	$state.go("login")
		        }
			})
    } catch (e) {
    	console.log(e)
    	$state.go("login")
    }

		


	$rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
		console.log(next.name, AuthService.login)
		if (!AuthService.isLogin) {
			if (next.name !== 'login' && next.name !== 'splash') {
				event.preventDefault();
				$state.go('login');
			}
		}
	});
});

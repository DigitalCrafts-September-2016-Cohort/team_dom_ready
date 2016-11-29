var app = angular.module('dom_ready', ['ui.router', 'ngCookies']);

app.factory("Dom_Ready_Factory", function($http, $cookies, $rootScope) {
  var service = {};

  service.signup = function(signup_data) {
    var url = '/api/signup';
    return $http({
      method: 'POST',
      url: url,
      data: {
        username: signup_data.username,
        email: signup_data.email,
        first_name: signup_data.first_name,
        last_name: signup_data.last_name,
        password: signup_data.password
      }
    });
  };

  return service;
});

app.controller("HomeController", function($scope) {
  // Will do a request to the factory to get information to show in the api/search address
});

app.controller("SignUpController", function($scope, Dom_Ready_Factory) {
  $scope.submitSignup = function() {
    // store user signup info in a scope object
    $scope.signup_data = {
      username: $scope.username,
      email: $scope.email,
      first_name: $scope.first_name,
      last_name: $scope.last_name,
      password: $scope.password
    };
    // pass the user signup data object to be processed
    Dom_Ready_Factory.signup($scope.signup_data)
      .success(function(signup) {
        console.log("signup is: ", signup);
        // redirect to login page for new user to login after being added to db

        // Will uncomment this later once we create the login Controller and login.html file
        // $state.go('login');
      });
  };
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state({
    name: "home",
    url: "/",
    templateUrl: "templates/search.html",
    controller: "HomeController"
  })
  .state({
    name: "signup",
    url: "/signup",
    templateUrl: "templates/signup.html",
    controller: "SignUpController"
  })
  .state({
    name: "login",
    url: "/login",
    templateUrl: "templates/login.html",
    controller: "LoginController"
  });

  $urlRouterProvider.otherwise('/');
});

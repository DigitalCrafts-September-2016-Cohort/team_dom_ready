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

  service.search = function(userQuery) {
    console.log("userQuery in factory: ", userQuery);
    var url = '/api/search';
    return $http({
      method: 'GET',
      url: url,
      params: {
        user_query: userQuery
      }
    });
    // data: {
    //   // requires address and api key, but api key is in the backend
    // }
  };

  return service;
});

app.controller("HomeController", function($scope, Dom_Ready_Factory) {
  // Will do a request to the factory to get information to show in the api/search address
  $scope.submitSearch = function() {
    var query = $scope.search;
    console.log("Query inside controller: ", query);

    Dom_Ready_Factory.search(query)
      .success(function(data){
        console.log("After success is called:");
        console.log(data);
      });
  };
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


// Function creates the map to show on the screen
function loadMap() {
   var myCenter = new google.maps.LatLng(17.433053, 78.412172);

   var mapOptions = {
     center: myCenter,
     zoom: 6,
     mapTypeId: google.maps.MapTypeId.ROADMAP,
   };

   var map = new google.maps.Map(document.getElementById("map"),mapOptions);

   var marker = new google.maps.Marker({
     position: myCenter,
     title: "Click HERE",
     // Changes the default icon
     icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 5,
        strokeWeight: 3,
        strokeColor: "#B40404"
     },
     animation:google.maps.Animation.DROP,
     draggable: true,
     map: map,
   });

   marker.setMap(map);

   // Zoom to 9 when marker is clicked
   google.maps.event.addListener(marker, 'click', function() {
     map.setZoom(9);
     map.setCenter(marker.getPosition());
   });

   var infowindow = new google.maps.InfoWindow({
     content: "388-A , Road no 22, Jubilee Hills, Hyderabad Telangana, INDIA-500033",
     maxWidth: 150,
   });

   // This code opens the info window on load
   // infowindow.open(map, marker);

   // This code opens the info window on click
   google.maps.event.addListener(marker, 'click', function() {
     infowindow.open(map,marker);
   });
}

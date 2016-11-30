var app = angular.module('dom_ready', ['ui.router', 'ngCookies']);

app.factory("Dom_Ready_Factory", function($http, $cookies, $rootScope) {
  var service = {};
  var show_or_search = "";

  service.loadMap = function() {
    var myCenter = new google.maps.LatLng(33.7833, -84.3831);

    var mapOptions = {
      center: myCenter,
      zoom: 11,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    // make map a global variable inside app.factory so other services can use it
    map = new google.maps.Map(document.getElementById("map"),mapOptions);
  };

  // Creates one marker when searching for an address and / or business
  service.createMarker = function(json_data) {
    // console.log("JSON data: ", json_data);
    service.loadMap();

    var name = json_data[0].formatted_address;
    var latitude = json_data[0].geometry.location.lat;
    var longitude = json_data[0].geometry.location.lng;

    var markerLatLng = {lat: latitude, lng: longitude};

    var marker = new google.maps.Marker({
      position: markerLatLng,
      map: map,
      // draggable: true,
      title: name
    });

    // Zoom to 15 when marker is clicked
    google.maps.event.addListener(marker, 'click', function() {
      map.setZoom(15);
      map.setCenter(marker.getPosition());
    });

    var infowindow = new google.maps.InfoWindow({
      content: name,
      maxWidth: 150,
    });

    // This code opens the info window on click
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
  };

  // Creates markers for all locations that have been reviewed
  service.createMarkers = function(markers) {
    markers.forEach(function(location) {
      var name = location.name;
      var latitude = location.latitude;
      var longitude = location.longitude;

      var markerLatLng = {lat: latitude, lng: longitude};

      var marker = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        // draggable: true,
        title: name
      });

      // Zoom to 15 when marker is clicked
      google.maps.event.addListener(marker, 'click', function() {
        map.setZoom(15);
        map.setCenter(marker.getPosition());
      });

      var infowindow = new google.maps.InfoWindow({
        content: name,
        maxWidth: 150,
      });

      // This code opens the info window on click
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
      });
    });

  };

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

  // Requests name, lat/lng of locations reviewed from the database
  service.requestMarkersInfo = function() {
    show_or_search = "Show";
    var url = '/api/search';
    return $http({
      method: 'GET',
      url: url,
      params: {
        show_or_search: show_or_search
      }
    });
  };

  service.search = function(userQuery) {
    show_or_search = "Search";
    var url = '/api/search';
    return $http({
      method: 'GET',
      url: url,
      params: {
        user_query: userQuery,
        show_or_search: show_or_search
      }
    });
  };

  service.location = function(id) {
    var url = '/api/location';
    return $http({
      method: 'GET',
      url: url,
      params: {
        place_id: id
      }
    });
  };

  // service.locationPhoto = function(photoReference, dimensions) {
  //   var url = 'https://maps.googleapis.com/maps/api/place/photo',
  //       apiKey = 'AIzaSyAdBEpbwOpx3As-LpcByo9s4JAuwjROR3A';
  //   return $http({
  //     method: 'GET',
  //     url: url,
  //     params: {
  //       key: apiKey,
  //       photoreference: photoReference,
  //       maxwidth: dimensions
  //     }
  //   });
  // }

  // service.locationsaved = function()
  return service;


});

app.controller("HomeController", function($scope, Dom_Ready_Factory) {

  // instantly load the map on home page
  Dom_Ready_Factory.loadMap();

  Dom_Ready_Factory.requestMarkersInfo()
    .success(function(markers_info) {
      Dom_Ready_Factory.createMarkers(markers_info);
    });

  // Will do a request to the factory to get information to show in the api/search address
  $scope.submitSearch = function() {
    var query = $scope.search;
    Dom_Ready_Factory.search(query)
      .success(function(data){
        // save data to a scope variable
        $scope.json_data = data;

        // grab the latitude and longitude values and store them in scope variables
        $scope.latitude = $scope.json_data[0].geometry.location.lat;
        $scope.longitude = $scope.json_data[0].geometry.location.lng;

        // make a service call to create a marker and pass in the json data
        Dom_Ready_Factory.createMarker($scope.json_data);
      });
  };
});

app.controller("LocationController", function($scope, Dom_Ready_Factory) {
  var piedmont_park = 'ChIJHTE5_zgE9YgRTkiCMTUH8hU';
  var aquarium = 'ChIJGQT0RX4E9YgR3EqvqXZw1_4';
  Dom_Ready_Factory.location(piedmont_park)
    .success(function(results){
      console.log(results);
      $scope.results = results.result;
      // store the photos array in a scope variable
      $scope.photoResults = results.result.photos;
      // set an empty array that will store all the photo urls
      $scope.imageUrls = [];

      // loop through all the photos in $scope.photoResults
      // grab the photo reference id and concatenate it to the imageSrc
      for (var i = 0; i < $scope.photoResults.length; i++) {
        var imageSrc = 'https://maps.googleapis.com/maps/api/place/photo?';
        imageSrc += 'maxwidth=1000&';
        imageSrc += 'key=AIzaSyAdBEpbwOpx3As-LpcByo9s4JAuwjROR3A&';
        imageSrc += 'photoreference=';
        imageSrc += $scope.photoResults[i].photo_reference;
        // store the imageSrc in the imageUrls array
        $scope.imageUrls.push(imageSrc);
      }

    });

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
        // redirect to login page for new user to login after being added to db
        // Will uncomment this later once we create the login Controller and login.html file
        // $state.go('login');
      });
  };
})


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
  })
  .state({
    name: "location",
    url: "/location",
    templateUrl: "templates/location.html",
    controller: "LocationController"
  });

  $urlRouterProvider.otherwise('/');
});

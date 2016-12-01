var app = angular.module('dom_ready', ['ui.router', 'ngCookies']);

// ====================
// SERVICES
// ====================
app.factory("Dom_Ready_Factory", function($http, $cookies, $rootScope, $state) {

  // SERVICE VARIABLES

  var service = {};
  var show_or_search = "";

  $rootScope.factoryCookieData = null;
  // cookie data gets passed into the factory
  $rootScope.factoryCookieData = $cookies.getObject('cookieData');

  if ($rootScope.factoryCookieData) {
    // grab auth_token from the cookieData
    $rootScope.authToken = $rootScope.factoryCookieData.auth_token;
    // grab user information from cookieData
    $rootScope.user_info = $rootScope.factoryCookieData.user;
  }

  // SERVICE FUNCTIONS

  // Creates one marker when searching for an address and / or business
  service.createMarker = function(latLongObj, place_id, name) {
    console.log('Can I do anything???');
    console.log("place id::", place_id);

    var marker = new google.maps.Marker({
      position: latLongObj,
      map: map,
      // draggable: true,
      title: name
      // myURL: '/location/ChIJHTE5_zgE9YgRTkiCMTUH8hU'
    });

    var link = '<a id="mapPlace" href="/#/location/' + place_id + '">' + name + '</a>';

    var infowindow = new google.maps.InfoWindow({
      content: link,
      maxWidth: 150
    });

    // google.maps.event.addListener(marker, "click", function() {
    //   window.open(this.myURL, "_self");
    // });

    // Zoom to 15 and open the info window when marker is clicked
    google.maps.event.addListener(marker, 'click', function() {
      map.setZoom(15);
      map.setCenter(marker.getPosition());
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

      var infowindow = new google.maps.InfoWindow({
        content: name,
        maxWidth: 150,
      });

      // Zoom to 15 and open the info window when marker is clicked
      google.maps.event.addListener(marker, 'click', function() {
        map.setZoom(15);
         map.setCenter(marker.getPosition());
         infowindow.open(map,marker);
      });
    });
  };

  service.loadMap = function(latLongObj, zoomAmt) {
    // check if there is an object with latitude and longitude coordinates being passed
    if (latLongObj) {
      var myCenter = new google.maps.LatLng(latLongObj.lat, latLongObj.lng);
    }
    else {
      var myCenter = new google.maps.LatLng(33.7833, -84.3831);
    }
    if (zoomAmt === 'close') {
      zoomAmt = 14;
    } else if (zoomAmt === 'far') {
      zoomAmt = 11;
    }
    var mapOptions = {
      center: myCenter,
      zoom: zoomAmt,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    // make map a global variable inside app.factory so other services can use it
    map = new google.maps.Map(document.getElementById("map"),mapOptions);
  };

  service.location = function(id) {
    var url = '/api/location/' + id;
    return $http({
      method: 'GET',
      url: url
    });
  };

  service.login = function(login_data) {
    var url = '/api/login';
    return $http({
      method: 'POST',
      url: url,
      data: {
        username: login_data.username,
        password: login_data.password
      }
    });
  };

  $rootScope.logout = function() {
    console.log("Entered the logout function");
    // remove method => pass in the value of the cookie data you want to remove
    $cookies.remove('cookieData');
    // reset all the scope variables
    $rootScope.factoryCookieData = null;
    $rootScope.authToken = null;
    $rootScope.user_info = null;
  };

  service.profile = function() {
    // console.log("Profile data inside the factory: ", profile);
    var url = '/api/profile';
    return $http({
      method: 'GET',
      url: url,
      params: {
        profile_token: $rootScope.authToken
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

  service.updateHeart = function(is_marked, place_id, user_info) {
    var url = '/api/marked';
    return $http({
      method: 'POST',
      url: url,
      data: {
        marked: is_marked,
        place_id: place_id,
        user_info: user_info
      }
    });
  };

  return service;

});

// ====================
// CONTROLLERS
// ====================
app.controller("HomeController", function($scope, Dom_Ready_Factory, $state) {
  // instantly load the map on home page
  Dom_Ready_Factory.loadMap(null, 'far');

  Dom_Ready_Factory.requestMarkersInfo()
    .success(function(markers_info) {
      Dom_Ready_Factory.loadMap(null, 'far');
    });

  // Will do a request to the factory to get information to show in the api/search address
  $scope.submitSearch = function() {
    var query = $scope.search;
    Dom_Ready_Factory.search(query)
      .success(function(data){
        // save data to a scope variable
        console.log('search data being returned:', data);
        $scope.json_data = data;
        $scope.place_id = data[0].place_id;
        $scope.latLong = {
          lat: data[0].geometry.location.lat,
          lng: data[0].geometry.location.lng
        };
        $scope.name = data[0].formatted_address;

        // make a service call to create a marker and pass in the json data
        Dom_Ready_Factory.createMarker($scope.latLong, $scope.place_id, $scope.name);
      });
  };
});

app.controller("LocationController", function($scope, $stateParams, Dom_Ready_Factory, $state, $rootScope) {
  var piedmont_park = 'ChIJHTE5_zgE9YgRTkiCMTUH8hU';
  var aquarium = 'ChIJGQT0RX4E9YgR3EqvqXZw1_4';

  // first, check if user has already wishlisted the location
  // if so, set isWishListed to true
  // else, set it to false

  // hard code user's marked
  var isWishlisted = false;

  $scope.isWishListed = (isWishlisted) ? isWishlisted : false;

  $scope.toggleHeart = function() {
    console.log('heart status', $scope.isWishListed);
    // check if a heart is favorited
    if ($scope.isWishListed) {
      // if it is, unfavorite it
      $scope.isWishListed = false;
      // if it isn't favorited
    } else {
      // favorite it now
      $scope.isWishListed = true;
    }
    // update the db by passing the marked value, the place id, and the user info
    Dom_Ready_Factory.updateHeart($scope.isWishListed, $scope.place_id, $rootScope.user_info)
      .success(function() {
        console.log('it was a success updating the heart');
      });
  };

  // pass in the desired location ID into the service function
  Dom_Ready_Factory.location($stateParams.place_id)
    .success(function(results){
      console.log(results);
      $scope.results = results.result;
      $scope.lat = results.result.geometry.location.lat;
      $scope.lng = results.result.geometry.location.lng;
      $scope.place_id = results.result.place_id;
      $scope.name = results.result.geometry.name;

      var latLng = {lat: $scope.lat, lng: $scope.lng};
      // render a small map and create a marker for the searched location
      Dom_Ready_Factory.loadMap(latLng, 'close');
      Dom_Ready_Factory.createMarker(latLng, $scope.place_id, $scope.name);

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


app.controller("LoginController", function($scope, Dom_Ready_Factory, $state, $rootScope, $cookies) {
  $scope.submitLogin = function(){
    var login_info = {
      'username': $scope.username,
      'password': $scope.password
    };
    Dom_Ready_Factory.login(login_info)
    .success(function(login) {
      $cookies.putObject('cookieData', login);
      console.log("Cookie data: ", login);
      // store user information in a $rootScope variable
      $rootScope.user_info = login.user;
      // store token information in a $rootScope variable
      $rootScope.authToken = login.auth_token;
      // redirect to home page
      // console.log(login);
      // console.log("hello there");
      // console.log($rootScope.user_info.first_name);
      $state.go('home');
    });
  };
});

app.controller("ProfileController", function($scope, Dom_Ready_Factory, $rootScope) {
  // console.log("Hi from the ProfileController");
  // console.log("Token from app: ", $scope.token);
  console.log("I have a token: ", $rootScope.authToken);
  Dom_Ready_Factory.profile()
    .success(function(profile_info) {
      $scope.profile_info = profile_info;
      console.log("Profile info inside controller: ", profile_info);
      console.log("Here's the profile_info", profile_info);
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
});



// ====================
// STATES
// ====================
app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state({
    name: "home",
    url: "/",
    templateUrl: "templates/search.html",
    controller: "HomeController"
  })
  .state({
    name: "location",
    url: "/location/{place_id}",
    templateUrl: "templates/location.html",
    controller: "LocationController"
  })
  .state({
    name: "login",
    url: "/login",
    templateUrl: "templates/login.html",
    controller: "LoginController"
  })
  .state({
    name: "signup",
    url: "/signup",
    templateUrl: "templates/signup.html",
    controller: "SignUpController"
  })
  .state({
    name: "profile",
    url: "/profile",
    templateUrl: "templates/profile.html",
    controller: "ProfileController"
  });

  $urlRouterProvider.otherwise('/');
});

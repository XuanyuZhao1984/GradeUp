//(function () {
//  'use strict';
//// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
//  angular.module('tutors.services')
//    .factory('gservice', function ($rootScope, $http) {
//
//      // Initialize Variables
//      // -------------------------------------------------------------
//      // Service our factory will return
//      var googleMapService = {};
//
//      // Array of locations obtained from API calls
//      var locations = [];
//      var map = null;
//
//      // Variables we'll use to help us pan to the right spot
//      var lastMarker;
//      var currentSelectedMarker;
//
//      // Selected Location (initialize to center of America)
//      var selectedLat = -37.847;
//      var selectedLong = 145.129;
//
//      // Handling Clicks and location selection
//      googleMapService.clickLat = 0;
//      googleMapService.clickLong = 0;
//
//      // Functions
//      // --------------------------------------------------------------
//      // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
//      googleMapService.refresh = function (latitude, longitude) {
//
//        // Clears the holding array of locations
//        locations = [];
//
//        // Set the selected lat and long equal to the ones provided on the refresh() call
//        selectedLat = latitude;
//        selectedLong = longitude;
//
//        // Perform an AJAX call to get all of the records in the db.
//        $http.get('api/tutors').success(function (response) {
//
//          // Convert the results into Google Map Format
//          locations = convertToMapPoints(response);
//
//          // Then initialize the map.
//          initialize(latitude, longitude);
//        }).error(function () {
//        });
//      };
//
//      // Private Inner Functions
//      // --------------------------------------------------------------
//      // Convert a JSON of users into map points
//      var convertToMapPoints = function (response) {
//
//        // Clear the locations holder
//        var locations = [];
//
//        // Loop through all of the JSON entries provided in the response
//        for (var i = 0; i < response.length; i++) {
//          var tutor = response[i];
//
//          // Create popup windows for each record
//          var contentString =
//            '<p><b>Name</b>: ' + tutor.name +
//            '<br><b>Subject</b>: ' + tutor.subject +
//            '<br><b>Address</b>: ' + tutor.address +
//            '<br><b>Language</b>: ' + tutor.language +
//            '</p>';
//
//          // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
//          locations.push({
//            latlon: new google.maps.LatLng(tutor.location[1], tutor.location[0]),
//            message: new google.maps.InfoWindow({
//              content: contentString,
//              maxWidth: 320
//            })
//            //tutorname: tutor.tutorname,
//            //gender: tutor.gender,
//            //age: tutor.age,
//            //favlang: tutor.favlang
//          });
//        }
//        // location is now an array populated with records in Google Maps format
//        return locations;
//      };
//
//// Initializes the map
//      var initialize = function (latitude, longitude) {
//
//        // Uses the selected lat, long as starting point
//        var myLatLng = {lat: selectedLat, lng: selectedLong};
//
//        // If map has not been created already...
//        if (!map) {
//
//          // Create a new map and place in the index.html page
//          map = new google.maps.Map(document.getElementById('map'), {
//            zoom: 3,
//            center: myLatLng
//          });
//        }
//
//        // Loop through each location in the array and place a marker
//        locations.forEach(function (n) {
//          var marker = new google.maps.Marker({
//            position: n.latlon,
//            map: map,
//            title: "Big Map",
//            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
//          });
//
//          // For each marker created, add a listener that checks for clicks
//          google.maps.event.addListener(marker, 'click', function (e) {
//
//            // When clicked, open the selected marker's message
//            currentSelectedMarker = n;
//            n.message.open(map, marker);
//          });
//        });
//
//        // Set initial location as a bouncing red marker
//        var initialLocation = new google.maps.LatLng(latitude, longitude);
//        var marker = new google.maps.Marker({
//          position: initialLocation,
//          animation: google.maps.Animation.BOUNCE,
//          map: map,
//          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
//        });
//        lastMarker = marker;
//
//        // Function for moving to a selected location
//        map.panTo(new google.maps.LatLng(latitude, longitude));
//
//        // Clicking on the Map moves the bouncing red marker
//        google.maps.event.addListener(map, 'click', function (e) {
//          var marker = new google.maps.Marker({
//            position: e.latLng,
//            animation: google.maps.Animation.BOUNCE,
//            map: map,
//            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
//          });
//
//          // When a new spot is selected, delete the old red bouncing marker
//          if (lastMarker) {
//            lastMarker.setMap(null);
//          }
//
//          // Create a new red bouncing marker and move to it
//          lastMarker = marker;
//          map.panTo(marker.position);
//
//          // Update Broadcasted Variable (lets the panels know to change their lat, long values)
//          googleMapService.clickLat = marker.getPosition().lat();
//          googleMapService.clickLong = marker.getPosition().lng();
//          $rootScope.$broadcast("clicked");
//        });
//      };
//
//// Refresh the page upon window load. Use the initial latitude and longitude
//      google.maps.event.addDomListener(window, 'load',
//        googleMapService.refresh(selectedLat, selectedLong));
//
//      return googleMapService;
//    });
//})();
//

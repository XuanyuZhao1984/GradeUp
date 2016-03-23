(function () {
  'use strict';

  angular
    .module('tutors')
    .controller('TutorsController', TutorsController);


  TutorsController.$inject = ['$scope','$rootScope' ,'geolocation','$state', '$timeout', '$window','tutorResolve', 'Authentication', 'FileUploader'];

  function TutorsController($scope,$rootScope,geolocation, $state, $timeout,$window,tutor, Authentication,FileUploader) {
    var vm = this;

    vm.tutor = tutor;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.showMsg=false;
    vm.googleMapsUrl='https://maps.googleapis.com/maps/api/js?key=AIzaSyCxj9-vXqcGLYGrck_MOy7uI6wKziRaN4E';

    //vm.tutor.age=5;
    //initialize the array to [], then push into it.
    //if create a new tutor
    if(!vm.tutor._id) {
      vm.tutor.available_days = [];
      vm.tutor.location=[];
      vm.tutor.location[1]="-37.847";
      vm.tutor.location[0]="145.129";
      vm.tutor.imageURL = "modules/tutors/client/img/user-icon-6.png";
    }

    vm.imageURL = vm.tutor.imageURL;


    geolocation.getLocation().then(function(data){

      // Set the latitude and longitude equal to the HTML5 coordinates
      vm.coords = { lat:data.coords.latitude, long:data.coords.longitude };

      // Display coordinates in location textboxes rounded to three decimal points
      vm.tutor.location[0] = parseFloat(vm.coords.long).toFixed(3);
      vm.tutor.location[1] = parseFloat(vm.coords.lat).toFixed(3);

      // Display message confirming that the coordinates verified.


      //gservice.refresh(vm.tutor.location[1], vm.tutor.location[0]);

    });


    // Functions
    // ----------------------------------------------------------------------------
    // Get coordinates based on mouse click. When a click event is detected....
    //$rootScope.$on("clicked", function(){
    //
    //  // Run the gservice functions associated with identifying coordinates
    //  vm.$apply(function(){
    //    vm.tutor.location[1] = parseFloat(gservice.clickLat).toFixed(3);
    //    vm.tutor.location[0] = parseFloat(gservice.clickLong).toFixed(3);
    //
    //  });
    //});

    // Create file uploader instance
    vm.uploader = new FileUploader({
      url: 'api/tutors/picture/'+vm.tutor._id,
      alias: 'newTutorPicture'
    });

    // Set file uploader image filter
    vm.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    vm.uploader.onAfterAddingFile = function (fileItem) {
      vm.showMsg=false;
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            vm.imageURL = fileReaderEvent.target.result;
            //console.log(vm.tutor.imageURL);
          }, 0);
        };

      }
    };

     //Called after the user has successfully uploaded a new picture
    vm.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      vm.success = true;
      vm.showMsg=true;
      // Populate tutor object
      vm.tutor.imageURL = response.imageURL;

      // Clear upload buttons
      vm.cancelUpload();

    };

     //Called after the user has failed to uploaded a new picture
    vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      vm.cancelUpload();

      // Show error message
      vm.error = response.message;
    };

    // Change user profile picture
    vm.uploadProfilePicture = function () {
      // Clear messages
      vm.success = vm.error = null;

      // Start upload
      vm.uploader.uploadAll();
    };

    vm.cancelUpload = function () {
      vm.uploader.clearQueue();
      vm.imageURL = vm.tutor.imageURL;
    };

    // Remove existing Tutor
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.tutor.$remove($state.go('tutors.list'));
      }
    }

    // Save Tutor
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.tutorForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.tutor._id) {
        vm.tutor.$update(successCallback, errorCallback);
      } else {
        //before this foreach loop to push strings into the array, we should initialize the array to [];
        angular.forEach(vm.output, function (value, key) {
          /* do your stuff here */
          vm.tutor.available_days.push(value.name);
        });

        vm.tutor.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('tutors.uploadphoto', {
          tutorId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

    vm.weekdays = [
      { name: "Monday", ticked: true },
      { name: "Tuesday", ticked: false },
      { name: "Wednesday", ticked: false },
      { name: "Thursday", ticked: false },
      { name: "Friday", ticked: false },
      { name: "Saturday", ticked: false },
      { name: "Sunday", ticked: false }
    ];
    vm.output=[
      { name: "Monday", ticked: true }];




  }
})();

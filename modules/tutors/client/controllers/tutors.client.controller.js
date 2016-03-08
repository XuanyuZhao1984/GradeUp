(function () {
  'use strict';

  angular
    .module('tutors')
    .controller('TutorsController', TutorsController);


  TutorsController.$inject = ['$scope', '$state', '$timeout', '$window','tutorResolve', 'Authentication', 'FileUploader'];

  function TutorsController($scope, $state, $timeout,$window,tutor, Authentication,FileUploader) {
    var vm = this;

    vm.tutor = tutor;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    //vm.tutor.age=5;
    //initialize the array to [], then push into it.
    //if create a new tutor
    if(!vm.tutor._id) {
      vm.tutor.available_days = [];
      vm.tutor.latitude="78.0550";
      vm.tutor.longitude="34.060";
      vm.tutor.imageURL = "modules/tutors/client/img/user-icon-6.png";
    }

    vm.imageURL = vm.tutor.imageURL;

    // Create file uploader instance
    vm.uploader = new FileUploader({
      url: 'api/tutors/picture',
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

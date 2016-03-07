(function () {
  'use strict';

  angular
    .module('tutors')
    .controller('TutorsController', TutorsController);


  TutorsController.$inject = ['$scope', '$state', 'tutorResolve', 'Authentication'];

  function TutorsController($scope, $state, tutor, Authentication) {
    var vm = this;

    vm.tutor = tutor;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.tutor.latitude="78.0550";
    vm.tutor.longitude="34.060";
    //initialize the array to [], then push into it.
    vm.tutor.available_days=[];

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
        $state.go('tutors.view', {
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

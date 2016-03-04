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
  }
})();

(function () {
  'use strict';

  angular
    .module('students')
    .controller('StudentsController', StudentsController);

  StudentsController.$inject = ['$scope', '$state', 'studentResolve', 'Authentication'];

  function StudentsController($scope, $state, student, Authentication) {
    var vm = this;

    vm.student = student;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Student
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.student.$remove($state.go('students.list'));
      }
    }

    // Save Student
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.studentForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.student._id) {
        vm.student.$update(successCallback, errorCallback);
      } else {
        vm.student.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('students.view', {
          studentId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

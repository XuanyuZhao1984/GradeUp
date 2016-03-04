(function () {
  'use strict';

  angular
    .module('tutors')
    .controller('TutorsListController', TutorsListController);

  TutorsListController.$inject = ['TutorsService'];

  function TutorsListController(TutorsService) {
    var vm = this;

    vm.tutors = TutorsService.query();
  }
})();

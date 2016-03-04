(function () {
  'use strict';

  angular
    .module('tutors.services')
    .factory('TutorsService', TutorsService);

  TutorsService.$inject = ['$resource'];

  function TutorsService($resource) {
    return $resource('api/tutors/:tutorId', {
      tutorId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

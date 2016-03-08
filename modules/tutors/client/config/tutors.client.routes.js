(function () {
  'use strict';

  angular
    .module('tutors.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('tutors', {
        abstract: true,
        url: '/tutors',
        template: '<ui-view/>'
      })
      .state('tutors.list', {
        url: '',
        templateUrl: 'modules/tutors/client/views/list-tutors.client.view.html',
        controller: 'TutorsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Tutors List'
        }
      })
      .state('tutors.create', {
        url: '/create',
        templateUrl: 'modules/tutors/client/views/form-tutor.client.view.html',
        controller: 'TutorsController',
        controllerAs: 'vm',
        resolve: {
          tutorResolve: newTutor
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Tutors Create'
        }
      })
      .state('tutors.edit', {
        url: '/:tutorId/edit',
        templateUrl: 'modules/tutors/client/views/form-tutor.client.view.html',
        controller: 'TutorsController',
        controllerAs: 'vm',
        resolve: {
          tutorResolve: getTutor
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Tutor {{ tutorResolve.title }}'
        }
      })
      .state('tutors.uploadphoto', {
        url: '/:tutorId/upload',
        templateUrl: 'modules/tutors/client/views/upload-tutor.client.view.html',
        controller: 'TutorsController',
        controllerAs: 'vm',
        resolve: {
          tutorResolve: getTutor
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Upload tutor photo {{ tutorResolve.title }}'
        }
      })
      .state('tutors.view', {
        url: '/:tutorId',
        templateUrl: 'modules/tutors/client/views/view-tutor.client.view.html',
        controller: 'TutorsController',
        controllerAs: 'vm',
        resolve: {
          tutorResolve: getTutor
        },
        data:{
          pageTitle: 'Tutor {{ tutorResolve.title }}'
        }
      });
  }

  getTutor.$inject = ['$stateParams', 'TutorsService'];

  function getTutor($stateParams, TutorsService) {
    return TutorsService.get({
      tutorId: $stateParams.tutorId
    }).$promise;
  }

  newTutor.$inject = ['TutorsService'];

  function newTutor(TutorsService) {
    return new TutorsService();
  }
})();

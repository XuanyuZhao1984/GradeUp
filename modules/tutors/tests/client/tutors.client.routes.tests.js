(function () {
  'use strict';

  describe('Tutors Route Tests', function () {
    // Initialize global variables
    var $scope,
      TutorsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _TutorsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      TutorsService = _TutorsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('tutors');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/tutors');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          TutorsController,
          mockTutor;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('tutors.view');
          $templateCache.put('modules/tutors/client/views/view-tutor.client.view.html', '');

          // create mock tutor
          mockTutor = new TutorsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Tutor about MEAN',
            content: 'MEAN rocks!'
          });

          //Initialize Controller
          TutorsController = $controller('TutorsController as vm', {
            $scope: $scope,
            tutorResolve: mockTutor
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:tutorId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.tutorResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            tutorId: 1
          })).toEqual('/tutors/1');
        }));

        it('should attach an tutor to the controller scope', function () {
          expect($scope.vm.tutor._id).toBe(mockTutor._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/tutors/client/views/view-tutor.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          TutorsController,
          mockTutor;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('tutors.create');
          $templateCache.put('modules/tutors/client/views/form-tutor.client.view.html', '');

          // create mock tutor
          mockTutor = new TutorsService();

          //Initialize Controller
          TutorsController = $controller('TutorsController as vm', {
            $scope: $scope,
            tutorResolve: mockTutor
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.tutorResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/tutors/create');
        }));

        it('should attach an tutor to the controller scope', function () {
          expect($scope.vm.tutor._id).toBe(mockTutor._id);
          expect($scope.vm.tutor._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/tutors/client/views/form-tutor.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          TutorsController,
          mockTutor;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('tutors.edit');
          $templateCache.put('modules/tutors/client/views/form-tutor.client.view.html', '');

          // create mock tutor
          mockTutor = new TutorsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Tutor about MEAN',
            content: 'MEAN rocks!'
          });

          //Initialize Controller
          TutorsController = $controller('TutorsController as vm', {
            $scope: $scope,
            tutorResolve: mockTutor
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:tutorId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.tutorResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            tutorId: 1
          })).toEqual('/tutors/1/edit');
        }));

        it('should attach an tutor to the controller scope', function () {
          expect($scope.vm.tutor._id).toBe(mockTutor._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/tutors/client/views/form-tutor.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();

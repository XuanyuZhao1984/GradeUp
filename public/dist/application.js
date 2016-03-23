'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if ((role === 'guest') || (Authentication.user && Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1)) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

(function (app) {
  'use strict';

  app.registerModule('chat');
  app.registerModule('chat.routes', ['ui.router']);
})(ApplicationConfiguration);

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

(function (app) {
  'use strict';

  app.registerModule('students');
  app.registerModule('students.services');
  app.registerModule('students.routes', ['ui.router', 'students.services']);
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  //app.registerModule('tutors');
  app.registerModule('tutors',['isteven-multi-select','geolocation','tutors.services','ngMap']);
  app.registerModule('tutors.services');
  app.registerModule('tutors.routes', ['ui.router', 'tutors.services']);
})(ApplicationConfiguration);

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

(function () {
  'use strict';

  angular
    .module('chat')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    //Menus.addMenuItem('topbar', {
    //  title: 'Chat',
    //  state: 'chat'
    //});
  }
})();

(function () {
  'use strict';

  angular
    .module('chat.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('chat', {
        url: '/chat',
        templateUrl: 'modules/chat/client/views/chat.client.view.html',
        controller: 'ChatController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Chat'
        }
      });
  }
})();

(function () {
  'use strict';

  angular
    .module('chat')
    .controller('ChatController', ChatController);

  ChatController.$inject = ['$scope', '$state', 'Authentication', 'Socket'];

  function ChatController($scope, $state, Authentication, Socket) {
    var vm = this;

    vm.messages = [];
    vm.messageText = '';
    vm.sendMessage = sendMessage;

    init();

    function init() {
      // If user is not signed in then redirect back home
      if (!Authentication.user) {
        $state.go('home');
      }

      // Make sure the Socket is connected
      if (!Socket.socket) {
        Socket.connect();
      }

      // Add an event listener to the 'chatMessage' event
      Socket.on('chatMessage', function (message) {
        vm.messages.unshift(message);
      });

      // Remove the event listener when the controller instance is destroyed
      $scope.$on('$destroy', function () {
        Socket.removeListener('chatMessage');
      });
    }

    // Create a controller method for sending messages
    function sendMessage() {
      // Create a new message object
      var message = {
        text: vm.messageText
      };

      // Emit a 'chatMessage' message event
      Socket.emit('chatMessage', message);

      // Clear the message text
      vm.messageText = '';
    }
  }
})();

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

(function () {
  'use strict';

  angular
  .module('core')
  .run(MenuConfig);

  MenuConfig.$inject = ['Menus'];

  function MenuConfig(Menus) {

    Menus.addMenu('account', {
      roles: ['user']
    });

    Menus.addMenuItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });

    Menus.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile',
      state: 'settings.profile'
    });

    Menus.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile Picture',
      state: 'settings.picture'
    });

    Menus.addSubMenuItem('account', 'settings', {
      title: 'Change Password',
      state: 'settings.password'
    });

    Menus.addSubMenuItem('account', 'settings', {
      title: 'Manage Social Accounts',
      state: 'settings.accounts'
    });

  }

})();

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/core/client/views/home.client.view.html'
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/client/views/404.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Not-Found'
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: 'modules/core/client/views/400.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Bad-Request'
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Forbidden'
        }
      });
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Get the account menu
    $scope.accountMenu = Menus.getMenu('account').items[0];

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

(function () {
  'use strict';

  angular.module('core')
    .directive('pageTitle', pageTitle);

  pageTitle.$inject = ['$rootScope', '$timeout', '$interpolate', '$state'];

  function pageTitle($rootScope, $timeout, $interpolate, $state) {
    var directive = {
      retrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element) {
      $rootScope.$on('$stateChangeSuccess', listener);

      function listener(event, toState) {
        var title = (getTitle($state.$current));
        $timeout(function () {
          element.text(title);
        }, 0, false);
      }

      function getTitle(currentState) {
        var applicationCoreTitle = 'MEAN.js';
        var workingState = currentState;
        if (currentState.data) {
          workingState = (typeof workingState.locals !== 'undefined') ? workingState.locals.globals : workingState;
          var stateTitle = $interpolate(currentState.data.pageTitle)(workingState);
          return applicationCoreTitle + ' - ' + stateTitle;
        } else {
          return applicationCoreTitle;
        }
      }
    }
  }
})();

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector', 'Authentication',
  function ($q, $injector, Authentication) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

(function () {
  'use strict';

  angular
    .module('students')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Find a student',
      state: 'students.list',
      position:3,
      roles: ['*']
    });
    Menus.addMenuItem('topbar', {
      title: 'Register a student',
      state: 'students.create',
      position:4,
      roles: ['user']
    });

    // Add the dropdown list item
    //Menus.addSubMenuItem('topbar', 'students', {
    //  title: 'List Students',
    //  state: 'students.list'
    //});
    //
    //// Add the dropdown create item
    //Menus.addSubMenuItem('topbar', 'students', {
    //  title: 'Create Student',
    //  state: 'students.create',
    //  roles: ['user']
    //});
  }
})();

(function () {
  'use strict';

  angular
    .module('students.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('students', {
        abstract: true,
        url: '/students',
        template: '<ui-view/>'
      })
      .state('students.list', {
        url: '',
        templateUrl: 'modules/students/client/views/list-students.client.view.html',
        controller: 'StudentsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Students List'
        }
      })
      .state('students.create', {
        url: '/create',
        templateUrl: 'modules/students/client/views/form-student.client.view.html',
        controller: 'StudentsController',
        controllerAs: 'vm',
        resolve: {
          studentResolve: newStudent
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Students Create'
        }
      })
      .state('students.edit', {
        url: '/:studentId/edit',
        templateUrl: 'modules/students/client/views/form-student.client.view.html',
        controller: 'StudentsController',
        controllerAs: 'vm',
        resolve: {
          studentResolve: getStudent
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Student {{ studentResolve.title }}'
        }
      })
      .state('students.view', {
        url: '/:studentId',
        templateUrl: 'modules/students/client/views/view-student.client.view.html',
        controller: 'StudentsController',
        controllerAs: 'vm',
        resolve: {
          studentResolve: getStudent
        },
        data:{
          pageTitle: 'Student {{ studentResolve.title }}'
        }
      });
  }

  getStudent.$inject = ['$stateParams', 'StudentsService'];

  function getStudent($stateParams, StudentsService) {
    return StudentsService.get({
      studentId: $stateParams.studentId
    }).$promise;
  }

  newStudent.$inject = ['StudentsService'];

  function newStudent(StudentsService) {
    return new StudentsService();
  }
})();

(function () {
  'use strict';

  angular
    .module('students')
    .controller('StudentsListController', StudentsListController);

  StudentsListController.$inject = ['StudentsService'];

  function StudentsListController(StudentsService) {
    var vm = this;

    vm.students = StudentsService.query();
  }
})();

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

(function () {
  'use strict';

  angular
    .module('students.services')
    .factory('StudentsService', StudentsService);

  StudentsService.$inject = ['$resource'];

  function StudentsService($resource) {
    return $resource('api/students/:studentId', {
      studentId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

(function () {
  'use strict';

  angular
    .module('tutors')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Find a tutor',
      state: 'tutors.list',
      position:1,
      roles: ['*']
    });
    Menus.addMenuItem('topbar', {
      title: 'Register a tutor',
      state: 'tutors.create',
      position:2,
      roles: ['user']
    });

    // Add the dropdown list item
    //Menus.addSubMenuItem('topbar', 'tutors', {
    //  title: 'List Tutors',
    //  state: 'tutors.list'
    //});
    //
    //// Add the dropdown create item
    //Menus.addSubMenuItem('topbar', 'tutors', {
    //  title: 'Create Tutor',
    //  state: 'tutors.create',
    //  roles: ['user']
    //});
  }
})();

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

'use strict';

// Configuring the Users module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        data: {
          pageTitle: 'Users List'
        }
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        },
        data: {
          pageTitle: 'Edit {{ userResolve.displayName }}'
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        },
        data: {
          pageTitle: 'Edit User {{ userResolve.displayName }}'
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html',
        data: {
          pageTitle: 'Settings'
        }
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html',
        data: {
          pageTitle: 'Settings password'
        }
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html',
        data: {
          pageTitle: 'Settings accounts'
        }
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html',
        data: {
          pageTitle: 'Settings picture'
        }
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html',
        data: {
          pageTitle: 'Signup'
        }
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
        data: {
          pageTitle: 'Signin'
        }
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html',
        data: {
          pageTitle: 'Password forgot'
        }
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html',
        data: {
          pageTitle: 'Password reset invalid'
        }
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html',
        data: {
          pageTitle: 'Password reset success'
        }
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html',
        data: {
          pageTitle: 'Password reset form'
        }
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with 6 or more characters, numbers and lowercase.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

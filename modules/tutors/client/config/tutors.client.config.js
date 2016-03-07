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

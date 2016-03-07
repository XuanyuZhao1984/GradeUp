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

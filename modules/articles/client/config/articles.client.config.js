(function () {
  'use strict';

  angular
    .module('articles')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Find a tutor',
      state: 'articles.list',

      roles: ['*']
    });
    Menus.addMenuItem('topbar', {
      title: 'Register a tutor',
      state: 'articles.create',

      roles: ['user']
    });

    // Add the dropdown list item
    //Menus.addSubMenuItem('topbar', 'articles', {
    //  title: 'List Articles',
    //  state: 'articles.list'
    //});
    //
    //// Add the dropdown create item
    //Menus.addSubMenuItem('topbar', 'articles', {
    //  title: 'Create Article',
    //  state: 'articles.create',
    //  roles: ['user']
    //});
  }
})();

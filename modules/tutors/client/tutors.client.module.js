(function (app) {
  'use strict';

  app.registerModule('tutors');
  app.registerModule('tutors.services');
  app.registerModule('tutors.routes', ['ui.router', 'tutors.services']);
})(ApplicationConfiguration);

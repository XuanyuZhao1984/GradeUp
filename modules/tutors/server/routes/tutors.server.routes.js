'use strict';

/**
 * Module dependencies
 */
var tutorsPolicy = require('../policies/tutors.server.policy'),
  tutors = require('../controllers/tutors.server.controller');

module.exports = function (app) {
  // Tutors collection routes
  app.route('/api/tutors').all(tutorsPolicy.isAllowed)
    .get(tutors.list)
    .post(tutors.create);

  // Single tutor routes
  app.route('/api/tutors/:tutorId').all(tutorsPolicy.isAllowed)
    .get(tutors.read)
    .put(tutors.update)
    .delete(tutors.delete);

  app.route('/api/tutors/picture').post(tutors.changeProfilePicture);


  // Finish by binding the tutor middleware
  app.param('tutorId', tutors.tutorByID);
};

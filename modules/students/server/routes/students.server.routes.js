'use strict';

/**
 * Module dependencies
 */
var studentsPolicy = require('../policies/students.server.policy'),
  students = require('../controllers/students.server.controller');

module.exports = function (app) {
  // Students collection routes
  app.route('/api/students').all(studentsPolicy.isAllowed)
    .get(students.list)
    .post(students.create);

  // Single student routes
  app.route('/api/students/:studentId').all(studentsPolicy.isAllowed)
    .get(students.read)
    .put(students.update)
    .delete(students.delete);

  // Finish by binding the student middleware
  app.param('studentId', students.studentByID);
};

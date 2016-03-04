'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Student = mongoose.model('Student'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an student
 */
exports.create = function (req, res) {
  var student = new Student(req.body);
  student.user = req.user;

  student.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(student);
    }
  });
};

/**
 * Show the current student
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var student = req.student ? req.student.toJSON() : {};

  // Add a custom field to the Student, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Student model.
  student.isCurrentUserOwner = req.user && student.user && student.user._id.toString() === req.user._id.toString() ? true : false;

  res.json(student);
};

/**
 * Update an student
 */
exports.update = function (req, res) {
  var student = req.student;

  student.title = req.body.title;
  student.content = req.body.content;

  student.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(student);
    }
  });
};

/**
 * Delete an student
 */
exports.delete = function (req, res) {
  var student = req.student;

  student.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(student);
    }
  });
};

/**
 * List of Students
 */
exports.list = function (req, res) {
  Student.find().sort('-created').populate('user', 'displayName').exec(function (err, students) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(students);
    }
  });
};

/**
 * Student middleware
 */
exports.studentByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Student is invalid'
    });
  }

  Student.findById(id).populate('user', 'displayName').exec(function (err, student) {
    if (err) {
      return next(err);
    } else if (!student) {
      return res.status(404).send({
        message: 'No student with that identifier has been found'
      });
    }
    req.student = student;
    next();
  });
};

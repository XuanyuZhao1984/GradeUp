'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Tutor = mongoose.model('Tutor'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an tutor
 */
exports.create = function (req, res) {
  var tutor = new Tutor(req.body);
  tutor.user = req.user;

  tutor.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(tutor);
    }
  });
};

/**
 * Show the current tutor
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var tutor = req.tutor ? req.tutor.toJSON() : {};

  // Add a custom field to the Tutor, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Tutor model.
  tutor.isCurrentUserOwner = req.user && tutor.user && tutor.user._id.toString() === req.user._id.toString() ? true : false;

  res.json(tutor);
};

/**
 * Update an tutor
 */
exports.update = function (req, res) {
  var tutor = req.tutor;

  tutor.title = req.body.title;
  tutor.content = req.body.content;

  tutor.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(tutor);
    }
  });
};

/**
 * Delete an tutor
 */
exports.delete = function (req, res) {
  var tutor = req.tutor;

  tutor.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(tutor);
    }
  });
};

/**
 * List of Tutors
 */
exports.list = function (req, res) {
  Tutor.find().sort('-created').populate('user', 'displayName').exec(function (err, tutors) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(tutors);
    }
  });
};

/**
 * Tutor middleware
 */
exports.tutorByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Tutor is invalid'
    });
  }

  Tutor.findById(id).populate('user', 'displayName').exec(function (err, tutor) {
    if (err) {
      return next(err);
    } else if (!tutor) {
      return res.status(404).send({
        message: 'No tutor with that identifier has been found'
      });
    }
    req.tutor = tutor;
    next();
  });
};

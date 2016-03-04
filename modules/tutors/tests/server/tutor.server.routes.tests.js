'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Tutor = mongoose.model('Tutor'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, tutor;

/**
 * Tutor routes tests
 */
describe('Tutor CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new tutor
    user.save(function () {
      tutor = {
        title: 'Tutor Title',
        content: 'Tutor Content'
      };

      done();
    });
  });

  it('should be able to save an tutor if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new tutor
        agent.post('/api/tutors')
          .send(tutor)
          .expect(200)
          .end(function (tutorSaveErr, tutorSaveRes) {
            // Handle tutor save error
            if (tutorSaveErr) {
              return done(tutorSaveErr);
            }

            // Get a list of tutors
            agent.get('/api/tutors')
              .end(function (tutorsGetErr, tutorsGetRes) {
                // Handle tutor save error
                if (tutorsGetErr) {
                  return done(tutorsGetErr);
                }

                // Get tutors list
                var tutors = tutorsGetRes.body;

                // Set assertions
                (tutors[0].user._id).should.equal(userId);
                (tutors[0].title).should.match('Tutor Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an tutor if not logged in', function (done) {
    agent.post('/api/tutors')
      .send(tutor)
      .expect(403)
      .end(function (tutorSaveErr, tutorSaveRes) {
        // Call the assertion callback
        done(tutorSaveErr);
      });
  });

  it('should not be able to save an tutor if no title is provided', function (done) {
    // Invalidate title field
    tutor.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new tutor
        agent.post('/api/tutors')
          .send(tutor)
          .expect(400)
          .end(function (tutorSaveErr, tutorSaveRes) {
            // Set message assertion
            (tutorSaveRes.body.message).should.match('Title cannot be blank');

            // Handle tutor save error
            done(tutorSaveErr);
          });
      });
  });

  it('should be able to update an tutor if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new tutor
        agent.post('/api/tutors')
          .send(tutor)
          .expect(200)
          .end(function (tutorSaveErr, tutorSaveRes) {
            // Handle tutor save error
            if (tutorSaveErr) {
              return done(tutorSaveErr);
            }

            // Update tutor title
            tutor.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing tutor
            agent.put('/api/tutors/' + tutorSaveRes.body._id)
              .send(tutor)
              .expect(200)
              .end(function (tutorUpdateErr, tutorUpdateRes) {
                // Handle tutor update error
                if (tutorUpdateErr) {
                  return done(tutorUpdateErr);
                }

                // Set assertions
                (tutorUpdateRes.body._id).should.equal(tutorSaveRes.body._id);
                (tutorUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of tutors if not signed in', function (done) {
    // Create new tutor model instance
    var tutorObj = new Tutor(tutor);

    // Save the tutor
    tutorObj.save(function () {
      // Request tutors
      request(app).get('/api/tutors')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single tutor if not signed in', function (done) {
    // Create new tutor model instance
    var tutorObj = new Tutor(tutor);

    // Save the tutor
    tutorObj.save(function () {
      request(app).get('/api/tutors/' + tutorObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', tutor.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single tutor with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/tutors/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Tutor is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single tutor which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent tutor
    request(app).get('/api/tutors/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No tutor with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an tutor if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new tutor
        agent.post('/api/tutors')
          .send(tutor)
          .expect(200)
          .end(function (tutorSaveErr, tutorSaveRes) {
            // Handle tutor save error
            if (tutorSaveErr) {
              return done(tutorSaveErr);
            }

            // Delete an existing tutor
            agent.delete('/api/tutors/' + tutorSaveRes.body._id)
              .send(tutor)
              .expect(200)
              .end(function (tutorDeleteErr, tutorDeleteRes) {
                // Handle tutor error error
                if (tutorDeleteErr) {
                  return done(tutorDeleteErr);
                }

                // Set assertions
                (tutorDeleteRes.body._id).should.equal(tutorSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an tutor if not signed in', function (done) {
    // Set tutor user
    tutor.user = user;

    // Create new tutor model instance
    var tutorObj = new Tutor(tutor);

    // Save the tutor
    tutorObj.save(function () {
      // Try deleting tutor
      request(app).delete('/api/tutors/' + tutorObj._id)
        .expect(403)
        .end(function (tutorDeleteErr, tutorDeleteRes) {
          // Set message assertion
          (tutorDeleteRes.body.message).should.match('User is not authorized');

          // Handle tutor error error
          done(tutorDeleteErr);
        });

    });
  });

  it('should be able to get a single tutor that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new tutor
          agent.post('/api/tutors')
            .send(tutor)
            .expect(200)
            .end(function (tutorSaveErr, tutorSaveRes) {
              // Handle tutor save error
              if (tutorSaveErr) {
                return done(tutorSaveErr);
              }

              // Set assertions on new tutor
              (tutorSaveRes.body.title).should.equal(tutor.title);
              should.exist(tutorSaveRes.body.user);
              should.equal(tutorSaveRes.body.user._id, orphanId);

              // force the tutor to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the tutor
                    agent.get('/api/tutors/' + tutorSaveRes.body._id)
                      .expect(200)
                      .end(function (tutorInfoErr, tutorInfoRes) {
                        // Handle tutor error
                        if (tutorInfoErr) {
                          return done(tutorInfoErr);
                        }

                        // Set assertions
                        (tutorInfoRes.body._id).should.equal(tutorSaveRes.body._id);
                        (tutorInfoRes.body.title).should.equal(tutor.title);
                        should.equal(tutorInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single tutor if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new tutor model instance
    tutor.user = user;
    var tutorObj = new Tutor(tutor);

    // Save the tutor
    tutorObj.save(function () {
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user.id;

          // Save a new tutor
          agent.post('/api/tutors')
            .send(tutor)
            .expect(200)
            .end(function (tutorSaveErr, tutorSaveRes) {
              // Handle tutor save error
              if (tutorSaveErr) {
                return done(tutorSaveErr);
              }

              // Get the tutor
              agent.get('/api/tutors/' + tutorSaveRes.body._id)
                .expect(200)
                .end(function (tutorInfoErr, tutorInfoRes) {
                  // Handle tutor error
                  if (tutorInfoErr) {
                    return done(tutorInfoErr);
                  }

                  // Set assertions
                  (tutorInfoRes.body._id).should.equal(tutorSaveRes.body._id);
                  (tutorInfoRes.body.title).should.equal(tutor.title);

                  // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                  (tutorInfoRes.body.isCurrentUserOwner).should.equal(true);

                  // Call the assertion callback
                  done();
                });
            });
        });
    });
  });

  it('should be able to get a single tutor if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new tutor model instance
    var tutorObj = new Tutor(tutor);

    // Save the tutor
    tutorObj.save(function () {
      request(app).get('/api/tutors/' + tutorObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', tutor.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single tutor, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      username: 'temp',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create temporary user
    var _user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _user.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Tutor
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = user._id;

          // Save a new tutor
          agent.post('/api/tutors')
            .send(tutor)
            .expect(200)
            .end(function (tutorSaveErr, tutorSaveRes) {
              // Handle tutor save error
              if (tutorSaveErr) {
                return done(tutorSaveErr);
              }

              // Set assertions on new tutor
              (tutorSaveRes.body.title).should.equal(tutor.title);
              should.exist(tutorSaveRes.body.user);
              should.equal(tutorSaveRes.body.user._id, userId);

              // now signin with the temporary user
              agent.post('/api/auth/signin')
                .send(_creds)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the tutor
                  agent.get('/api/tutors/' + tutorSaveRes.body._id)
                    .expect(200)
                    .end(function (tutorInfoErr, tutorInfoRes) {
                      // Handle tutor error
                      if (tutorInfoErr) {
                        return done(tutorInfoErr);
                      }

                      // Set assertions
                      (tutorInfoRes.body._id).should.equal(tutorSaveRes.body._id);
                      (tutorInfoRes.body.title).should.equal(tutor.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (tutorInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Tutor.remove().exec(done);
    });
  });
});

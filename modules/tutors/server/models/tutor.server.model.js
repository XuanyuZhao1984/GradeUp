'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Tutor Schema
 */
var TutorSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    default: '',
    trim: true,
    required: 'name cannot be blank'
  },
  language: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  imageURL: {
    type: String,
    default: 'modules/tutors/client/img/user-icon-6.png'
  },
  subject: {
    type: String,
    default: '',
    trim: true,
    required:true
  },
  hourly_rate: {
    type: Number,
    default: '',
    //trim: true,
    min:10,
    max:300
  },
  age: {
    type: Number,
    default: ''
    //trim: true,

  },
  gender: { type: String, required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  // [Long, Lat]
  updated_at: { type: Date, default: Date.now },
  address: {
    type: String,
    default: '',
    trim: true,
    required:true
  },
  city: {
    type: String,
    default: '',
    trim: true,
    required:true
  },
  available_days:{
    type:[String],
    required:true

  },

  description: { type: String, required: true }
});

mongoose.model('Tutor', TutorSchema);

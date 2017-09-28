'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    github: {
        id: String,
        displayName: String,
        username: String,
      publicRepos: Number
    },
   nbrClicks: {
      clicks: Number
   },
   pollIds: Array // should only consist of ID's
});

module.exports = mongoose.model('User', User);
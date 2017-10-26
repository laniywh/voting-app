"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var User = new Schema({
	twitter: {
		id: String,
		displayName: String
	},
	pollIds: [String], // should only consist of ID's
	votedPolls: [String] //consist of voted polls' IDs
});

module.exports = mongoose.model("User", User);

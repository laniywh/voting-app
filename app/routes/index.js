'use strict';

var bodyParser = require('body-parser');

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

var PollController = require(path + '/app/controllers/pollController.server.js');


module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();

	var pollController = new PollController();

	var urlencodedParser = bodyParser.urlencoded({ extended: false });

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/views/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/polls')
		.get(pollController.getPolls);

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);

	app.route('/api/:id/polls')
		.get(isLoggedIn, pollController.getUserPolls);

	app.route('/api/:pollId/vote')
		.post(urlencodedParser, pollController.updatePoll);


	app.route('/mypolls')
		.get(function (req, res) {
			res.sendFile()
		})

};

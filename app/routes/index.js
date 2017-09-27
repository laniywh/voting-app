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
			res.redirect('/');
			// res.sendFile(path + '/public/login.html');
		}
	}

	// function getLoginStatus(req, res, next) {
	// 	if (req.isAuthenticated()) {
	// 		return next();
	// 	} else {
	// 		res.json({ isLoggedIn: false });
	// 	}
	// }

	var clickHandler = new ClickHandler();

	var pollController = new PollController();

	var urlencodedParser = bodyParser.urlencoded({ extended: false });

	// app.route('/')
	// 	.get(function (req, res) {
	// 		res.sendFile(path + '/public/views/index.html');
	// 	});
	app.route('/')
		.get(pollController.showPolls);

	app.route('/poll/create')
		.get(isLoggedIn, pollController.newPollForm);

	// app.route('/user')
	// 	.get(isLoggedIn, function (req, res) {
	// 		res.sendFile(path + '/public/views/loggedIn.html');
	// 	});
	app.route('/user/polls')
		.get(isLoggedIn, pollController.getUserPolls);


	// app.route('/login')
	// 	.get(function (req, res) {
	// 		res.sendFile(path + '/public/login.html');
	// 	});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	// app.route('/api/polls')
	// 	.get(pollController.getPolls);


	app.route('/poll/:pollId')
		.get(pollController.showPoll);

	// app.route('/api/:id')
	// 	.get(isLoggedIn, function (req, res) {
	// 		res.json(req.user.github);
	// 	});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/'
		}));

	// app.route('/api/:id/polls')
	// 	.get(isLoggedIn, pollController.getUserPolls);

	app.route('/api/:pollId/vote')
		.post(urlencodedParser, pollController.updatePoll);

	app.route('/api/poll/create')
		.post(isLoggedIn, urlencodedParser, pollController.createPoll);

	app.route('/api/mypolls')
		.get(isLoggedIn, pollController.getUserPolls);

};

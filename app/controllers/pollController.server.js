var Users = require('../models/users.js');
var Polls = require('../models/polls.js');


function PollController() {

    this.showPoll = function (req, res) {

        Polls.findOne({ '_id': req.params.pollId }, function (err, poll) {
            if (err) { throw err; }

            res.render('pages/poll', {
                poll,
                isAuthenticated: req.isAuthenticated(),
                currPage: 'poll'
            });
        });

    };

    this.showPolls = function (req, res) {

        Polls.find({}, function (err, polls) {
            if (err) { throw err; }

            // res.json(polls);
            res.render('pages/index', { polls, isAuthenticated: req.isAuthenticated(), currPage: 'home' } );
        });
    };

    this.getUserPolls = function (req, res) {
        console.log('getting user polls...');

        Users
            .findOne({ 'github.id': req.user.github.id })
            .exec(function (err, user) {
                if (err) { throw err; }

                console.log(user.polls);

                // res.json(user.polls);

                res.render('pages/userPolls', {
                    polls: user.polls,
                    isAuthenticated: req.isAuthenticated(),
                    currPage: 'userPolls'
                });

            });
    };

    this.updatePoll = function (req, res) {
        var pollId = req.params.pollId;
        var selectedOption = req.body.selectedOption;

        Polls.findById(pollId, function (err, poll) {
            if (err) { throw err; }

            console.log('found poll');


            // increment vote for selected option
            for (var i = 0; i < poll.options.length; i++) {
                if (poll.options[i].name === selectedOption) {
                    poll.options[i].votes++;
                    break;
                }
            }

            // also update user's poll copy
            Users
                .findOne({ "github.id": req.user.github.id })
                .exec(function (err, user) {
                    var userPollInd = user.polls.findIndex(function (userPoll, index, array) {
                        console.log('user poll id:', userPoll._id);
                        console.log('poll id:', poll._id);

                        // TODO: fix never equal
                        return userPoll._id == poll._id;
                    });

                    console.log('userPollInd: ', userPollInd);
                    if (userPollInd > -1) {
                        console.log("updating user's poll copy...");
                        user.polls[userPollInd] = poll;

                        console.log('user polls:');
                        console.log(user.polls);
                        user.save();
                    }
                });



            poll.save(function (err, updatedPoll) {
                if (err) { console.log(err); }

                console.log(updatedPoll);
                res.json({
                    isLoggedIn: true,
                    updatedPoll: updatedPoll
                });
            });

        });

    };

    this.newPollForm = function (req, res) {
        res.render('pages/newPoll', {
            isAuthenticated: req.isAuthenticated(),
            currPage: 'newPoll'
        });
    };

    this.createPoll = function (req, res) {
        console.log('creating poll..');

        // parse options
        options = [];
        req.body.options.split(',').forEach(function (option) {
            options.push({
                name: option,
                votes: 0
            });
        });


        // save poll
         var poll = new Polls({
             name: req.body.title,
             options: options
         });

         poll.save(function (err, poll) {
             if (err) { throw err; }

             // add poll to current user's polls
             Users.findOne({ 'github.id': req.user.github.id }, function (err, user) {
                 if (err) { throw err; }

                 user.polls.push(poll);

                 user.save(function (err, user) {
                     if (err) { throw err; }
                 });
             });


            // res.json(poll);
            // res.render('pages/poll', {
            //     poll,
            //     isAuthenticated: req.isAuthenticated(),
            //     currPage: 'poll'
            // });
            res.redirect(`/poll/${poll._id}`);

         });
    }

}

module.exports = PollController;
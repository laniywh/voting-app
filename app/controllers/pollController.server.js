var Users = require('../models/users.js');
var Polls = require('../models/polls.js');

function PollController() {

    this.showPoll = function (req, res) {

        Polls.findOne({ '_id': req.params.pollId }, function (err, poll) {
            if (err) { throw err; }

            var isMyPoll = false;
            // check if current poll belongs to current user
            if(req.user) {
                isMyPoll = req.user.pollIds.includes(poll._id.toString());
            }

            res.render('pages/poll', {
                isMyPoll,
                poll,
                isAuthenticated: req.isAuthenticated(),
                currPage: 'poll'
            });
        });

    };

    this.showPolls = function (req, res) {

        Polls.find({}, function (err, polls) {
            if (err) { throw err; }
            res.render('pages/index', { polls, isAuthenticated: req.isAuthenticated(), currPage: 'home' } );
        });
    };

    this.getUserPollIds = function (req, res) {
        console.log('getting user polls...');

        Users
            .findOne({ 'twitter.id': req.user.twitter.id })
            .exec(function (err, user) {
                if (err) { throw err; }

                console.log(user.pollIds);

                res.render('pages/userPolls', {
                    pollIds: user.pollIds,
                    isAuthenticated: req.isAuthenticated(),
                    currPage: 'userPolls'
                });

            });
    };

    this.getPollName = function (req, res) {
        const pollId = req.params.pollId;

        Polls.findById(pollId, function (err, poll) {
            if(err) { throw err; }

            res.json({ pollName: poll.name });
        })
    };

    this.deletePoll = function (req, res) {
        const pollId = req.params.pollId;

        Polls.deleteOne({ '_id': pollId }, function (err) {
            if(err) { throw err; }

            Users.findOne({ 'twitter.id': req.user.twitter.id }, function (err, user) {
                if(err) { throw err; }

                user.pollIds.pull(pollId);

                user.save(function (err, user) {
                    if(err) { throw err; }

                    res.sendStatus(200);
                });

            });
        })
    }

    this.updatePoll = function (req, res) {
        var pollId = req.params.pollId;
        var selectedOption = req.body.selectedOption;

        Polls.findById(pollId, function (err, poll) {
            if (err) { throw err; }

            // increment vote for selected option
            for (var i = 0; i < poll.options.length; i++) {
                if (poll.options[i].name === selectedOption) {
                    poll.options[i].votes++;
                    break;
                }
            }

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
             Users.findOne({ 'twitter.id': req.user.twitter.id }, function (err, user) {
                 if (err) { throw err; }

                 user.pollIds.push(poll._id);

                 user.save(function (err, user) {
                     if (err) { throw err; }
                 });
             });

            res.render('pages/poll', {
                isMyPoll: true,
                poll,
                isAuthenticated: req.isAuthenticated(),
                currPage: 'poll'
            });

         });
    }

}

module.exports = PollController;
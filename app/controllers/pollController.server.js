var Users = require('../models/users.js');
var Polls = require('../models/polls.js');

function PollController() {

    this.getPolls = function (req, res) {

        Polls.find({}, function (err, polls) {
            if (err) { throw err; }

            res.json(polls);
        });
    };

    this.getUserPolls = function (req, res) {
        Users
            .findOne({ 'github.id': req.user.github.id })
            .exec(function (err, result) {
                if (err) { throw err; }

                res.json(result.polls);
            })
    };

    // this.getPoll = function (req, res) {
    //     Polls.findOne({ _id: req.params.id }, function (err, poll) {
    //         if (err) { throw err; }

    //         res.sendFile('poll');
    //     });
    // }

}

module.exports = PollController;
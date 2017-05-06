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

    this.updatePoll = function (req, res) {
        var pollId = req.params.pollId;
        var selectedOption = req.body.selectedOption;

        Polls.findById(pollId, function (err, poll) {
            if (err) return handleError(err);

            // increment vote for selected option
            for (var i = 0; i < poll.options.length; i++) {
                if (poll.options[i].name === selectedOption) {
                    poll.options[i].votes++;
                    break;
                }
            }

            poll.save(function (err, updatedPoll) {
                if (err) return handleError(err);

                // console.log(updatedPoll);
                res.json(updatedPoll);
            });

        });

    }

    // this.getPoll = function (req, res) {
    //     Polls.findOne({ _id: req.params.id }, function (err, poll) {
    //         if (err) { throw err; }

    //         res.sendFile('poll');
    //     });
    // }

}

module.exports = PollController;
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
            if (err) { throw err; }

            console.log('found poll');


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

    }

    this.createPoll = function (req, res) {
        console.log('creating poll..');

        // parse options
        options = [];
        console.log(req.body.options);
        req.body.options.split(',').forEach(function (option) {
            options.push({
                name: option,
                votes: 0
            });
        });


         var poll = new Polls({
             name: req.body.title,
             options: options
         });

         poll.save(function (err, newPoll) {
             if (err) { throw err; }

             res.json(newPoll);
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
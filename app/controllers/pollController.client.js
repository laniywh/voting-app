'use strict';

(function () {

    var pollsSection = document.querySelector('.polls');
    var pollsContainer= document.querySelector('.polls-container');
    var pollDetailsContainer = document.querySelector('.poll-details');
    var pollForm = document.querySelector('#pollForm');
    var submitBtn = document.querySelector('#submit-btn');
    var graphContainer = document.querySelector('.graph');
    var apiUrlPolls = appUrl + '/api/polls';
    var apiUrlUpdatePoll = appUrl + '/api/pollId/vote';
    var currPollId;
    var polls;

    function showPolls(data) {
        polls= JSON.parse(data);
        console.log(polls);
        var html = "";

        if (polls.length > 0) {
            polls.forEach(function (poll) {
                var pollListElem = `
                    <li class="list-group-item poll"
                        data-id=${poll._id}>

                            ${poll.name}

                    </li>`;
                html += pollListElem;
            });

            pollsContainer.innerHTML = html;

            onPollClick();
        }
    }

    function onPollClick() {
        document.querySelector('.poll').addEventListener('click', function () {
            // ajaxFunctions.ajaxRequest('GET', appUrl + '/poll/' + poll.dataset.id);

            pollsSection.style.display = "none";

            currPollId = this.dataset.id;
            showPollDetails(currPollId);
        });
    }

    function showPollDetails(pollId) {
        console.log(pollId);

        var pollNameContainer = document.querySelector('#poll-name');
        var pollOptionsContainer = document.querySelector('.poll-options');
        var pollForm = document.querySelector('#pollForm');

        // update form action with current poll id
        var updatedAction = pollForm.action.replace('pollId', pollId);
        pollForm.action = updatedAction;

        pollDetailsContainer.style.display = "block";

        // find poll by id
        var poll = polls.find(function (poll) {
            return poll._id === pollId;
        });

        pollNameContainer.innerHTML = poll.name;

        // list options
        var optionsHtml = '';
        for (var i = 0; i < poll.options.length; i++) {
            optionsHtml += `
                <input type="radio"
                       name="option"
                       value="${poll.options[i].name}"
                       ${i==0 ? 'checked' : ''}>
                       ${poll.options[i].name}<br>
            `;
        }

        pollOptionsContainer.innerHTML = optionsHtml;

        drawGraph(poll.options);

        onFormSubmit();

    }

    function onFormSubmit() {
        submitBtn.addEventListener('click', function (ev) {
            ev.preventDefault();
            console.log('form submit');

            var apiVote = appUrl + `/api/${currPollId}/vote`;

            // get option selected
            var formData = new FormData(pollForm);
            var selectedOption = formData.get('option');

            // create params for post request
            var params = `selectedOption=${selectedOption}`;

            ajaxFunctions.ajaxRequest('POST', apiVote, function (data) {
                var data = JSON.parse(data);

                if (data.isLoggedIn) {
                    var poll = data.updatedPoll;

                    // update graph
                    graphContainer.innerHTML = '';
                    drawGraph(poll.options);
                } else {
                    alert('Login in to vote!');
                }
            }, params);
        });
    }

    function drawGraph(dataset) {

        var width = 360;
        var height = 360;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 75;                            // NEW

        var color = d3.scaleOrdinal(d3.schemeCategory20b);

        var svg = d3.select('.graph')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');

        var arc = d3.arc()
          .innerRadius(radius - donutWidth)
          .outerRadius(radius);

        var pie = d3.pie()
          .value(function(d) { return d.votes; })
          .sort(null);

        var path = svg.selectAll('path')
          .data(pie(dataset))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', function(d, i) {
            return color(d.data.name);
          });


        // tooltip

        var tooltip = d3.select('.graph')
            .append('div')
            .attr('class', 'tooltip');

        tooltip.append('div')
            .attr('class', 'label');

        tooltip.append('div')
            .attr('class', 'count');

        tooltip.append('div')
            .attr('class', 'percent');

        path.on('mouseover', function(d) {
            var total = d3.sum(dataset.map(function (d) {
                return d.votes;
            }));


            var percent = Math.round(1000 * d.data.votes / total) / 10;
            tooltip.select('.label').html(d.data.name);
            tooltip.select('.count').html(d.data.votes);
            tooltip.select('.percent').html(percent + '%');
            tooltip.style('opacity', 1);

        });

        path.on('mouseout', function () {
            tooltip.style('opacity', 0);
        });

        // label follows mouse
        path.on('mousemove', function () {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX + 10) + 'px');
        });

    }

    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrlPolls, showPolls));

})();
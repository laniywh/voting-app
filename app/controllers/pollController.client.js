"use strict";

(function() {
    var homePageContent = document.querySelector(".home-page-content");
    var newPollFormContainer = document.querySelector(
        ".new-poll-form-container"
    );
    var pollsContainer = document.querySelector(".polls-container");
    var pollContainer = document.querySelector(".poll-container");
    var pollForm = document.querySelector("#pollForm");

    var loginBtn = document.querySelector(".login-btn");
    var submitBtn = document.querySelector("#submit-btn");
    var graphContainer = document.querySelector(".graph");
    var apiUrlPolls = appUrl + "/api/polls";
    var apiUrlUpdatePoll = appUrl + "/api/pollId/vote";
    var apiUrlMyPolls = appUrl + "/api/mypolls";
    var currPollId;
    var polls;
    var myPolls;

    var newPollBtn = document.querySelector(".new-poll-btn");
    var myPollBtn = document.querySelector(".my-polls-btn");

    if (newPollBtn) {
        newPollBtn.addEventListener("click", newPoll);
    }

    if (myPollBtn) {
        myPollBtn.addEventListener("click", showMyPolls);
    }

    function showMyPolls() {
        console.log("click mypolls");

        if (myPolls) {
            // show polls
            console.log("has mypolls");
        } else {
            console.log("fetching mypolls");

            // request my polls from server
            ajaxFunctions.ajaxRequest("GET", apiUrlMyPolls, function(myPolls) {
                myPolls = JSON.parse(myPolls);
                console.log(myPolls);

                // render polls
            });
        }
    }

    function newPoll(data) {
        console.log("show new poll form");

        homePageContent.style.display = "none";
        pollContainer.style.display = "none";
        newPollFormContainer.style.display = "block";

        newPollFormContainer.innerHTML = `
            <form method="post" action="/" id="new-poll-form">
              <div class="form-group">
                <label for="title">Title</label>
                <input type="text" class="form-control" id="title">
              </div>
              <div class="form-group">
                <label for="options">Options (seperated by line)</label>
                <textarea class="form-control" id="options" rows="5"></textarea>
              </div>
              <input class="btn" type="submit" value="Submit" id="submit-poll-btn">
            </form>
        `;

        var submitPollBtn = document.querySelector("#submit-poll-btn");

        submitPollBtn.addEventListener("click", submitPoll);
    }

    function submitPoll(ev) {
        ev.preventDefault();

        var newPollForm = document.querySelector("#new-poll-form");
        var title = document.querySelector("#title").value;
        var options = document
            .querySelector("#options")
            .value.split("\n")
            .toString();
        var params = `title=${title}&options=${options}`;

        ajaxFunctions.ajaxRequest(
            "POST",
            appUrl + "/api/poll/create",
            function(poll) {
                var poll = JSON.parse(poll);

                // hide the form
                newPollFormContainer.style.display = "none";

                myPolls = myPolls || [];
                console.log(poll);
                polls.push(poll);
                myPolls.push(poll);
                currPollId = poll._id;
                showPollDetails(currPollId);
            },
            params
        );
    }

    function showPolls(pollsJson) {
        console.log("add polls to page...");

        polls = JSON.parse(pollsJson);
        var html = "";

        if (polls.length > 0) {
            polls.forEach(function(poll) {
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
        var pollElems = document.querySelectorAll(".poll");

        pollElems.forEach(function(pollElem) {
            pollElem.addEventListener("click", function() {
                homePageContent.style.display = "none";

                currPollId = this.dataset.id;
                showPollDetails(currPollId);
            });
        });
    }

    function showPollDetails(pollId) {
        clearPollDetails();
        console.log("show poll:" + pollId);

        var pollNameContainer = document.querySelector("#poll-name");
        var pollOptionsContainer = document.querySelector(".poll-options");
        var pollForm = document.querySelector("#pollForm");

        // update form action with current poll id
        var updatedAction = pollForm.action.replace("pollId", pollId);
        pollForm.action = updatedAction;

        pollContainer.style.display = "block";

        // find poll by id
        var poll = polls.find(function(poll) {
            return poll._id === pollId;
        });

        pollNameContainer.innerHTML = poll.name;

        // list options
        var optionsHtml = "";
        for (var i = 0; i < poll.options.length; i++) {
            optionsHtml += `
                <input type="radio"
                       name="option"
                       value="${poll.options[i].name}"
                       ${i == 0 ? "checked" : ""}>
                       ${poll.options[i].name}<br>
            `;
        }

        pollOptionsContainer.innerHTML = optionsHtml;

        drawGraph(poll.options);

        onFormSubmit();
    }

    function clearPollDetails() {
        graphContainer.innerHTML = "";
    }

    function onFormSubmit() {
        submitBtn.addEventListener("click", function(ev) {
            ev.preventDefault();
            console.log("form submit");

            var apiVote = appUrl + `/api/${currPollId}/vote`;

            // get option selected
            var formData = new FormData(pollForm);
            var selectedOption = formData.get("option");

            // create params for post request
            var params = `selectedOption=${selectedOption}`;

            ajaxFunctions.ajaxRequest(
                "POST",
                apiVote,
                function(data) {
                    var data = JSON.parse(data);
                    console.log(data);

                    if (data.isLoggedIn) {
                        var poll = data.updatedPoll;

                        // update graph
                        graphContainer.innerHTML = "";
                        drawGraph(poll.options);
                    } else {
                        alert("Login in to vote!");
                    }
                },
                params
            );
        });
    }

    function drawGraph(dataset) {
        var width = 360;
        var height = 360;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 75; // NEW

        var color = d3.scaleOrdinal(d3.schemeCategory20b);

        var svg = d3
            .select(".graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr(
                "transform",
                "translate(" + width / 2 + "," + height / 2 + ")"
            );

        var arc = d3
            .arc()
            .innerRadius(radius - donutWidth)
            .outerRadius(radius);

        var pie = d3
            .pie()
            .value(function(d) {
                return d.votes;
            })
            .sort(null);

        var path = svg
            .selectAll("path")
            .data(pie(dataset))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", function(d, i) {
                return color(d.data.name);
            });

        // tooltip

        var tooltip = d3
            .select(".graph")
            .append("div")
            .attr("class", "tooltip");

        tooltip.append("div").attr("class", "label");

        tooltip.append("div").attr("class", "count");

        tooltip.append("div").attr("class", "percent");

        path.on("mouseover", function(d) {
            var total = d3.sum(
                dataset.map(function(d) {
                    return d.votes;
                })
            );

            var percent = Math.round(1000 * d.data.votes / total) / 10;
            tooltip.select(".label").html(d.data.name);
            tooltip.select(".count").html(d.data.votes);
            tooltip.select(".percent").html(percent + "%");
            tooltip.style("opacity", 1);
        });

        path.on("mouseout", function() {
            tooltip.style("opacity", 0);
        });

        // label follows mouse
        path.on("mousemove", function() {
            tooltip
                .style("top", d3.event.layerY + 10 + "px")
                .style("left", d3.event.layerX + 10 + "px");
        });
    }

    ajaxFunctions.ready(
        ajaxFunctions.ajaxRequest("GET", apiUrlPolls, showPolls)
    );
})();

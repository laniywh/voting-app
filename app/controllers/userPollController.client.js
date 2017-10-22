"use strict";

(function() {
    var pollsUl = document.querySelector(".polls-ul");
    var apiUrl = appUrl + "/api/:id/mypolls";

    function updatePolls(data) {
        var pollsArray = JSON.parse(data);

        if (pollsArray.length > 0) {
            pollsArray.forEach(function(poll) {
                var pollListElem = document.createElement("li");
                var pollContent = document.createTextNode(poll.name);
                pollListElem.appendChild(pollContent);
                pollsUl.appendChild(pollListElem);
            });
        }
    }

    ajaxFunctions.ready(ajaxFunctions.ajaxRequest("GET", apiUrl, updatePolls));
})();

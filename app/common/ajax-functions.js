"use strict";

var appUrl = window.location.origin;
var ajaxFunctions = {
   ready: function ready(fn) {
      if (typeof fn !== "function") {
         return;
      }

      if (document.readyState === "complete") {
         return fn();
      }

      document.addEventListener("DOMContentLoaded", fn, false);
   },
   ajaxRequest: function ajaxRequest(method, url, callback, params = null) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function() {
         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xmlhttp.response);
         }
      };

      xmlhttp.open(method, url, true);

      // set header for post
      if (params) {
         xmlhttp.setRequestHeader(
            "Content-type",
            "application/x-www-form-urlencoded"
         );
      }

      if (params) {
         xmlhttp.send(params);
      } else {
         xmlhttp.send();
      }
   }
};

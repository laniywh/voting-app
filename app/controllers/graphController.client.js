'use strict';

(function () {

    var donut = d3.select('#svg-donut');

    var arc = d3.svg.arc()
        .innerRadius(80)
        .outerRadius(200)
        .startAngle(0)
        .endAngle(1.5*Math.PI);

    donut.append('path')
        .attr('d', arc)
        .attr('transform', 'translate(200,200)');


})();
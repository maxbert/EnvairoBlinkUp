var width,height;

height = document.documentElement.clientHeight * 0.5;
width = document.documentElement.clientWidth * 0.8;

$('#darrow').on('click',function(){window.location.replace('../../../sites')});



var svg = d3.select("svg");
svg.attr('width', width).attr('height',height).append('rect').attr('width',width).attr('height',height).attr('fill','transparent');

var zone = $("#zone").html();
var site = $("#sitename").html();


var drawgraph = function(pointype){
    

    console.log(pointype);
    var listo;
    $("#pointtype").html(pointype.name);
    var apiCall = "/dashboard/" + zone + "/" + zone + "/" + pointype.apiref +"/"

    jQuery.ajax ({
	url: apiCall,
	type: "GET",
	async: false,


	success: function(response) {listo=response;}
    });
    





    var chartWidth, chartHeight
    var margin
    
    var axisLayer = svg.append("g").classed("axisLayer", true)
    var chartLayer = svg.append("g").classed("chartLayer", true)
    
    var xScale = d3.scaleTime()
    var yScale = d3.scaleLinear()
    
    var items = [];

    listo.forEach(function(e){
	var item = cast(e);
	items.push(item);
    });

    console.log(items);
    main(items);


	

   
    function cast(d) {
        d.date = new Date(d.date)
        d.value = +d.value
        return d 
    }
     
    function main(data) {
        setSize(data)
	drawAxis()
        drawChart(data)    
    }

    function mindate(data){
	var data2 = [];
	data.forEach(function(e){data2.push(e.date)});
	return new Date(d3.min(data2));
    }
    function maxdate(data){
	var data2 = [];
	data.forEach(function(e){data2.push(e.date)});
	return new Date(d3.max(data2));
    }
    
    function setSize(data) {
	
        margin = {top:10, left:30, bottom:40, right:0 }
        
        
        chartWidth = width - (margin.left+margin.right)
        chartHeight = height - (margin.top+margin.bottom)
        
        svg.attr("width", width).attr("height", height)
        
        axisLayer.attr("width", width).attr("height", height)
        
        chartLayer
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("transform", "translate("+[margin.left, margin.top]+")")
            
            
        xScale.domain([mindate(data), maxdate(data)]).range([0, chartWidth])
        yScale.domain([200, 1000]).range([chartHeight,0])
    }
		
    function drawChart(data) {
        var t = d3.transition()
            .duration(10000)
            .ease(d3.easeLinear)
            
        
        var lineGen = d3.line()
            .x(function(d) { var xs =xScale(d.date); if (isNaN(xs)){xs=0}; return xs })
            .y(function(d) { var ys =yScale(d.value); if (isNaN(ys)){ys=0}; return ys })
            .curve(d3.curveStep)
            
        var line = chartLayer.selectAll(".line")
            .data([data])
            
        line.enter().append("path").classed("line", true)
            .merge(line)
            .attr("d", lineGen)
            .attr("fill", "none")
            .attr("stroke", "#9FD4FB")
	.attr("stroke-width", "2px")
            .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
            .attr("stroke-dashoffset", function(d){ return this.getTotalLength() })
        
        chartLayer.selectAll(".line").transition(t)
            .attr("stroke-dashoffset", 0)
        
    }
    
    function drawAxis(){
        var yAxis = d3.axisLeft(yScale)
            
        var xAxis = d3.axisBottom(xScale)


	axisLayer.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate("+[margin.left, chartHeight]+")")
	    .attr("fill", "#9FD4FB")
	    .attr("color", "#9FD4FB")
	    .attr("text", "#9FD4FB")
            .call(xAxis);


	
    };
    // append a g for all the mouse over nonsense
    var mouseG = svg.append("g")
	.attr("class", "mouse-over-effects");

    // this is the vertical line
    mouseG.append("path")
	.attr("class", "mouse-line")
	.style("stroke", "black")
	.style("stroke-width", "1px")
	.style("opacity", "0");

    // keep a reference to all our lines
    var lines = document.getElementsByClassName('line');

    // here's a g for each circle and text on the line
    var mousePerLine = mouseG.selectAll('.mouse-per-line')
	.data(data)
	.enter()
	.append("g")
	.attr("class", "mouse-per-line");

    // the circle
    mousePerLine.append("circle")
	.attr("r", 7)
	.style("stroke", function(d) {
	    return color(d.name);
	})
	.style("fill", "none")
	.style("stroke-width", "1px")
	.style("opacity", "0");

    // the text
    mousePerLine.append("text")
	.attr("transform", "translate(10,3)");

    // rect to capture mouse movements
    mouseG.append('svg:rect')
	.attr('width', width)
	.attr('height', height)
	.attr('fill', 'none')
	.attr('pointer-events', 'all')
	.on('mouseout', function() { // on mouse out hide line, circles and text
	    d3.select(".mouse-line")
		.style("opacity", "0");
	    d3.selectAll(".mouse-per-line circle")
		.style("opacity", "0");
	    d3.selectAll(".mouse-per-line text")
		.style("opacity", "0");
	})
	.on('mouseover', function() { // on mouse in show line, circles and text
	    d3.select(".mouse-line")
		.style("opacity", "1");
	    d3.selectAll(".mouse-per-line circle")
		.style("opacity", "1");
	    d3.selectAll(".mouse-per-line text")
		.style("opacity", "1");
	})
	.on('mousemove', function() { // mouse moving over canvas
	    var mouse = d3.mouse(this);

	    // move the vertical line
	    d3.select(".mouse-line")
		.attr("d", function() {
		    var d = "M" + mouse[0] + "," + height;
		    d += " " + mouse[0] + "," + 0;
		    return d;
		});

	    // position the circle and text
	    d3.selectAll(".mouse-per-line")
		.attr("transform", function(d, i) {
		    console.log(width/mouse[0])
		    var xDate = x.invert(mouse[0]),
			bisect = d3.bisector(function(d) { return d.date; }).right;
		    idx = bisect(d.values, xDate);

		    // since we are use curve fitting we can't relay on finding the points like I had done in my last answer
		    // this conducts a search using some SVG path functions
		    // to find the correct position on the line
		    // from http://bl.ocks.org/duopixel/3824661
		    var beginning = 0,
			end = lines[i].getTotalLength(),
			target = null;

		    while (true){
			target = Math.floor((beginning + end) / 2);
			pos = lines[i].getPointAtLength(target);
			if ((target === end || target === beginning) && pos.x !== mouse[0]) {
			    break;
			}
			if (pos.x > mouse[0])      end = target;
			else if (pos.x < mouse[0]) beginning = target;
			else break; //position found
		    }

		    // update the text with y value
		    d3.select(this).select('text')
			.text(y.invert(pos.y).toFixed(2));

		    // return position
		    return "translate(" + mouse[0] + "," + pos.y +")";
		});
	});
}

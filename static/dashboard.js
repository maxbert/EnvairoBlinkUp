
var width,height;
//get dimentions for the graph space
height = document.documentElement.clientHeight * 0.4;
width = document.documentElement.clientWidth * 0.8;
//make the back button work
$('#darrow').on('click',function(){window.location.replace('/sites')});

//set the size of the plot div

$("#plot").attr("width",width).attr("height",height);
var zone = $("#zone").html();//get zone name and site name, which are written into hidden divs on page load
var site = $("#sitename").html();
var date=[];
var val=[];
//the plotting function
//pointtype is an object, {name:displayname, apiref:pointname}

var active = "none"
var drawgraph = function(pointype,state){
    if( active == pointype.name && state != 'refresh'){
	return;
    }

    active = pointype.name;

    console.log(pointype);
    var listo;
    $("#pointtype").html(pointype.name);
    //call the flask app to return the data
    var apiCall = "/dashboard/" + zone + "/" + zone + "/" + pointype.apiref +"/"

    jQuery.ajax ({
	url: apiCall,
	type: "GET",
	async: false,


	success: function(response) {listo=response;}
    });
    //make values positive and make the date a real date object
    function cast(d) {
        d.date = new Date(d.date);
        d.value = +d.value;
        return d;
    }
    //cast the list
    var listo2 = [];
    listo.forEach(function(e){listo2.push(cast(e))});
    listo = listo2;
    //make a date list and a value list for x and y plotting
    var dates = [];
    listo.forEach(function(e){dates.push(e['date'])});
    var vals = [];
    listo.forEach(function(e){vals.push(e['value'])});
    date=dates;val=vals;

    //plotly code
    var ploto = document.getElementById('plot');
    Plotly.plot( ploto,
		 [{x: dates,
		   y: vals,
		   line: { color: "#9FD4FB" }}],

		 {margin: { t: 0 },
		  paper_bgcolor:"transparent",
		  plot_bgcolor:"transparent",
		  xaxis: {
		      autorange: true,
		      showgrid: false,
		      zeroline: false,
		      showline: false,
		      autotick: true,
		      ticks: '',
		      showticklabels: true,
		      tickfont: {
			  family: "montserrat, sans-serif",
			  color:"#9FD4FB"
		      }
		  },
		  yaxis: {
		      autorange: true,
		      showgrid: false,
		      zeroline: false,
		      showline: false,
		      autotick: true,
		      ticks: '',
		      showticklabels: true,
		      tickfont: {
			  family: "montserrat, sans-serif",
			  color:"#9FD4FB"
		      }
		  }},

		 {displayModeBar: false,
		  displaylogo: false,
		  hoverinfo: "y",
		  dragmode:'pan',
		  scrollZoom:true
		 } );
    console.log("v23");
}



drawgraph({name:'CO2',apiref:'room.co2.1'}, 'init');
window.onload(function(e){
    $('#datepicker').datepicker();
});

window.onload(function(e){
    $('#datepicker').datepicker();
    $('#datepicker2').datepicker();
});

function formatDate(date) {

    var day = date.getDate();
    var monthIndex = date.getMonth() +1;
    var year = date.getFullYear();

    return monthIndex+ '/' + day + '/' + year;
}




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
var drawgraph = function(pointype,state,start,end){
   
    if( active == pointype.name && state != 'refresh'){
	return;
    }
    
    
    if(start && end){
	start = new Date(start);
	end = new Date(end);
    }
    
    active = pointype.name;
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
   

    function within(d, start, end){
	return(d >= start && d <=end);
    }
    //cast the list
    var listo2 = [];
    listo.forEach(function(e){listo2.push(cast(e))});

    listo2.forEach(function(e){
	if(start && end){
	    if(within((e['date']),start,end)){
		listo2.push(e);
	    }
	}
    });
    
    listo=listo2;
		 
    //make a date list and a value list for x and y plotting
    var dates = [];
    listo.forEach(function(e){dates.push(e['date'])});
    var vals = [];
    listo.forEach(function(e){vals.push(e['value'])});
    if(state=='init'){
	date=dates;
    }
    val=vals;
    
    //plotly code
    var ploto = document.getElementById('plot');
    if(state == 'refresh'){
	console.log('restyling');
	
	Plotly.restyle( ploto,
		 {x: [dates],
		  y: [vals]}, [0]);
    }else{
	Plotly.newPlot( ploto,
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
    }
    console.log("v25");
}



drawgraph({name:'CO2',apiref:'room.co2.1'}, 'init');
window.onload(function(e){
    $('#datepicker').datepicker();
});

window.onload(function(e){
    $('#datepicker').datepicker();
    $('#datepicker2').datepicker();
});

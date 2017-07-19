
//date tools
function formatDate(date) {
    date = new Date(date);
    var day = date.getDate();
    var monthIndex = date.getMonth() +1;
    var year = date.getFullYear();

    return monthIndex+ '/' + day + '/' + year;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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
   
    if( active == pointype && state != 'refresh'){
	return;
    }
    
    
    if(start && end){
	start = new Date(start);
	end = new Date(end);
    }
    
    active = pointype;
    var listo = [];
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

    console.log(typeof(listo));
    if (typeof(listo) == typeof('abc')){
	window.location.replace('/login');
    }
    function within(d, start, end){
	return(d >= start && d <=end);
    }
    //cast the list
    var listo2 = [];
    listo.forEach(function(e){listo2.push(cast(e))});
    if (start && end){
	var listo3 = [];
	listo2.forEach(function(e){
	    if(start && end){
		if(within((e['date']),start,end)){
		    listo3.push(e);
	    }
	    }
	});
	
	listo=listo3;
    }else{
	listo=listo2;
    }
    //make a date list and a value list for x and y plotting
    var dates = [];
    listo.forEach(function(e){dates.push(e['date'])});
    var vals = [];
    listo.forEach(function(e){vals.push(e['value'])});
    
    if(state =='init'){
	date=dates;
    }
    
    val=vals;




    //plotly code
    var ploto = document.getElementById('plot');
    if(state == 'refresh'){
	function scalo(ploto){
	    Plotly.animate(ploto,
			   {layout:{
			       xaxis: {range:[d3.min(dates).getTime(),d3.max(dates).getTime()]},
			       yaxis: {range:[d3.min(vals),d3.max(vals)]},
			   }},
			   {transition: {
			       duration: 0,
			       easing: 'cubic-in-out'
			   }});
	}
	var update = {x:[dates], y:[vals]};
	
	Plotly.update(ploto,update);
	scalo(ploto);
		       
		       
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
    console.log("v36");
}




function imaging(gd)
     {
      Plotly.toImage(gd,{height:300,width:300})
         .then(
            function(url)
         {
             $('#jpg_export').attr("src", url);
             return Plotly.toImage(gd,{format:'jpeg',height:400,width:400});
         }
         )
     }


function seeessvee(pointype){
    var path;
    //call the flask app to return the data
    var apiCall = "/dashboard/" + zone + "/" + zone + "/" + pointype.apiref +"/download/"

    var start = new Date($('#datepicker').val());
    var end = addDays(new Date($('#datepicker2').val()),1);
    if( !start || !end){
	jQuery.ajax ({
	    url: apiCall,
	    type: "GET",
	    async: false,
	    success: function(response) {path=response;}
	});
    }else{
	jQuery.ajax ({
	    url: apiCall,
	    type: "GET",
	    async: false,
	    data: {'start':start,'end':end},
	    success: function(response) {path=response;}
	});
    $('#downloadbutton').attr('action',path).submit();
    
    }
}
    

drawgraph({name:'CO2',apiref:'room.co2.1'}, 'init');


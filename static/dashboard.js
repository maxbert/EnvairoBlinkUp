

//date tools
function formatDate(date) {
    date = new Date(date);
    var day = date.getDate();
    var monthIndex = date.getMonth() +1;
    var year = date.getFullYear();

    return monthIndex+ '/' + day + '/' + year;
}

function formatDateWithTime(date) {
    date = new Date(date);
    var day = date.getDate();
    var monthIndex = date.getMonth() +1;
    var hours = date.getHours() % 12;
    if(hours == 0){hours = 12;};
    var minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();

    return hours + ":" + minutes + " on " + monthIndex+ '/' + day;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);

    return result;
}




var width,height,footerh,headerh;
//get dimentions for the graph space

footerh = 90//$("footer").height();
headerh = $('#header').height();
navh = $('nav').height();







height = document.documentElement.clientHeight - footerh - headerh - navh - (document.documentElement.clientHeight * 0.05) - (document.documentElement.clientWidth * 0.02) - 40;
width = document.documentElement.clientWidth * 0.8;
//make the back button work
var zone = $("#zone").html();//get zone name and site name, which are written into hidden divs on page load
var site = $("#sitename").html();
$('#darrow').on('click',function(){window.location.replace('/sites/' + site)});

//set the size of the plot div

$(".plote").css("height",height);


var date=[];
var val=[];
//the plotting function
//pointtype is an object, {name:displayname, apiref:pointname}

var active = "none"
var drawgraph = function(pointype,state,start,end){
    $(".modal").css("display","block");
   
    if( active == pointype && state != 'refresh'){
	return;
    }
    
    
    if(start && end){
	start = new Date(start);
	end = new Date(end);
    }else{
	var start = "";
	var end = "";
    }
   
    active = pointype;
    var listo = [];
    $("#pointtype").html(pointype.name);
    $("#activate").html(pointype.name);
    //call the flask app to return the data
    
    var apiCall = "/dashboard/" + zone + "/" + zone + "/" + pointype.apiref
    jQuery.ajax ({
	url: apiCall,
	type: "GET",
	data:{'start':start,'end':end},
	
	success: function(response) {castlist(response);}
    });
    //make values positive and make the date a real date object
    function castlist(listo){
	function cast(d) {
            d.date = new Date(d.date);
            d.value = +d.value;
            return d;
	}
	

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
	if(listo.length == 0){
	    alert("no data available for that time");
	    $(".modal").css("display","none")
	    return;
	}
	//make a date list and a value list for x and y plotting
	var dates = [];
	listo.forEach(function(e){dates.push(e['date'])});
	var vals = [];
	listo.forEach(function(e){vals.push(e['value'])});
	if(state =='init'){
	    date=dates;
	}

	console.log(dates);
	console.log(vals);
	val=vals;
	if(state == 'init'){
	    var maxdate = d3.max(dates);
	    var maxval = 0;
	    listo.forEach(function(e){
		if(e['date'] == maxdate){
		    
		    maxval=e['value']}});
	    $('#dategot').html("as of " + formatDateWithTime( maxdate));
	    $('#num').html(maxval);
	    
	}

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
	    var update = {x:[dates], y:[vals], "connectgaps":false};
	    
	    Plotly.update(ploto,update);
	    scalo(ploto);
	    
	    
	}else{
	    Plotly.newPlot( ploto,
			    [{mode:'scatter',
			      "connectgaps": false,
			      connectgaps: false,
			      x: dates,
			      y: vals,
			       line: { color: "#18192b", connectgaps:false },
			       connectgaps:false}],

			    {margin: { t: 0 }, 
			     paper_bgcolor:"transparent",
			     plot_bgcolor:"transparent",
			     connectgaps:false,
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
				     color:"#18192b"
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
				     color:"#18192b"
				 }
			     },
			     autosize: false,
			     width: $('.plotecol').width(),
			     height: $('.plote').height() *0.8,
			    },

			    {displayModeBar: false,
			     displaylogo: false,
			     connectgaps:false,
			     hoverinfo: "y",
			     dragmode:'pan',
			     scrollZoom:true,
			    } );
	}

	$('#downloadpng').on('click', function(){
	    console.log('working?');
	    Plotly.update( ploto,{},
			    {margin: { t: 0 }, 
			     paper_bgcolor:"white",
			     plot_bgcolor:"white",
			    } ).then(function(){
				Plotly.downloadImage(ploto, {
				    format: 'png',
				    height: 1080,
				    width: 1920,
				    filename: active.name
				})
			    })
	});
				    
				   

	$(".modal").css("display","none")
    }
}


function seeessvee(pointype){

    $(".modal").css("display","block");
    function call(zone,pointype){var path;
				 //call the flask app to return the data
				 var apiCall = "/dashboard/" + zone + "/" + zone + "/" + pointype.apiref +"/download/"
				 
				 var start = new Date($('#datepicker').val());
				 var end = addDays(new Date($('#datepicker2').val()),1.17);
				 if( !start || !end){
				     jQuery.ajax ({
					 url: apiCall,
					 type: "GET",
					 success: function(response) {download($('#downloadbutton'),response);}
				     });
				 }else{
				     jQuery.ajax ({
					 url: apiCall,
					 type: "GET",
					 
					 data: {'start':start,'end':end},
					 success: function(response) { download($('#downloadbutton'),response);}
				     });
				     
				     
				     
				 }
				}
    call(zone,pointype);
    
    function download(item,path){
	item.attr('action',path).submit();
	
	$(".modal").css("display","none");
    }
}




drawgraph({name:'CO2',apiref:'room.co2.1'}, 'init');

 

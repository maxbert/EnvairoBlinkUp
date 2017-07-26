function updateZone(e,sitename){
    var dis = $('#dis' + e).val();
    var area = $('#area' + e).val();
    var height = $('#height' + e).val();
    var total_vent_area = $('#vent' + e).val();
    var data = {};
    console.log(dis);
    if(dis != ""){
	data['dis'] = dis;
    }else{
	data['dis'] = $('#dis' + e).attr('placeholder');
    }
    if(area != ""){
	data['area'] = area;
    }else{
	data['area'] = $('#area' + e).attr('placeholder');
    }
    if(height != ""){
	data['height'] = height;
    }else{
	data['height'] = $('#height' + e).attr('placeholder');
    }
    if(total_vent_area != ""){
	data['total_vent_area'] = total_vent_area;
    }else{
	data['total_vent_area'] = $('#vent' + e).attr('placeholder');
    }
    data['e_id']=sitename;
	
    console.log(data);

    
    jQuery.ajax ({
 	url: sitename + "/update/",
	type: "GET",
	data:data,
	success: function(response) {ret(response)}//dotheput(response,data)}
    });
    function ret(resp){
	var errorstring = "error: "
	if(resp.error){
	    Object.keys(resp).forEach(function(item,index){
		console.log(item);
		if( item !== undefined && item !== 'error'){
		    console.log(resp.item)
		    errorstring += item + "--" + resp[item][0] + "\n";
		    console.log(errorstring);
		}
	    }
				     )
	    alert(errorstring);
	}else{
	    window.location.reload()
	}
    }

}

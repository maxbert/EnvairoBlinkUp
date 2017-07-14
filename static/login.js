function getToke(){
    console.log("commencing post");
    user = $('#user').val();
    pass = $('#pass').val();
    var token = false;
    console.log(user);
    console.log(pass);
    jQuery.ajax ({
	url: '../auth',
	type: "POST",
	async: false,
	data: JSON.stringify({"username":user, "password":pass}),
	contentType: "application/json; charset=utf-8",
	success: function(response) { token = response;}
    });
    if(token.login){
	window.location.replace('../sites/');
    }else{
	alert('username or passowrd incorrect');
    }
}
window.onload= function(){
    $('#zarrow').on('click',function(){window.location.replace('../sites')});
        $('#darrow').on('click',function(){window.location.replace('../../../sites')});
};

$(function() {
	$('.Text').dotdotdot();
	$('.Epithet').dotdotdot();
	
	$("#peachfreeze .BubbleContainer").hover(
	  function () {
		  $(this).stop().animate({
			backgroundColor: "#69F",
		  },200);
	  },
	  function () {
		  $(this).stop().animate({
			backgroundColor: "#F93",
		  },200);
	  }
	);
	
	$('#peachfreeze .ContactsCheckBoxContainer').hover(
	  function () {
		  $(this).stop().animate({
			backgroundColor: "#6C6",
		  },200);
	  },
	  function () {
		  $(this).stop().animate({
			backgroundColor: "#F63",
		  },200);
	  }
	);
	
	$('#peachfreeze #profile-button').click(
		function(){
			var oldNameText = $('#peachfreeze #profile-container .Name').text();
			$('#peachfreeze #profile-container .Name').html("<input type='text' name='edit_name' id='edit_name_input' value='" + oldNameText + "'>");
			var oldEpithetText = $('#peachfreeze #profile-container .Epithet').text().replace(/^\s+|\s+$/g, '');
			$('#peachfreeze #profile-container .Epithet').html("<textarea  name='edit_epithet' id='edit_epithet_input'>" + oldEpithetText + "</textarea>");
			var oldDescriptionText = $('#peachfreeze #profile-description').text().replace(/^\s+|\s+$/g, '');
			$('#peachfreeze #profile-container #profile-description').html("<textarea name='edit_description' id='edit_description_input'>" + oldDescriptionText + "</textarea>");
		});

	var fingerPrint = $("#peachfreeze .FingerPrint").text().split(" ");
	for(var i=0;i<fingerPrint.length;i++){
		$("#finger-print").append("<div style='background-color: #" + fingerPrint[i].substring(0,6) + "'></div>")
	}

});
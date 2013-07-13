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

	$('#peachfreeze #contacts-button').click(
		function(){
			if( $('#peachfreeze #contacts-button').text() == "Add A Contact"){
				$('#peachfreeze #contacts-button').html("Add Contact");
				$('#peachfreeze #contacts-container').animate({
					marginTop: "62px",
				}, 500);
				$('#peachfreeze #contacts-column .PopupContainer').fadeIn("slow");
			}
			else{
				$('#peachfreeze #contacts-button').html("Add A Contact");
				//Do some shit here to post information about new contact to server
				//Update UI a new contact is created
				$('#peachfreeze #contacts-container').css("margin-top", "0px");
				$('#peachfreeze #contacts-column .PopupContainer').css("display", "none");
			}
	});

});
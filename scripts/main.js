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


});
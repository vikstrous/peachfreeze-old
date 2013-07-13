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

	var fingerPrint = $("#peachfreeze .FingerPrint").text().split(" ");
	for(var i=0;i<fingerPrint.length;i++){
		$("#finger-print").append("<div style='background-color: #" + fingerPrint[i].substring(0,6) + "'></div>")
	}

});
$(function() {
	$('.Text').dotdotdot();
	$('.Epithet').dotdotdot();
	
	var fadeInEverything = function(){
		$("#profile-column").hide();
		$("#broadcast-column").hide();
		$("#contacts-column").hide();
		$("#profile-column").fadeIn("slow",
			function(){
				$("#broadcast-column").fadeIn("slow",
					function(){
						$("#contacts-column").fadeIn("slow");
					})
			});
	}
	
	fadeInEverything();
	
	var updateBubbleAnimation = function(){
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
	}
	
	updateBubbleAnimation();
	
	

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
				var exampleJson = {
					imgUrl: "test/lorum.jpg",
					name: "Ben"
				}
				
				var serverResponse = exampleJson;
				$('#peachfreeze #contacts-container').prepend("<div class='ContactsPerson'><div class='BubbleContainer'><img src='"+ serverResponse.imgUrl +"' class='Image'/><div class='NameContainer'><h3 class='Name'>" + serverResponse.name + "</h3></div><div style='clear:left'></div></div><div class='ContactsCheckBoxContainer'></div><div style='clear:left'></div></div>");
				$('#peachfreeze #contacts-container').css("margin-top", "0px");
				$('#peachfreeze #contacts-column .PopupContainer').css("display", "none");
				updateBubbleAnimation();
			}
	});
	
	//$('#peachfreeze #post-button').click(
		// function(){
		// 	if( $('#peachfreeze #post-button').text() == "Post A Broadcast"){
		// 		$('#peachfreeze #post-button').html("Post Broadcast");
		// 		$('#peachfreeze #broadcast-container').animate({
		// 			marginTop: "135px",
		// 		}, 500);
		// 		$('#peachfreeze #broadcast-column .PopupContainer').fadeIn("slow");
		// 	}
		// 	else{
		// 		$('#peachfreeze #post-button').html("Add A Contact");
		// 		//Do some shit here to post information about new contact to server
		// 		var exampleJson = {
		// 			imgUrl: "test/lorum.jpg",
		// 			name: "Ben"
		// 		}
				
		// 		var serverResponse = exampleJson;
		// 		$('#peachfreeze #contacts-container').prepend("<div class='ContactsPerson'><div class='BubbleContainer'><img src='"+ serverResponse.imgUrl +"' class='Image'/><div class='NameContainer'><h3 class='Name'>" + serverResponse.name + "</h3></div><div style='clear:left'></div></div><div class='ContactsCheckBoxContainer'></div><div style='clear:left'></div></div>");
		// 		$('#peachfreeze #contacts-container').css("margin-top", "0px");
		// 		$('#peachfreeze #contacts-column .PopupContainer').css("display", "none");
		// 		updateBubbleAnimation();
		// 	}
	//});

});
$(document).ready(function() {
	var activeShapeButton = "3";
	var activeColorButton = "9";

	$(".tbButton.sButton").click(function(){
		if(activeShapeButton !== null) {
			$("#" + activeShapeButton).removeClass("tbButtonActive");
		}
		activeShapeButton = $(this).attr('id');
		
		$(this).toggleClass("tbButtonActive");
	});

	$(".tbButton.cButton").click(function(){
		if(activeColorButton !== null) {
			$("#" + activeColorButton).removeClass("tbButtonActive");
		}
		activeColorButton = $(this).attr('id');
		
		$(this).toggleClass("tbButtonActive");
	});
});
$(document).ready(function(){
	// Takk Daníel fyrir beinagrindina að öllu þessu og skemmtilegt verkefni.
	// Takk Bæring fyrir input boxið fyrir textann.
	var drawing = {
		shapes: [],
		nextObject: "chalk",
		nextColor: "white",
		redo: [],

		drawAll: function drawAll() {
			for (var i = 0; i < this.shapes.length; ++i) {
				this.shapes[i].draw();
			}
		}
	};

	$(".tbButton.sButton").click(function(event) {
		drawing.nextObject = $(this).attr("data-tooltype");
		if(currentInputBox) {
			currentInputBox.remove();
		}
	});

	$(".cButton.tbButton").click(function(event) {
		drawing.nextColor = $(this).attr("data-color");
	});

	$(".tbButton.doButton").click(function(){
		if ($(this).attr("id") === '7') {
			if (drawing.shapes.length !== 0) {
				drawing.redo.push(drawing.shapes.pop());
			}
		} else {
			if (drawing.redo.length !== 0) {
				drawing.shapes.push(drawing.redo.pop());
			}
		}
		context.clearRect(0,0,1060,445);
		drawing.drawAll();
	});

	$(".tbButton.doButton.clearButton").click(function(){
		if(confirm("Are you sure you want to clear the blackboard?")) {
			if(drawing.shapes.length !== 0) {
				drawing.shapes[0].clear();
			}
			drawing.shapes = [];
			drawing.nextObject = "chalk";
			drawing.nextColor = "white";
			drawing.redo = [];
		}
	});

	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");

	var startX = 0;
	var startY = 0;
	var oldX = 0;
	var oldY = 0;
	var isDrawing = false;
	var scribble = [];
	var xOff = 0;
	var yOff = 0;

	var currentInputBox;
	var selected;

	$("#myCanvas").mousedown(function(e){
		startX = e.pageX - this.offsetLeft - 10;
		startY = e.pageY - this.offsetTop - 10;
		if (drawing.nextObject === "selector") {
			for (var i = drawing.shapes.length - 1; i >= 0; i--) {
				var curr = drawing.shapes[i];
				if (curr.clicked(startX, startY)) {
					selected = curr;
					isDrawing = true;
					xOff = startX - curr.startX;
					yOff = curr.startY - startY;
					oldX = startX;
					oldY = startY;
				}
			}
		} else if (drawing.nextObject === "text") {
			if(currentInputBox) {
				currentInputBox.remove();
			}
			currentInputBox = $("<input />");
			currentInputBox.css("position", "fixed");
			currentInputBox.css("left", startX + 108);
			currentInputBox.css("top", startY + 59);
			currentInputBox.toggleClass("text");

			$(".mainSection").append(currentInputBox);
			
			$("input").focus();
		} else {
			oldX = startX;
			oldY = startY;
			isDrawing = true;
		}
	});

	$("#myCanvas").mousemove(function(e){
		if (isDrawing === true) {
			var x = e.pageX - this.offsetLeft - 10;
			var y = e.pageY - this.offsetTop - 10;

			if (drawing.nextObject === "chalk") {
				var chalk = new Chalk(x, y);
				chalk.draw();
				scribble.push(chalk);
			} else if (drawing.nextObject === "rect") {
				var rect = new Rect(x, y);
				rect.clear();
				rect.draw();
			} else if (drawing.nextObject === "circle") {
				var circ = new Circle(x, y);
				circ.clear();
				circ.draw();
			} else if (drawing.nextObject === "line") {
				var line = new Line(x, y);
				line.clear();
				line.draw();
			} else if (drawing.nextObject === "selector") {
				selected.clear();
				selected.move(x, y);
				selected.draw();
			}

			if (drawing.nextObject !== "chalk") {
				drawing.drawAll();
			}
			oldX = x;
			oldY = y;
		}
	});

	$("#myCanvas").mouseup(function(e){
		var x = e.pageX - this.offsetLeft - 10;
		var y = e.pageY - this.offsetTop - 10;
		isDrawing = false;

		if (drawing.nextObject === "line") {
			drawing.shapes.push(new Line(x, y));
			drawing.redo = [];
		} else if (drawing.nextObject === "rect") {
			drawing.shapes.push(new Rect(x, y));
			drawing.redo = [];
		} else if (drawing.nextObject === "circle") {
			drawing.shapes.push(new Circle(x, y));
			drawing.redo = [];
		} else if (drawing.nextObject === "chalk") {
			var chalkline = new ChalkLine();
			var maxX = -100; 
			var maxY = -100;
			var minX = 100000;
			var minY = 100000;
			var length = scribble.length;
			for (var i = 0; i < length; i++) {
				chalkline.chalks.push(scribble.pop());
				maxX = Math.max(maxX, chalkline.chalks[i].oldX);
				maxY = Math.max(maxY, chalkline.chalks[i].oldY);
				minX = Math.min(minX, chalkline.chalks[i].oldX);
				minY = Math.min(minY, chalkline.chalks[i].oldY);
			}

			chalkline.startX = minX;
			chalkline.startY = minY;
			chalkline.x = maxX;
			chalkline.y = maxY;

			drawing.shapes.push(chalkline);
			scribble = [];
			drawing.redo = [];
		} else if (drawing.nextObject === "selector") {
			if (selected !== undefined) {
				drawing.redo = [];
			}
		}
		
		drawing.drawAll();
	});

	$(document).keydown(function(e) {
		if(e.keyCode === 27) {
			if(currentInputBox) {
				currentInputBox.remove();
			}
		}
		else if(e.which === 13) {
			if(currentInputBox) {
				var inputBoxOffset = currentInputBox.offset();
				var text = new Text(startX, startY);
				text.text = $(".text").val();
				context.strokeLine();
				text.draw();
				text.x = startX + context.measureText(text.text).width;
				text.y = startY - parseInt(text.fontSize.substring(0, 2));
				currentInputBox.remove(); 
				drawing.shapes.push(text);
				drawing.redo = [];
			}
		}
	});

	var Shape = Base.extend({
		constructor: function(x,y) {
			this.color = drawing.nextColor;
			this.startX = startX;
			this.startY = startY;
			this.oldX = oldX;
			this.oldY = oldY;
			this.x = x;
			this.y = y;
			this.text = "";
			this.width = $("#thickness").val();
			this.font = $("#font").val();
			this.fontSize = $("#fontSize").val();
			this.shape = drawing.nextObject;
			this.chalks = [];
		},
		draw: function() {},
		drawEllipse: function() {},
		drawLine: function() {},
		clear: function() {
			context.clearRect(0,0,1060,445);
		},
		move: function(x, y) {
			this.x = this.x - (oldX - x);
			this.y = this.y - (oldY - y);
			this.startX = this.startX - (oldX - x);
			this.startY = this.startY - (oldY - y);
		},
		clicked: function(x, y) {
			var hiX = Math.max(this.x, this.startX),
				hiY = Math.max(this.y, this.startY), 
				loX = Math.min(this.x, this.startX),
				loY = Math.min(this.y, this.startY);

			if (Math.abs(hiX - loX) < 10) {
				hiX += 10;
				loX -= 10;
			}
			if (Math.abs(hiY - loY) < 10) {
				hiY += 10;
				loY -= 10;
			}
			
			return (loX <= x && x <= hiX && loY <= y && y <= hiY);
		}
	});
	
	var Line = Shape.extend({
		draw: function() {
			context.lineWidth = this.width;
			context.beginPath();
			context.moveTo(this.startX, this.startY);
			context.lineTo(this.x, this.y);
			context.strokeStyle = this.color;
			context.stroke();
		}
	});

	var Circle = Shape.extend({
		drawEllipse: function(x, y, w, h) {
			var kappa = 0.5522848,
			ox = (w / 2) * kappa,
			oy = (h / 2) * kappa,
			xe = x + w,
			ye = y + h,
			xm = x + w / 2,
			ym = y + h / 2;

			context.lineWidth = this.width;
			context.beginPath();
			context.moveTo(x, ym);
			context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
			context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
			context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
			context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
			context.strokeStyle = this.color;
			context.stroke();
		},
		draw: function() {
			var w = this.x - this.startX;
			var h = this.y - this.startY;
			this.drawEllipse(this.x - w, this.y - h, w, h);
		}
	});

	var Rect = Shape.extend({
		draw: function() {
			context.strokeStyle = this.color;
			context.lineWidth = this.width;
			var w = this.x - this.startX;
			var h = this.y - this.startY;
			context.strokeRect(this.startX, this.startY, w, h);
		}
	});

	var Chalk = Shape.extend({
		draw: function() {
			context.strokeStyle = this.color;
			context.lineWidth = this.width;
			context.beginPath();
			context.moveTo(this.oldX, this.oldY);
			context.lineTo(this.x, this.y);
			context.stroke();
		},
		move: function(x, y) {
			this.x = this.x - (oldX - x);
			this.y = this.y - (oldY - y);
			this.oldX = this.oldX - (oldX - x);
			this.oldY = this.oldY - (oldY - y);
		}
	});

	var ChalkLine = Shape.extend({
		draw: function() {
			for (var i = 0; i < this.chalks.length; i++) {
				this.chalks[i].draw();
			}
		},
		move: function(x, y) {
			var height = this.y - this.startY;
			var width = this.x - this.startX;
			this.startX = x;
			this.startY = y;
			this.x = this.startX + width;
			this.y = this.startY + height;

			var maxX = -100; 
			var maxY = -100;
			var minX = 100000;
			var minY = 100000;

			for (var i = 0; i < this.chalks.length; i++) {
				this.chalks[i].move(x, y);
				maxX = Math.max(maxX, this.chalks[i].oldX);
				maxY = Math.max(maxY, this.chalks[i].oldY);
				minX = Math.min(minX, this.chalks[i].oldX);
				minY = Math.min(minY, this.chalks[i].oldY);
			}

			this.startX = minX;
			this.startY = minY;
			this.x = maxX;
			this.y = maxY;
		}
	});

	var Text = Shape.extend({
		draw: function() {
			context.font = this.fontSize + this.font;
			context.fillStyle = this.color;
			context.fillText(this.text, this.startX, this.startY);
		},

		move: function(x, y) {
			var fSize = parseInt(this.fontSize.substring(0,2));
			var width = context.measureText(this.text).width;

			this.startX = x - xOff;
			this.startY = y + yOff;
			this.x = this.startX + width;
			this.y = this.startY - fSize;
		}
	});

});
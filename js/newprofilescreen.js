function NewProfileScreen()
{
	// webgl variables
	var canvas3d;	// canvas for drawing 3D cards
	var gl;			// context for webGL drawing
	var program;	// the shader program
	var pMatrix;	// projection matrix, remains the same all the time
	
	var cardTextureImg;	// a canvas, the assembled texture for the cards
	var texCtx;			// 2D context for assembling cards texture
	var cards = [];			// holds 3D cards objects
	
	var titleWindow = new GameWindow(this, "", 10, 10, 785, 50, 1);
	var commandWindow = new GameWindow(this, "", 10, 335, 785, 50, 2);
	var helpWindow = new GameWindow(this, "HELP", 10, 390, 786, 50, 3);
	
	var btnCards = new CommandButton("Reselect Cards", 10 + 100, 335 + 35);
	var btnSave = new CommandButton("Save", 10 + 350, 335 + 35);
	var btnCancel = new CommandButton("Cancel", 10 + 520, 335 + 35);
		
	var windowOpen = false;
	var windowAnimation = true;
	var drawCursor = false;
	var state = "";
	var cursorX = 0;
	var cursorY = 0;
	var timer = 0;
	var input = null;
	
	
	
	setupGL();
	
	// Create cards
	for (var n = 0; n < 7; n++)
	{
		cards[n] = new Card(gl, program, n * 2.3 - 7, -0.75, 0);
		cards[n].setData(Math.floor(Math.random() * 11));
		cards[n].setOwner(true);
		cards[n].setClosed(true);
	}
	
	
	
	function playSound(sound)
	{
		if (!sound.paused && sound.currentTime > 0)
		{
			sound.pause();
			sound.currentTime = 0;
		}
		sound.play();
	}
	
	function setupGL()
	{
		var vertexShaderText = 
		'precision mediump float;' +
		
		'uniform mat4 uMVMatrix;' +
		'uniform mat4 uPMatrix;' +
		
		'attribute vec3 aPosition;' +
		'attribute vec2 aTexCoord;' +
		
		'varying vec2 vTexCoord;' +
		
		'void main()' +
		'{' +
		'	vTexCoord = aTexCoord;' +
		'	gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);' +
		'}';
		
		var fragmentShaderText = 
		'precision mediump float;' +
		
		'uniform sampler2D sampler;' +
		'varying vec2 vTexCoord;' +
		
		'void main()' +
		'{' +
		'	gl_FragColor = texture2D(sampler, vTexCoord);' +
		'}';
		
		pMatrix = glMatrix.mat4.create();
		var mvMatrixStack = [];
	
		cardTextureImg = document.createElement("canvas");
		cardTextureImg.width = 94 * 2;
		cardTextureImg.height = 125;
		texCtx = cardTextureImg.getContext('2d');
		
		canvas3d = document.createElement("canvas");
		canvas3d.width = 800;
		canvas3d.height = 450;
		gl = canvas3d.getContext("webgl");
		
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		
		gl.shaderSource(vertexShader, vertexShaderText);
		gl.shaderSource(fragmentShader, fragmentShaderText);
	
		gl.compileShader(vertexShader);
		gl.compileShader(fragmentShader);
	
		program = gl.createProgram();
		
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		gl.validateProgram(program);
	
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.frontFace(gl.CCW);
		gl.cullFace(gl.BACK);
	
		gl.useProgram(program);
	
		program.pMatrixUniform = gl.getUniformLocation(program, 'uPMatrix');
		program.mvMatrixUniform = gl.getUniformLocation(program, 'uMVMatrix');
		
		var cardTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, cardTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	}
	
	// public methods
	this.update = function()
	{
		if (windowAnimation)
		{
			titleWindow.update();
			commandWindow.update();
			helpWindow.update();
		}
		else
		{
			if (state == "showCards")
			{
				timer++;
				if (timer >= 20)
				{
					for (var n = 0; n < cards.length; n++)
					{
						cards[n].addRot(Math.PI / 20);
					}
				}
				if (timer >= 39) state = "";
			}
			else if (state == "turnCards")
			{
				timer++;
				if (timer <= 40)
				{
					for (var n = 0; n < cards.length; n++)
					{
						cards[n].addRot(Math.PI / 20);
						if (timer == 20)
						{
							cards[n].setData(Math.floor(Math.random() * 11));
						}
					}
				}
				if (timer >= 40) state = "";
			}
		}
	}
	
	this.windowOpen = function(index)
	{
		if (index == 3) // Help Window
		{
			// Profile name
			input = document.createElement("input");
			input.type = "text";
			var style = 'position: absolute; top: 100px; left: 170px;';
			style += 'color: #FFFFFF; font-size: 30px; font-family: "Arial Narrow";';
			style += 'background-color: #666666; border: 2px solid #333333;';
			style += 'padding: 8px; width: 460px;';
			input.style = style;
			document.body.appendChild(input);
			input.value = "Squall";
			input.focus();			
			
			game.canvas.addEventListener("click", onClick, false);
			game.canvas.addEventListener("mousemove", onMouseMove, false);
			windowAnimation = false;
			windowOpen = true;
			timer = 0;
			state = "showCards";
		}
	}
	
	this.draw = function(ctx)
	{
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
		
		// Draw cards on 3D Canvas
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);			
		glMatrix.mat4.perspective(pMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 10000.0);
		for (var n = 0; n < cards.length; n++)
		{
			cards[n].draw(program, pMatrix, cardTextureImg, texCtx);	
		}
		ctx.drawImage(canvas3d, 0, 0);
		
		
		titleWindow.draw(ctx);
		commandWindow.draw(ctx);
		helpWindow.draw(ctx);
		
		if (windowOpen)
		{
			ctx.font = "25px Arial Narrow";
			ctx.fillStyle = "#FFFFFF";
			ctx.fillText("Create Profile", 10 + 20, 10 + 35);
			ctx.fillText("Enter profile name:", 169, 90);
			ctx.fillText("Initial cards:", 33, 180);
			ctx.fillText("Enter profile name and randomly choose initial cards.", 10 + 20, 390 + 35);
			
			btnCards.draw(ctx);
			btnSave.draw(ctx);
			btnCancel.draw(ctx);
		}
		
		if (drawCursor)
		{
			ctx.drawImage(game.imgCursor, cursorX, cursorY);
		}
	}
	
	function checkMouseOnButton(button, X, Y)
	{
		if (button.isMouseEnter(X, Y))
		{
			playSound(game.sndCursor);
			drawCursor = true;
			cursorX = button.getX() - 35;
			cursorY = button.getY() - 16;
			drawing = true;
		}
		else if (button.isMouseOut(X, Y))
		{
			drawCursor = false;
			drawing = true;
		}
	}
	
	function onMouseMove(e)
	{
		if (!windowOpen) return;
		
		checkMouseOnButton(btnCards, e.offsetX, e.offsetY);
		checkMouseOnButton(btnSave, e.offsetX, e.offsetY);
		checkMouseOnButton(btnCancel, e.offsetX, e.offsetY);
	}
	
	function format(num)
	{
		if (num < 10) return "0" + num;
		else return num.toString();
	}
	
	function onClick(e)
	{
		if (btnCards.onClick(e.offsetX, e.offsetY))
		{
			if (state != "showCards" && state != "turnCards")
			{
				playSound(game.sndClick);
				timer = 0;
				state = "turnCards";
			}
		}
		else if (btnSave.onClick(e.offsetX, e.offsetY))
		{
			var savedata = {};
			var cardNos = [];
			var cardQuant = [];
			var found = false;
			
			for (var n = 0; n < cards.length; n++)
			{
				found = false;
				for (var m = 0; m < cardNos.length; m++)
				{
					if (cardNos[m] == cards[n].getIndex())
					{
						found = true;
						cardQuant[m]++;
						break;
					}
				}
				if (!found)
				{
					cardNos.push(cards[n].getIndex());
					cardQuant.push(1);
				}
			}
			
			var datetime = new Date();
			var timestr = "";			
			timestr = format(datetime.getDate()) + "/" + format(datetime.getMonth() + 1) + "/" + datetime.getFullYear() + " " + format(datetime.getHours()) + ":" + format(datetime.getMinutes());
			
			savedata.profileName = input.value;
			savedata.wins = 0;
			savedata.losses = 0;
			savedata.draws = 0;
			savedata.datetime = timestr;
			savedata.count = 7;
			savedata.cards = cardNos;
			savedata.quant = cardQuant;
			
			if (game.currentProfile == 1)
			{
				game.saveData.profile1 = savedata;
			}
			else if (game.currentProfile == 2)
			{
				game.saveData.profile2 = savedata;
			}
			else if (game.currentProfile == 3)
			{
				game.saveData.profile3 = savedata;
			}
			
			window.localStorage.setItem("ttt", JSON.stringify(game.saveData));
			
			playSound(game.sndClick);
			document.body.removeChild(input);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			changeScreen("profile");
		}
		else if (btnCancel.onClick(e.offsetX, e.offsetY))
		{
			playSound(game.sndCoinBegin);
			document.body.removeChild(input);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			changeScreen("profile");
		}
	}
	
	
}
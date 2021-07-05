function ResultScreen()
{
	// webgl variables
	var canvas3d;	// canvas for drawing 3D cards
	var gl;			// context for webGL drawing
	var program;	// the shader program
	var pMatrix;	// projection matrix, remains the same all the time
	
	var cardTextureImg;	// a canvas, the assembled texture for the cards
	var texCtx;			// 2D context for assembling cards texture
	
	
	// variables
	var thisScreen = this; 		// used for windows not to lose reference
	var titleWindow = new GameWindow(this, "", 200, 10, 400, 50, 1);
	var message = "";
	var nameWindow;
	var confirmWindow;
	var btnYes;
	var btnNo;
	var textColor = "#FFFFFF";
	
	var musicStop = game.scoreDiff <= 0;
	var state = "cardsShowingUp";
	var windowOpen = false;
	var windowAnimation = true;
	var confirmAnimation = false;
	var confirmOpen = false;
	var drawCursor = false;
	var cursorX = 0;
	var cursorY = 0;
	var timer = 0;
	var selectedCardIndex = 0;
	var saveData;
	var cards = [];			// holds 3D cards objects, there are 5 cards
	var playerCards = [];	//
	var AICards = [];		// 
	var toTurnOver = [];
	var maxCards;
	var cardsLeft;
	
	
	
	// If not a Quick Game, load profile
	if (game.currentProfile == 1)
	{
		saveData = game.saveData.profile1;
	}
	else if (game.currentProfile == 2)
	{
		saveData = game.saveData.profile2;
	}
	else if (game.currentProfile == 3)
	{
		saveData = game.saveData.profile3;
	}
		
	

	setupGL();	// setup webGL
	
	// Create cards and get data
	for (var n = 0; n < 10; n++)
	{
		if (n <= 4) // AI Cards
		{
			cards[n] = new Card(gl, program, -10 - n * 2.2, 1.7, 0);
			AICards[n] = cards[n];
		}
		else  // player cards
		{
			cards[n] = new Card(gl, program, 10 + (n-5) * 2.2, -1.7, 0);
			cards[n].setOwner(true);
			playerCards[n-5] = cards[n];
		}
		cards[n].setData(game.startingCards[n]);
	}
	
	
	// Get result
	if (game.tradeRule == 3) // Direct
	{
		message = "Direct trade...";
	}
	else
	{
		if (game.tradeRule == 1) // One
		{
			maxCards = 1;	
		}
		else if (game.tradeRule == 2) // Diff
		{
			maxCards = Math.min(5, Math.abs(game.scoreDiff));
		}
		else if (game.tradeRule == 4) // All
		{
			maxCards = 5;
		}
		cardsLeft = maxCards;
		
		if (game.scoreDiff > 0)  // win
		{
			message = maxCards < 5 ? "Please select " + maxCards + (maxCards == 1 ? " card." : " cards.") : "You won 5 cards!";
		}
		else // lost
		{
			message = maxCards < 5 ? "You lost " + maxCards + (maxCards == 1 ? " card." : " cards.") : "You lost 5 cards!";
		}
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
	
	function playSound(sound)
	{
		if (!sound.paused && sound.currentTime > 0)
		{
			sound.pause();
			sound.currentTime = 0;
		}
		sound.play();
	}

	
	this.windowOpen = function(index) // Called by the GameWindow objects when fully open
	{
		if (index == 1) // Title Window
		{
			windowAnimation = false;
			windowOpen = true;
		}
		else if (index == 2) // Confirm Window
		{
			btnYes = new CommandButton("Yes, get cards", 200 + 100, 125 + 80);
			btnNo = new CommandButton("No, select again", 200 + 100, 125 + 120);
			
			game.canvas.addEventListener("click", onClick, false);
			game.canvas.addEventListener("mousemove", onMouseMove, false);
			confirmAnimation = false;
			confirmOpen = true;
		}
	}
	
	this.windowClosed = function(index) // Called by the GameWindow objects when fully closed
	{
		confirmWindow = null;
		btnYes = null;
		btnNo = null;
		confirmAnimation = false;
	}
	
	function format(num)
	{
		if (num < 10) return "0" + num;
		else return num.toString();
	}
	
	function saveGame()
	{
		var found;
		for (var n = 0; n < toTurnOver.length; n++)
		{
			if (toTurnOver[n].getOwner())  // gained
			{
				found = false;
				for (var m = 0; m < saveData.cards.length; m++)
				{
					if (saveData.cards[m] == toTurnOver[n].getIndex())
					{
						found = true;
						saveData.quant[m]++;
						break;
					}
				}
				if (!found)
				{
					saveData.cards.push(toTurnOver[n].getIndex());
					saveData.quant.push(1);
				}
				saveData.count++;
			}
			else // lost
			{
				for (var m = 0; m < saveData.cards.length; m++)
				{
					if (saveData.cards[m] == toTurnOver[n].getIndex())
					{
						saveData.quant[m]--;
						break;
					}
				}
				saveData.count--;
			}
		}
		
		var datetime = new Date();
		var timestr = "";			
		timestr = format(datetime.getDate()) + "/" + format(datetime.getMonth() + 1) + "/" + datetime.getFullYear() + " " + format(datetime.getHours()) + ":" + format(datetime.getMinutes());
		saveData.datetime = timestr;
		window.localStorage.setItem("ttt", JSON.stringify(game.saveData));
	}

	// public methods
	this.update = function()
	{
		if (confirmAnimation)
		{
			confirmWindow.update();
		}
		
		if (state == "cardsShowingUp") // Cards come up until position
		{
			if (windowAnimation)
			{
				titleWindow.update();	
			}
			
			for (var n = 0; n < 5; n++)
			{
				AICards[n].x += 0.5;
				playerCards[n].x -= 0.5;
			}
			if (AICards[0].x >= 4.4) // all in position
			{
				for (var n = 0; n < 5; n++)
				{
					AICards[n].x = (n - 2) * 2.2;
					playerCards[n].x = (n - 2) * 2.2;
				}
				
				if (game.tradeRule == 3)  // Direct
				{
					for (var n = 0; n < game.changes.length; n++)
					{
						toTurnOver.push(cards[game.changes[n]]);
					}
					playSound(game.sndCardTurn);
					timer = 0;
					state = "cardsAutoTurning";
				}				
				else if (game.scoreDiff > 0)  // win
				{
					if (maxCards == 5)
					{
						toTurnOver = AICards;
						timer = 0;		
						state = "cardsAutoTurning";
					}
					else
					{
						game.canvas.addEventListener("click", onClick, false);
						game.canvas.addEventListener("mousemove", onMouseMove, false);
						state = "";
					}
				}
				else // lost
				{
					// choose player cards
					if (maxCards == 5)
					{
						toTurnOver = playerCards;
					}
					else
					{
						while (cardsLeft > 0)
						{
							card = Math.floor(Math.random() * 5); // sorteia um índice
							if (toTurnOver.indexOf(playerCards[card]) < 0) // add to list
							{
								toTurnOver.push(playerCards[card]);
								cardsLeft--;
							}
						}
						toTurnOver.sort();
					}
					playSound(game.sndCardTurn);
					timer = 0;		
					state = "cardsAutoTurning";
				}
			}
		}
		else if (state == "cardsAutoTurning") // Direct Trade or lose
		{
			timer++;
			toTurnOver[selectedCardIndex].addRot(Math.PI / 15);
			if (timer == 15)
			{
				toTurnOver[selectedCardIndex].setOwner(!toTurnOver[selectedCardIndex].getOwner());
			}
			if (timer >= 30)
			{
				selectedCardIndex++;
				timer = 0;
				if (selectedCardIndex >= toTurnOver.length)
				{
					selectedCardIndex = 0;
					playSound(game.sndCardMove);
					state = "cardsFlying";
				}
				else playSound(game.sndCardTurn);
			}
		}
		else if (state == "cardsFlying") // Direct Trade or lose
		{
			var signal = toTurnOver[selectedCardIndex].getOwner() ? 1 : -1;
			
			timer++;
			if (timer <= 20)
			{
				toTurnOver[selectedCardIndex].y += 0.5 * signal;
				if (timer == 20)
				{
					toTurnOver[selectedCardIndex].x = 0;
					toTurnOver[selectedCardIndex].y = 7 * signal;
					toTurnOver[selectedCardIndex].z = 3;
				}
			}
			else if (timer <= 40)
			{
				toTurnOver[selectedCardIndex].y += -0.39 * signal;
				if (timer == 40)
				{
					toTurnOver[selectedCardIndex].x = 0;
					toTurnOver[selectedCardIndex].y = 0;
				}
				message = "Card " + game.cardData[toTurnOver[selectedCardIndex].getIndex()].name;
				message += toTurnOver[selectedCardIndex].getOwner() ? " gained!" : " lost!";
			}
			else if (timer > 120)
			{
				toTurnOver[selectedCardIndex].y += -0.5 * signal;
				if (timer == 140)
				{
					timer = 0;
					selectedCardIndex++;
					if (selectedCardIndex >= toTurnOver.length)
					{
						// save and exit
						saveGame();
						state = "";
						musicStop = true;
						if (game.musicOn)
						{
							game.sndWinTrack.pause();
							game.sndGameTrack.pause();
						}
						changeScreen("status");
					}
					else playSound(game.sndCardMove);
				}
			}
		}
		else if (state == "cardTurn")
		{
			timer++;
			AICards[selectedCardIndex].addRot(Math.PI / 15);
			if (timer == 15)
			{
				AICards[selectedCardIndex].setOwner(!AICards[selectedCardIndex].getOwner());
			}
			if (timer >= 30)
			{
				if (AICards[selectedCardIndex].getOwner()) cardsLeft--;
				else cardsLeft++;						
				
				if (cardsLeft == 0) // confirmation
				{
					confirmWindow = new GameWindow(thisScreen, "CONFIRMATION", 200, 125, 400, 200, 2);
					confirmAnimation = true;
					drawCursor = false;
				}
				else // can select another card
				{
					selectedCardIndex = -1;
					game.canvas.addEventListener("click", onClick, false);
					game.canvas.addEventListener("mousemove", onMouseMove, false);	
				}
				state = "";
			}
		}
		
		
		if (game.musicOn)
		{
			if (game.sndFanfare.ended && game.sndWinTrack.paused && !musicStop)
			{
				game.sndWinTrack.currentTime = 0;
				game.sndWinTrack.play();
			}
		}
	}
	
	this.draw = function(ctx)
	{
		ctx.drawImage(game.imgResult, 0, 0);
		
		// Draw cards on 3D Canvas
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);			
		glMatrix.mat4.perspective(pMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 10000.0);
		for (var n = 0; n < cards.length; n++)
		{
			cards[n].draw(program, pMatrix, cardTextureImg, texCtx);	
		}
		ctx.drawImage(canvas3d, 0, 0);
		
		titleWindow.draw(ctx);
		if (windowOpen)
		{
			ctx.font = "25px Arial Narrow";
			ctx.fillStyle = textColor;
			ctx.textAlign = "center";
			ctx.fillText(message, 400, 10 + 35);
		}
		
		if (confirmAnimation || confirmOpen)
		{
			ctx.textAlign = "left";
			confirmWindow.draw(ctx);
			if (confirmOpen)
			{
				ctx.font = "25px Arial Narrow";
				ctx.fillStyle = "#FFFFFF";
				ctx.fillText("Are you sure?", 200 + 20, 125 + 40);
				btnYes.draw(ctx);
				btnNo.draw(ctx);
			}
			if (drawCursor)
			{
				ctx.drawImage(game.imgCursor, cursorX, cursorY);
			}
		}
	}
	
	function checkMouseOnCard(cardX, mouseX, mouseY)
	{
		if (mouseX >= cardX && mouseX <= cardX + 90 && mouseY >= 84 && mouseY <= 210)
		{
			var index = Math.floor((cardX - 155) / 100);			
			message = game.cardData[AICards[index].getIndex()].name;
			selectedCardIndex = index;
			
			if (saveData.cards.indexOf(AICards[index].getIndex()) < 0) // player doesn't have the card
			{
				textColor = "#1BA1FF";
			}
			else if (saveData.quant[saveData.cards.indexOf(AICards[index].getIndex())] == 0) // player had lost the card
			{
				textColor = "#FFFF00";
			}
			else
			{
				textColor = "#FFFFFF";
			}
			
			return true;
		}
		else
		{
			textColor = "#FFFFFF";
			message = "Please select " + cardsLeft + (cardsLeft == 1 ? " card." : " cards.");
			selectedCardIndex = -1;
			return false;
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
		}
		else if (button.isMouseOut(X, Y))
		{
			drawCursor = false;
		}
	}
	
	function onMouseMove(e)
	{
		if (confirmOpen) // Modal window
		{
			checkMouseOnButton(btnYes, e.offsetX, e.offsetY);
			checkMouseOnButton(btnNo, e.offsetX, e.offsetY);
		}
		else
		{
			for (var n = 0; n < 5; n++)
			{
				if (checkMouseOnCard(n * 100 + 155, e.offsetX, e.offsetY)) return;
			}
		}
	}
	
	function onClick(e)
	{
		if (confirmOpen) // Modal window
		{
			if (btnYes.onClick(e.offsetX, e.offsetY)) // Start game
			{
				playSound(game.sndClick);
				game.canvas.removeEventListener("click", onClick, false);
				game.canvas.removeEventListener("mousemove", onMouseMove, false);
				confirmWindow.close();
				confirmAnimation = true;
				confirmOpen = false;
				drawCursor = false;
				for (var n = 0; n < AICards.length; n++)
				{
					if (AICards[n].getOwner())
					{
						toTurnOver.push(AICards[n]);
					}
				}
				textColor = "#FFFFFF";
				timer = 0;
				selectedCardIndex = 0;
				state = "cardsFlying";
			}
			else if (btnNo.onClick(e.offsetX, e.offsetY)) // Reselect cards
			{
				playSound(game.sndCoinBegin);
				confirmOpen = false;
				drawCursor = false;
				selectedCardIndex = -1;
				cardsLeft = maxCards;
				textColor = "#FFFFFF";
				for (var n = 0; n < AICards.length; n++)
				{
					AICards[n].setOwner(false);
				}
			}
		}
		else if (selectedCardIndex != -1) // click on cards
		{
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			timer = 0;
			playSound(game.sndCardTurn);
			state = "cardTurn";	
		}		
	}
}





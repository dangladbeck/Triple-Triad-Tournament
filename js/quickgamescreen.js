function QuickGameScreen()
{
	// variables
	var titleWindow = new GameWindow(this, "", 10, 10, 785, 50, 1);
	var rulesWindow = new GameWindow(this, "GAME RULES", 200, 68, 400, 260, 2);
	var commandWindow = new GameWindow(this, "", 150, 335, 500, 50, 3);
	var helpWindow = new GameWindow(this, "HELP", 10, 390, 786, 50, 4);
	
	var btnOpen = new CommandButton("Open", 200 + 70, 68 + 55);
	var btnSuddenDeath = new CommandButton("Sudden Death", 200 + 70, 68 + 115);
	var btnSame = new CommandButton("Same", 200 + 70, 68 + 145);
	var btnPlus = new CommandButton("Plus", 200 + 70, 68 + 175);
	var btnSameWall = new CommandButton("Same Wall", 200 + 70, 68 + 205);
	var btnElemental = new CommandButton("Elemental", 200 + 70, 68 + 235);
	
	var btnStart = new CommandButton("Start", 150 + 130, 335 + 35);
	var btnCancel = new CommandButton("Cancel", 150 + 300, 335 + 35);
	
	btnOpen.enabled = game.rules[0];
	btnSuddenDeath.enabled = game.rules[2];
	btnSame.enabled = game.rules[3];
	btnPlus.enabled = game.rules[4];
	btnSameWall.enabled = game.rules[5];
	btnElemental.enabled = game.rules[6];
	
	var drawing = true;
	var windowOpen = false;
	var windowAnimation = true;
	var drawCursor = false;
	var cursorX = 0;
	var cursorY = 0;


	function playSound(sound)
	{
		if (!sound.paused && sound.currentTime > 0)
		{
			sound.pause();
			sound.currentTime = 0;
		}
		sound.play();
	}

	// public methods
	this.update = function()
	{
		if (windowAnimation)
		{
			titleWindow.update();
			rulesWindow.update();
			commandWindow.update();
			helpWindow.update();
			drawing = true;
		}
	}
	
	this.windowOpen = function(index)
	{
		if (index == 4)
		{
			game.canvas.addEventListener("click", onClick, false);
			game.canvas.addEventListener("mousemove", onMouseMove, false);
			windowAnimation = false;
			windowOpen = true;
			drawing = false;
		}
	}
	
	this.draw = function(ctx)
	{
		if (!drawing) return;
		
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
		titleWindow.draw(ctx);
		rulesWindow.draw(ctx);
		commandWindow.draw(ctx);
		helpWindow.draw(ctx);
		if (windowOpen)
		{
			ctx.font = "25px Arial Narrow";
			ctx.fillStyle = "#FFFFFF";
			ctx.fillText("Quick Game", 10 + 20, 10 + 35);
			ctx.fillText("Random", 200 + 70, 68 + 85);
			ctx.fillText("Choose game rules by clicking rule name and then click Start.", 10 + 20, 390 + 35);
			
			btnOpen.draw(ctx);
			btnSuddenDeath.draw(ctx);
			btnSame.draw(ctx);
			btnPlus.draw(ctx);
			btnSameWall.draw(ctx);
			btnElemental.draw(ctx);
			
			btnStart.draw(ctx);
			btnCancel.draw(ctx);
		}
		if (drawCursor)
		{
			ctx.drawImage(game.imgCursor, cursorX, cursorY);
		}
		
		drawing = false;
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
		
		checkMouseOnButton(btnOpen, e.offsetX, e.offsetY);
		checkMouseOnButton(btnSuddenDeath, e.offsetX, e.offsetY);
		checkMouseOnButton(btnSame, e.offsetX, e.offsetY);
		checkMouseOnButton(btnPlus, e.offsetX, e.offsetY);
		checkMouseOnButton(btnSameWall, e.offsetX, e.offsetY);
		checkMouseOnButton(btnElemental, e.offsetX, e.offsetY);
		checkMouseOnButton(btnStart, e.offsetX, e.offsetY);
		checkMouseOnButton(btnCancel, e.offsetX, e.offsetY);
	}
	
	function toggleEnabled(button, X, Y)
	{
		if (button.onClick(X, Y))
		{
			playSound(game.sndCursor);
			button.enabled = !button.enabled;
			drawing = true;
		}
	}
	
	function onClick(e)
	{
		toggleEnabled(btnOpen, e.offsetX, e.offsetY);
		toggleEnabled(btnSuddenDeath, e.offsetX, e.offsetY);
		toggleEnabled(btnSame, e.offsetX, e.offsetY);
		toggleEnabled(btnPlus, e.offsetX, e.offsetY);
		toggleEnabled(btnSameWall, e.offsetX, e.offsetY);
		toggleEnabled(btnElemental, e.offsetX, e.offsetY);
		
		if (btnStart.onClick(e.offsetX, e.offsetY))
		{
			playSound(game.sndClick);
			game.rules[0] = btnOpen.enabled;
			game.rules[1] = true;
			game.rules[2] = btnSuddenDeath.enabled;
			game.rules[3] = btnSame.enabled;
			game.rules[4] = btnPlus.enabled;
			game.rules[5] = btnSameWall.enabled;
			game.rules[6] = btnElemental.enabled;
			game.tradeRule = -1;  // Quick game
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			if (game.musicOn) game.sndMenuTrack.pause();
			changeScreen("game");
		}
		else if (btnCancel.onClick(e.offsetX, e.offsetY))
		{
			playSound(game.sndCoinBegin);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			changeScreen("title");
		}
	}
}
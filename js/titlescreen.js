function TitleScreen()
{
	// variables
	var menuWindow = new GameWindow(this, "MAIN MENU", 30, 250, 220, 180, 1);
	var btnGame = new CommandButton("Quick Game", 30 + 50, 250 + 50);
	var btnProfile = new CommandButton("Profiles", 30 + 50, 250 + 85);
	var btnTutorial = new CommandButton("Tutorial", 30 + 50, 250 + 120);
	var btnMusic = new CommandButton("Music:", 30 + 50, 250 + 155);
	
	var windowOpen = false;
	var windowAnimation = true;
	var drawCursor = false;
	var cursorX = 0;
	var cursorY = 0;
	
	if (game.musicOn)
	{
		if (game.sndMenuTrack.paused)
		{
			game.sndMenuTrack.currentTime = 0;
			game.sndMenuTrack.play();
		}
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

	// public methods
	this.update = function()
	{
		if (windowAnimation)
		{
			menuWindow.update();
		}
	}
	
	this.windowOpen = function(index)
	{
		game.canvas.addEventListener("click", onClick, false);
		game.canvas.addEventListener("mousemove", onMouseMove, false);
		windowAnimation = false;
		windowOpen = true;
	}
	
	this.draw = function(ctx)
	{
		ctx.textAlign = "left";
		ctx.drawImage(game.imgTitle, 0, 0);
		menuWindow.draw(ctx);
		if (windowOpen)
		{
			btnGame.draw(ctx);
			btnProfile.draw(ctx);
			btnTutorial.draw(ctx);
			btnMusic.draw(ctx);
			if (game.musicOn) ctx.fillText("On", 145, 405);
			else ctx.fillText("Off", 145, 405);
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
		}
		else if (button.isMouseOut(X, Y))
		{
			drawCursor = false;
		}
	}
	
	function onMouseMove(e)
	{
		if (!windowOpen) return;
		
		checkMouseOnButton(btnGame, e.offsetX, e.offsetY);
		checkMouseOnButton(btnProfile, e.offsetX, e.offsetY);
		checkMouseOnButton(btnTutorial, e.offsetX, e.offsetY);
		checkMouseOnButton(btnMusic, e.offsetX, e.offsetY);
	}
	
	function onClick(e)
	{
		if (btnGame.onClick(e.offsetX, e.offsetY))
		{
			playSound(game.sndClick);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			changeScreen("quickgame");
		}
		else if (btnProfile.onClick(e.offsetX, e.offsetY))
		{
			playSound(game.sndClick);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			changeScreen("profile");
		}
		else if (btnTutorial.onClick(e.offsetX, e.offsetY))
		{
			playSound(game.sndClick);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			changeScreen("tutorial");
		}
		else if (btnMusic.onClick(e.offsetX, e.offsetY))
		{
			playSound(game.sndClick);
			game.musicOn = !game.musicOn;
			
			if (game.musicOn)
			{
				if (game.sndMenuTrack.paused)
				{
					game.sndMenuTrack.currentTime = 0;
					game.sndMenuTrack.play();
				}
			}
			else
			{
				game.sndMenuTrack.pause();
			}
		}
	}
}
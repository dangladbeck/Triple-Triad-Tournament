function ProfileScreen()
{
	// variables
	var titleWindow = new GameWindow(this, "", 10, 10, 785, 50, 1);
	var profile1 = new GameWindow(this, "PROFILE #1", 10, 68, 785, 82, 2);
	var profile2 = new GameWindow(this, "PROFILE #2", 10, 157, 785, 82, 3);
	var profile3 = new GameWindow(this, "PROFILE #3", 10, 246, 785, 82, 4);
	var commandWindow = new GameWindow(this, "", 150, 335, 500, 50, 5);
	var helpWindow = new GameWindow(this, "HELP", 10, 390, 786, 50, 6);
	
	var btnBack = new CommandButton("Back", 150 + 225, 335 + 35);
	var btnProfile1;
	var btnProfile2;
	var btnProfile3;

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
			profile1.update();
			profile2.update();
			profile3.update();
			commandWindow.update();
			helpWindow.update();
			drawing = true;
		}
	}
	
	this.windowOpen = function(index)
	{
		if (index == 2) // Profile 1
		{
			if (game.saveData.profile1 != null)
			{
				btnProfile1 = new CommandButton(game.saveData.profile1.profileName, 10 + 50, 68 + 50);
			}
			else btnProfile1 = new CommandButton("Create new profile", 10 + 305, 68 + 50);
		}
		else if (index == 3) // Profile 2
		{
			if (game.saveData.profile2 != null)
			{
				btnProfile2 = new CommandButton(game.saveData.profile2.profileName, 10 + 50, 157 + 50);
			}
			else btnProfile2 = new CommandButton("Create new profile", 10 + 305, 157 + 50);
		}
		else if (index == 4) // Profile 3
		{
			if (game.saveData.profile3 != null)
			{
				btnProfile3 = new CommandButton(game.saveData.profile3.profileName, 10 + 50, 246 + 50);
			}
			else btnProfile3 = new CommandButton("Create new profile", 10 + 305, 246 + 50);
		}
		else if (index == 6) // Help Window
		{
			game.canvas.addEventListener("click", onClick, false);
			game.canvas.addEventListener("mousemove", onMouseMove, false);
			windowAnimation = false;
			windowOpen = true;
			drawing = true;
		}
	}
	
	this.draw = function(ctx)
	{
		if (!drawing) return;
		
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
		
		titleWindow.draw(ctx);
		profile1.draw(ctx);
		profile2.draw(ctx);
		profile3.draw(ctx);
		commandWindow.draw(ctx);
		helpWindow.draw(ctx);
		
		if (windowOpen)
		{
			ctx.font = "25px Arial Narrow";
			ctx.fillStyle = "#FFFFFF";
			ctx.fillText("Profiles", 10 + 20, 10 + 35);
			ctx.fillText("Create new profile, or select profile to load by clicking on profile name.", 10 + 20, 390 + 35);
			
			btnProfile1.draw(ctx);
			if (game.saveData.profile1 != null)
			{
				ctx.fillText("Cards: " + game.saveData.profile1.count, 10 + 400, 68 + 50);
				ctx.fillText(game.saveData.profile1.datetime, 10 + 600, 68 + 50);
			}
			
			btnProfile2.draw(ctx);
			if (game.saveData.profile2 != null)
			{
				ctx.fillText("Cards: " + game.saveData.profile2.count, 10 + 400, 157 + 50);
				ctx.fillText(game.saveData.profile2.datetime, 10 + 600, 157 + 50);
			}
			
			btnProfile3.draw(ctx);
			if (game.saveData.profile3 != null)
			{
				ctx.fillText("Cards: " + game.saveData.profile2.count, 10 + 400, 246 + 50);
				ctx.fillText(game.saveData.profile2.datetime, 10 + 600, 246 + 50);
			}
			
			btnBack.draw(ctx);
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
		
		checkMouseOnButton(btnProfile1, e.offsetX, e.offsetY);
		checkMouseOnButton(btnProfile2, e.offsetX, e.offsetY);
		checkMouseOnButton(btnProfile3, e.offsetX, e.offsetY);
		checkMouseOnButton(btnBack, e.offsetX, e.offsetY);
	}
	
	function onClick(e)
	{
		if (btnProfile1.onClick(e.offsetX, e.offsetY))
		{
			game.currentProfile = 1;
			playSound(game.sndClick);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			if (game.saveData.profile1 != null) // Load Profile
			{
				changeScreen("status");
			}
			else  // Create Profile
			{
				changeScreen("newprofile");
			}
		}
		else if (btnProfile2.onClick(e.offsetX, e.offsetY))
		{
			game.currentProfile = 2;
			playSound(game.sndClick);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			if (game.saveData.profile2 != null) // Load Profile
			{
				changeScreen("status");
			}
			else  // Create Profile
			{
				changeScreen("newprofile");
			}
		}
		else if (btnProfile3.onClick(e.offsetX, e.offsetY))
		{
			game.currentProfile = 3;
			playSound(game.sndClick);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			if (game.saveData.profile3 != null) // Load Profile
			{
				changeScreen("status");
			}
			else  // Create Profile
			{
				changeScreen("newprofile");
			}
		}
		else if (btnBack.onClick(e.offsetX, e.offsetY))
		{
			playSound(game.sndCoinBegin);
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			changeScreen("title");
		}
	}
}
function StatusScreen()
{
	var titleWindow = new GameWindow(this, "", 10, 10, 785, 50, 1);
	var cardWindow = new GameWindow(this, "CARDS PAGE XX                 STOCK", 10, 65, 270, 320, 2);
	var commandWindow = new GameWindow(this, "", 593, 65, 200, 250, 3);
	var helpWindow = new GameWindow(this, "HELP", 10, 390, 786, 50, 4);
	var deleteWindow;
	var self = this; // usado para que deleteWindow possa localizá-lo
	
	var btnPlay = new CommandButton("Next Match", 593 + 50, 65 + 50);
	var btnDelete = new CommandButton("Delete Profile", 593 + 50, 65 + 85);
	var btnLogout = new CommandButton("Log out", 593 + 50, 65 + 120);
	var btnCardList = [];
	var indexList = [];
	var btnYes = new CommandButton("Yes", 100 + 100, 100 + 120);
	var btnNo = new CommandButton("No", 100 + 100, 100 + 160);
	
	var drawing = true;
	var windowOpen = false;
	var windowAnimation = true;
	var deleteAnimation = false;
	var deleteMessage = false;
	var drawCursor = false;
	var cursorX = 0;
	var cursorY = 0;
	var timer = 0;
	var page = 1;
	var cardSrcX = 110;
	
	var saveData;
	
			
		
	// load profile data
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
	
	if (saveData.count < 5) btnPlay.enabled = false;
	
	
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
	
	function format(num)
	{
		if (num < 10) return "0" + num;
		else return num.toString();
	}
	
	function extractLabels()
	{
		btnCardList = [];
		indexList = [];
		for (var n = 0; n < saveData.cards.length; n++)
		{
			if (saveData.cards[n] >= (page - 1) * 11 && saveData.cards[n] <= (page - 1) * 11 + 10)
			{
				var button = new CommandButton(game.cardData[saveData.cards[n]].name, 10 + 30, 65 + (saveData.cards[n] % 11) * 26 + 40);
				if (saveData.quant[n] == 0) button.enabled = false;
				btnCardList.push(button);				
				indexList.push(saveData.cards[n]);
			}
		}
	}
	
	this.update = function()
	{
		if (windowAnimation)
		{
			titleWindow.update();
			cardWindow.update();
			commandWindow.update();
			helpWindow.update();
			drawing = true;
		}
		if (deleteAnimation)
		{
			deleteWindow.update();
			drawing = true;
		}
	}
	
	this.windowOpen = function(index)
	{
		if (index == 4) // Help Window
		{
			game.canvas.addEventListener("click", onClick, false);
			game.canvas.addEventListener("mousemove", onMouseMove, false);
			windowAnimation = false;
			windowOpen = true;
			drawing = true;
			
			extractLabels();
		}
		else if (index == 5) // Delete Window
		{
			deleteAnimation = false;
			deleteMessage = true;
		}
	}
	
	this.draw = function(ctx)
	{
		if (!drawing) return;
		
		ctx.fillStyle = "#000000";
		ctx.textAlign = "left";
		ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
		
		titleWindow.draw(ctx);
		cardWindow.setCaption("CARDS PAGE " + format(page) + "                 STOCK");
		cardWindow.draw(ctx);
		commandWindow.draw(ctx);
		helpWindow.draw(ctx);
		
		if (windowOpen)
		{
			ctx.font = "25px Arial Narrow";
			ctx.fillStyle = "#FFFFFF";
			ctx.fillText(saveData.profileName + "'s Status", 10 + 20, 10 + 35);
			ctx.fillText("Wins: " + saveData.wins, 290, 110);
			ctx.fillText("Losses: " + saveData.losses, 290, 143);
			ctx.fillText("Draws: " + saveData.draws, 290, 176);
			ctx.fillText("Cards: " + saveData.count, 290, 209);
			ctx.fillText("Here you can manage this account.", 10 + 20, 390 + 35);
			
			// arrow buttons
			ctx.beginPath();
			ctx.moveTo(260, 218);
			ctx.lineTo(260, 218 + 14);
			ctx.lineTo(260 + 10, 218 + 7);
			ctx.lineTo(260, 218);
			ctx.fill();
			
			ctx.beginPath();
			ctx.moveTo(30, 218);
			ctx.lineTo(30, 218 + 14);
			ctx.lineTo(30 - 10, 218 + 7);
			ctx.lineTo(30, 218);
			ctx.fill();
			
			// card list
			for (var n = 0; n < btnCardList.length; n++)
			{
				btnCardList[n].draw(ctx);
				ctx.fillText("x " + saveData.quant[saveData.cards.indexOf(indexList[n])], 220, btnCardList[n].getY());
			}
			
			if (cardSrcX < 110)
			{
				var grad = ctx.createLinearGradient(290, 250, 290, 250 + 125);
				grad.addColorStop(0, "#E7E7E7");
				grad.addColorStop(1, "#2142BD"); // blue
				ctx.fillStyle = grad;
				ctx.fillRect(290, 250, 94, 125);
			}
			ctx.drawImage(game.imgCards, 94 * cardSrcX, 0, 94, 125, 290, 250, 94, 125); // card back
			
			btnPlay.draw(ctx);
			btnDelete.draw(ctx);
			btnLogout.draw(ctx);
		}
		if (deleteAnimation || deleteMessage)
		{
			deleteWindow.draw(ctx);
			if (deleteMessage)
			{
				ctx.font = "25px Arial Narrow";
				ctx.fillStyle = "#FFFFFF";
				ctx.fillText("Do you really want to delete this account? All of your progress", 100 + 20, 100 + 40);
				ctx.fillText("will be lost.", 100 + 20, 100 + 70);
				btnYes.draw(ctx);
				btnNo.draw(ctx);
			}
		}
		
		if (drawCursor)
		{
			ctx.drawImage(game.imgCursor, cursorX, cursorY);
		}
		
		drawing = false;
	}
	
	function checkMouseOnButton(button, X, Y)
	{
		if (button.enabled && button.isMouseEnter(X, Y))
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
	
	function checkMouseOnButton2(button, index, X, Y)
	{
		if (button.isMouseEnter(X, Y) && button.enabled)
		{
			cardSrcX = index;
			drawing = true;
		}
		else if (button.isMouseOut(X, Y))
		{
			cardSrcX = 110;
			drawing = true;
		}
	}
		
	function onMouseMove(e)
	{
		if (!windowOpen || deleteAnimation) return;
		
		if (deleteMessage) // Modal window
		{
			checkMouseOnButton(btnYes, e.offsetX, e.offsetY);
			checkMouseOnButton(btnNo, e.offsetX, e.offsetY);
		}
		else
		{
			checkMouseOnButton(btnPlay, e.offsetX, e.offsetY);
			checkMouseOnButton(btnDelete, e.offsetX, e.offsetY);
			checkMouseOnButton(btnLogout, e.offsetX, e.offsetY);
			
			for (var n = 0; n < btnCardList.length; n++)
			{
				checkMouseOnButton2(btnCardList[n], indexList[n], e.offsetX, e.offsetY);
			}
		}
	}
	
	function onClick(e)
	{
		if (!windowOpen || deleteAnimation) return;
		
		if (deleteMessage) // Modal window
		{
			if (btnYes.onClick(e.offsetX, e.offsetY))
			{
				playSound(game.sndClick);
				// delete current profile
				if (game.currentProfile == 1)
				{
					game.saveData.profile1 = null;
				}
				else if (game.currentProfile == 2)
				{
					game.saveData.profile2 = null;
				}
				else if (game.currentProfile == 3)
				{
					game.saveData.profile3 = null;
				}
				window.localStorage.setItem("ttt", JSON.stringify(game.saveData));
				
				changeScreen("profile");
			}
			else if (btnNo.onClick(e.offsetX, e.offsetY))
			{
				playSound(game.sndCoinBegin);
				deleteMessage = false;
				drawCursor = false;
				drawing = true;
			}
		}
		else
		{
			if (btnPlay.enabled && btnPlay.onClick(e.offsetX, e.offsetY))
			{
				playSound(game.sndClick);
				game.canvas.removeEventListener("click", onClick, false);
				game.canvas.removeEventListener("mousemove", onMouseMove, false);
				changeScreen("newgame");
			}
			else if (btnDelete.onClick(e.offsetX, e.offsetY))
			{
				deleteWindow = new GameWindow(self, "WARNING", 100, 100, 600, 200, 5);
				deleteAnimation = true;
				drawCursor = false;
			}
			else if (btnLogout.onClick(e.offsetX, e.offsetY))
			{
				playSound(game.sndCoinBegin);
				game.canvas.removeEventListener("click", onClick, false);
				game.canvas.removeEventListener("mousemove", onMouseMove, false);
				changeScreen("title");
			}
			// Left Arrow
			else if (e.offsetX > 20 && e.offsetX < 20 + 10 && e.offsetY > 218 && e.offsetY < 218 + 14)
			{
				page--;
				if (page <= 0) page = 10;
				extractLabels();
				drawing = true;
			}
			// Right Arrow
			else if (e.offsetX > 260 && e.offsetX < 260 + 10 && e.offsetY > 218 && e.offsetY < 218 + 14)
			{
				page++;
				if (page > 10) page = 1;
				extractLabels();
				drawing = true;
			}
		}
	}
}
function TutorialScreen()
{
	// variables
	var btnBack = new CommandButton("Return", 380, 420);
	var btnNext = new CommandButton("Next Page", 650, 420);
	var btnPrev = new CommandButton("Previous Page", 60, 420);
	
	var currentPage = 1;
	var nextPage;
	var alpha = 0.0;
	var transition = false;
	var fadein = true;
	var drawCursor = false;
	var cursorX = 0;
	
	var frameNo = 0;
	var frameTimer = 0;
	var frames = [0,4,3,5,6,6,0,8,4];
	
	
	game.canvas.addEventListener("click", onClick, false);
	game.canvas.addEventListener("mousemove", onMouseMove, false);

	function playSound(sound)
	{
		if (!sound.paused && sound.currentTime > 0)
		{
			sound.pause();
			sound.currentTime = 0;
		}
		sound.play();
	}
	
	function updateAnim()
	{
		if (frameTimer >= 60)
		{
			frameNo++;
			if (frameNo == frames[currentPage-1]) frameNo = 0;
			frameTimer = -1;
		}
		frameTimer++;
	}

	// public methods
	this.update = function()
	{
		if ((currentPage >= 2 && currentPage <= 6) || (currentPage == 8) || (currentPage == 9))
		{
			updateAnim();
		}
		
		if (transition)
		{
			if (fadein)
			{
				alpha += 0.06;
				if (alpha >= 1)
				{
					alpha = 1;
					fadein = false;
					currentPage = nextPage;
					frameNo = 0;
					frameTimer = 0;
				}
			}
			else
			{
				alpha -= 0.06;
				if (alpha <= 0)
				{
					alpha = 0.0;
					fadein = true;
					transition = false;
					game.canvas.addEventListener("click", onClick, false);
				}
			}
		}
	}
	
	function drawWindow(ctx, x, y, width, height)
	{
		// gradient color background
		var grad = ctx.createPattern(game.imgTuto0, "repeat");
		ctx.fillStyle = grad;
		ctx.fillRect(x, y, width, height);
		
		// top border
		ctx.fillStyle = "#706E71";
		ctx.fillRect(x, y, width, 5);
		ctx.fillStyle = "#848285";
		ctx.fillRect(x, y + 5, width - 5, 2);
		
		// left border
		ctx.fillStyle = "#706E71";
		ctx.fillRect(x, y, 5, height);
		ctx.fillStyle = "#848285";
		ctx.fillRect(x + 5, y + 5, 2, height - 10);
		
		// bottom border
		ctx.fillStyle = "#39373A";
		ctx.fillRect(x, y + height - 5, width, 5);
		
		// right border
		ctx.fillRect(x + width - 5, y + 5, 5, height - 10);
		
		// bottom left corner
		grad = ctx.createLinearGradient(x, y + height - 5, x + 5, y + height);
		grad.addColorStop(0.5, "#706E71");
		grad.addColorStop(0.5, "#39373A");
		ctx.fillStyle = grad;
		ctx.fillRect(x, y + height - 5, 5, 5);
		
		// top right corner
		grad = ctx.createLinearGradient(x + width - 5, y, x + width, y + 5);
		grad.addColorStop(0.5, "#706E71");
		grad.addColorStop(0.5, "#39373A");
		ctx.fillStyle = grad;
		ctx.fillRect(x + width - 5, y, 5, 5);
	}
	
	function drawPage1(ctx)
	{
		ctx.fillText("Introduction", 38, 45);
		ctx.drawImage(game.imgTutorial, 780, 0, 225, 192, 62, 82, 225, 192);
		ctx.fillText("Triple Triad is a card game inside Final", 314, 90);
		ctx.fillText("Fantasy VIII. This is a long side quest", 314, 120);
		ctx.fillText("allowing the player to win very useful items.", 314, 150);
		ctx.fillText("In this version of Triple Triad, players can", 314, 180);
		ctx.fillText("freely choose the rules, and can create his", 314, 210);
		ctx.fillText("own profile to battle for new cards.", 314, 240);
		ctx.fillText("Choose your rules well and have a good", 314, 270);
		ctx.fillText("game!", 314, 300);
	}
	
	function drawPage2(ctx)
	{
		ctx.fillText("The Cards", 38, 45);
		ctx.drawImage(game.imgTutorial, frameNo * 180, 0, 180, 217, 72, 88, 180, 217);
		ctx.fillText("1. Picture", 314, 90);
		ctx.fillText("2. Numbers", 314, 120);
		ctx.fillText("    Correspond to the 4 sides of the card:", 314, 150);
		ctx.fillText("    left, right, up, down. Number 1 is the", 314, 180);
		ctx.fillText("    weakest and A is the strongest.", 314, 210);
		ctx.fillText("3. Element", 314, 240);
		ctx.fillText("    There is a rule that allow the players to", 314, 270);
		ctx.fillText("    use its elemental property.", 314, 300);
	}
	
	function drawPage3(ctx)
	{
		ctx.fillText("Battle Area", 38, 45);
		ctx.drawImage(game.imgTutorial, frameNo * 180, 217, 180, 217, 72, 88, 180, 217);
		ctx.fillText("1. Battle Area", 314, 90);
		ctx.fillText("    Place cards here one at a time. When all", 314, 120);
		ctx.fillText("    of the 9 slots are full, the game ends.", 314, 150);
		ctx.fillText("2. Elemental", 314, 180);
		ctx.fillText("    There is a rule that depicts elements", 314, 210);
		ctx.fillText("    on the board for some effects.", 314, 240);
	}
	
	function drawPage4(ctx)
	{
		ctx.fillText("Basic Rules", 38, 45);
		ctx.drawImage(game.imgTutorial, frameNo * 232, 434, 232, 217, 58, 77, 232, 217);
		ctx.fillText("The cards of your opponent have red", 314, 90);
		ctx.fillText("background color. Your cards have blue", 314, 120);
		ctx.fillText("background color.", 314, 150);
		ctx.fillText("Like the example, when a card is placed", 314, 180);
		ctx.fillText("next another, the values of their adjacent", 314, 210);
		ctx.fillText("sides are compared. If the placed card has", 314, 240);
		ctx.fillText("a greater value, the other card change its", 314, 270);
		ctx.fillText("color, meaning that now it belongs to the", 314, 300);
		ctx.fillText("other player.", 314, 330);
	}
	
	function drawPage5(ctx)
	{
		ctx.fillText("Same Rule", 38, 45);
		ctx.drawImage(game.imgTutorial, frameNo * 252, 651, 252, 273, 43, 73, 252, 273);
		ctx.fillText("Same Rule turns over cards that have same", 314, 90);
		ctx.fillText("values on 2 or more adjacent sides.", 314, 120);
		ctx.fillText("In the example, #s 3 and 1 are adjacent to", 314, 150);
		ctx.fillText("top and left sides.", 314, 180);
		ctx.fillText("This turns over the top and left cards.", 314, 210);
	}
	
	function drawPage6(ctx)
	{
		ctx.fillText("Plus Rule", 38, 45);
		ctx.drawImage(game.imgTutorial, frameNo * 252, 924, 252, 273, 43, 73, 252, 273);
		ctx.fillText("Plus means that cards adding to the same", 314, 90);
		ctx.fillText("number on 2 or more adjacent sides are", 314, 120);
		ctx.fillText("turned over.", 314, 150);
		ctx.fillText("In the example, the cards placed add up to", 314, 180);
		ctx.fillText("6 on the top and left sides.", 314, 210);
		ctx.fillText("The cards on top and left are turned over.", 314, 240);
	}
	
	function drawPage7(ctx)
	{
		ctx.fillText("Same Wall Rule", 38, 45);
		ctx.drawImage(game.imgTutorial, 1036, 0, 230, 277, 47, 66, 230, 277);
		ctx.fillText("Same Wall uses board edges as they were", 314, 90);
		ctx.fillText("connected (following the arrow in the)", 314, 120);
		ctx.fillText("picture) when calculating Same rule.", 314, 150);
	}
	
	function drawPage8(ctx)
	{
		ctx.fillText("Combo Rule", 38, 45);
		ctx.drawImage(game.imgTutorial, frameNo * 252, 1197, 252, 273, 43, 73, 252, 273);
		ctx.fillText("Cards turned over using Same, Plus or", 314, 90);
		ctx.fillText("Same Wall can turn over adjacent cards in", 314, 120);
		ctx.fillText("Combo.", 314, 150);
		ctx.fillText("In the example, the last red card will be", 314, 180);
		ctx.fillText("turned over after Same because 1 of the 2", 314, 210);
		ctx.fillText("cards turned over is a larger number on the", 314, 240);
		ctx.fillText("left side (5 vs. 1).", 314, 270);
		ctx.fillText("Elemental property does not affect the cards", 314, 300);
		ctx.fillText("while turning over by Combo rule.", 314, 330);
	}
	
	function drawPage9(ctx)
	{
		ctx.fillText("Elemental Rule", 38, 45);
		ctx.drawImage(game.imgTutorial, frameNo * 179, 1470, 179, 216, 54, 83, 179, 216);
		ctx.fillText("Elemental changes the values of the card", 314, 90);
		ctx.fillText("depending on the elemental property.", 314, 120);
		ctx.fillText("When a card and a slot match elemental", 314, 150);
		ctx.fillText("properties, the values increase by 1.", 314, 180);
		ctx.fillText("If elements don't match, the card loses 1 from", 314, 210);
		ctx.fillText("its original values.", 314, 240);
		ctx.fillText("If there is no element in the slot, nothing", 314, 270);
		ctx.fillText("happens.", 314, 300);
	}
	
	function drawPage10(ctx)
	{
		ctx.fillText("Other Rules", 38, 45);
		
		ctx.fillText("Open", 38, 90);
		ctx.fillText("    Players can see cards of the opponent.", 38, 120);

		ctx.fillText("Random", 38, 180);
		ctx.fillText("    Cards are chosen from stock at random.", 38, 210);

		ctx.fillText("Sudden Death", 38, 270);
		ctx.fillText("    Play until someone wins. Draws are not allowed.", 38, 300);
	}
	
	function drawPage11(ctx)
	{
		ctx.fillText("Trade Rules", 38, 45);
		ctx.fillText("None", 38, 90);
		ctx.fillText("    Both winner and loser keep their cards.", 38, 120);
		ctx.fillText("One", 38, 150);
		ctx.fillText("    The winner takes 1 card from the loser.", 38, 180);
		ctx.fillText("Difference", 38, 210);
		ctx.fillText("    Winner take the number of cards by the difference in the score.", 38, 240);
		ctx.fillText("Direct", 38, 270);
		ctx.fillText("    Take cards you turned over, but lose cards turned over by opponent.", 38, 300);
		ctx.fillText("All", 38, 330);
		ctx.fillText("    The winner takes all the cards from the loser.", 38, 360);
	}
	
	function drawPage12(ctx)
	{
		ctx.fillText("Creating a Profile", 38, 45);
		ctx.drawImage(game.imgTutorial, 1311, 0, 300, 168, 42, 113, 256, 143);
		ctx.fillText("Triple Triad Tournament supports up to 3", 314, 90);
		ctx.fillText("profiles. If there is an available profile, you", 314, 120);
		ctx.fillText("can create a new profile.", 314, 150);
		ctx.fillText("When creating a new profile, you must enter", 314, 180);
		ctx.fillText("a profile name and choose your 7 first cards.", 314, 210);
		ctx.fillText("If you don't want that set of cards, you can", 314, 240);
		ctx.fillText("randomly reselect cards.", 314, 270);
		ctx.fillText("After you click Save, your profile will be", 314, 300);
		ctx.fillText("created.", 314, 330);
	}
	
	function drawPage13(ctx)
	{
		ctx.fillText("Loading a Profile", 38, 45);
		ctx.drawImage(game.imgTutorial, 1645, 0, 300, 168, 42, 113, 256, 143);
		ctx.fillText("From the profile screen, you can choose", 314, 90);
		ctx.fillText("one profile to load. Then you'll see the", 314, 120);
		ctx.fillText("status of this profile, where you can see the", 314, 150);
		ctx.fillText("cards in stock and profile's statistics.", 314, 180);
		ctx.fillText("From Status screen you can start new", 314, 210);
		ctx.fillText("matches, choosing rules and cards.", 314, 240);
		ctx.fillText("All results will be auto-saved.", 314, 300);
	}
	
	this.draw = function(ctx)
	{
		// black background
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
				
		// drawing content window		
		drawWindow(ctx, 10, 10, 780, 370);
		ctx.fillStyle = "#FFFFFF";		
		ctx.fillText("Card Rules " + currentPage + "/13", 600, 45);
		
		switch (currentPage)
		{
			case 1: drawPage1(ctx); break;
			case 2: drawPage2(ctx); break;
			case 3: drawPage3(ctx); break;
			case 4: drawPage4(ctx); break;
			case 5: drawPage5(ctx); break;
			case 6: drawPage6(ctx); break;
			case 7: drawPage7(ctx); break;
			case 8: drawPage8(ctx); break;
			case 9: drawPage9(ctx); break;
			case 10: drawPage10(ctx); break;
			case 11: drawPage11(ctx); break;
			case 12: drawPage12(ctx); break;
			case 13: drawPage13(ctx); break;
		}
		
		// transition effect
		ctx.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
		ctx.fillRect(10, 10, 780, 370); // appears when transitioning
		
		// Drawing command panel
		drawWindow(ctx, 10, 390, 780, 45);
		btnPrev.draw(ctx);
		btnNext.draw(ctx);
		btnBack.draw(ctx);
		
		if (drawCursor)
		{
			ctx.drawImage(game.imgCursor, cursorX, 404);
		}
		
	}
	
	function onMouseMove(e)
	{
		if (btnPrev.isMouseEnter(e.offsetX, e.offsetY))
		{
			playSound(game.sndCursor);
			drawCursor = true;
			cursorX = btnPrev.getX() - 35;
		}
		else if (btnPrev.isMouseOut(e.offsetX, e.offsetY))
		{
			drawCursor = false;
		}
		else if (btnNext.isMouseEnter(e.offsetX, e.offsetY))
		{
			playSound(game.sndCursor);
			drawCursor = true;
			cursorX = btnNext.getX() - 35;
		}
		else if (btnNext.isMouseOut(e.offsetX, e.offsetY))
		{
			drawCursor = false;
		}
		else if (btnBack.isMouseEnter(e.offsetX, e.offsetY))
		{
			playSound(game.sndCursor);
			drawCursor = true;
			cursorX = btnBack.getX() - 35;
		}
		else if (btnBack.isMouseOut(e.offsetX, e.offsetY))
		{
			drawCursor = false;
		}
	}
	
	function onClick(e)
	{
		if (btnPrev.onClick(e.offsetX, e.offsetY))
		{
			game.canvas.removeEventListener("click", onClick, false);
			playSound(game.sndCardMove);
			transition = true;
			nextPage = currentPage == 1 ? 13 : currentPage - 1;
		}
		else if (btnNext.onClick(e.offsetX, e.offsetY))
		{
			game.canvas.removeEventListener("click", onClick, false);
			playSound(game.sndCardMove);
			transition = true;
			nextPage = currentPage == 13 ? 1 : currentPage + 1;
		}
		else if (btnBack.onClick(e.offsetX, e.offsetY))
		{
			game.canvas.removeEventListener("click", onClick, false);
			game.canvas.removeEventListener("mousemove", onMouseMove, false);
			playSound(game.sndCoinBegin);
			changeScreen("title");
		}
	}
}
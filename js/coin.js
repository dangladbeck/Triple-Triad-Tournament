function Coin(Parent, PlayerTurn)
{
	var state = "roll";
	var x = 400;
	var y = 225;
	var angle = 0;
	var scale = 1;
	var frameNo = 0;
	var frameTimer = 0;
	var animSpeed = 0;
	var timer = 0;
	var parent = Parent;
	var playerTurn = PlayerTurn;
	var visible = true;
	
	
	function updateAnim()
	{
		frameTimer++;
		if (frameTimer >= animSpeed)
		{
			frameNo++;
			if (frameNo >= 8) frameNo = 0;
			frameTimer = 0;
		}
	}
	
	this.setVisible = function(value)
	{
		visible = value;	
	}
	
	this.getVisible = function()
	{
		return visible;	
	}
	
	this.changeSide = function(playerTurn)
	{
		if (playerTurn)
		{
			state = "changeToAI";
		}
		else
		{
			state = "changeToPlayer";
		}
	}
	
	this.update = function()
	{
		if (state == "roll")
		{
			updateAnim();
			timer++;
			animSpeed += 0.05;
			if (timer >= 20)
			{
				state = "turn";
				angle = 0;
				timer = 0;
			}
		}
		else if (state == "turn")
		{
			updateAnim();
			timer++;
			if (timer % 5 == 0)
			{
				scale *= -1;
			}
			angle += Math.PI / 120;
			if (timer >= 60)
			{
				state = "stop";
				timer = 0;
				if (playerTurn) scale = -1;
				else scale = 1;
			}
		}
		else if (state == "stop")
		{
			timer++;
			if (timer >= 30)
			{
				state = "gotoplayer";
				timer = 0;
				animSpeed = 4;
				game.sndCoinBegin.play();
			}
		}
		else if (state == "gotoplayer")
		{
			updateAnim();
			timer++;
			if (playerTurn)
			{
				if (x < 700)
				{
					x += 14;
					if (x > 700) x = 700;
				}
			}
			else
			{
				if (x > 110)
				{
					x -= 14;	
					if (x < 110) x = 110;
				}
			}
			if (y > 40)
			{
				y -= 10;	
			}
			if (timer >= 30) // animation complete
			{
				state = "idle";
				parent.startGame(); 
			}
		}
		else if (state == "idle")
		{
			updateAnim();
		}
		else if (state == "changeToAI")
		{
			updateAnim();
			
			if (x > 110)
			{
				x -= 30;	
				if (x < 110)
				{
					x = 110;
					state = "idle";
					parent.startAITurn();
				}
			}
			
		}
		else if (state == "changeToPlayer")
		{
			updateAnim();
			
			if (x < 700)
			{
				x += 30;
				if (x > 700)
				{
					x = 700;
					state = "idle";
					parent.startPlayerTurn();
				}
			}
		}
	}
	
	this.draw = function(ctx)
	{
		if (!visible) return;
		if (state == "turn" || state == "stop")
		{
			ctx.save();
			ctx.translate(x, y);
			ctx.scale(scale, 1);
			ctx.rotate(angle);			
			ctx.drawImage(game.imgCoin, frameNo * 44, 0, 44, 52, -22, -26, 44, 52);
			ctx.restore();
		}
		else
		{
			ctx.drawImage(game.imgCoin, frameNo * 44, 0, 44, 52, x - 22, y - 26, 44, 52);
		}
		
		
		
		
	}
	
	
}
function GameWindow(Parent, Caption, X, Y, Width, Height, Index)
{
	this.finalX = X;
	this.finalY = Y;
	var finalWidth = Width;
	var finalHeight = Height;
	var x = X + finalWidth / 2 - 20;
	var y = Y + finalHeight / 2 - 20;
	var width = 40;
	var height = 40;
	var caption = Caption;
	var state = 0; // opening
	var parent = Parent;
	var index = Index;
	
	
	this.setCaption = function(value)
	{
		caption = value;
	}
	
	this.close = function()
	{
		state = 2;	
	}
	
	this.update = function()
	{
		if (state == 0) // opening
		{
			// Em 20 frames estará completo
			x -= (finalWidth - 10) / 40;
			width += (finalWidth - 10) / 20;
			
			y -= (finalHeight - 10) / 40;
			height += (finalHeight - 10) / 20;
			
			if (x < this.finalX) x = this.finalX;
			if (y < this.finalY) y = this.finalY;
			if (width > finalWidth) width = finalWidth;
			if (height > finalHeight) height = finalHeight;
				
			if (width >= finalWidth && height >= finalHeight)
			{
				width = finalWidth;
				height = finalHeight;
				x = this.finalX;
				y = this.finalY;
				
				state = 1; // idle, open
				parent.windowOpen(index); // stop drawing			
			}
		}
		else if (state == 1) // open, idle
		{
			
		}
		else if (state == 2) // closing
		{
			// Em 20 frames estará completo
			x += (finalWidth - 10) / 40;
			width -= (finalWidth - 10) / 20;
			
			y += (finalHeight - 10) / 40;
			height -= (finalHeight - 10) / 20;
			
			if (width <= finalWidth / 20 && height <= finalHeight / 20)
			{
				parent.windowClosed(index); // stop drawing			
			}
		}
	}
	
	this.draw = function(ctx)
	{
		// gradient color background
		var grad = ctx.createLinearGradient(x, 0, x + width, 0);
		grad.addColorStop(0, "#414139");
		grad.addColorStop(1, "#636164");
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
		
		if (state == 1) // open, idle
		{  // draw title
			ctx.font = "22px lilyupc";
			ctx.shadowColor = "#000000";
			ctx.shadowBlur = 3;
			for (var n = 1; n <= 10; n++)
			{
				ctx.fillText(caption, x + 10, y + 14);
			}
			ctx.shadowBlur = 0;
			ctx.fillStyle = "#ACAAAD";
			ctx.fillText(caption, x + 10, y + 14);
		}
	}	
}
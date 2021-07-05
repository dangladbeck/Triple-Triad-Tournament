function CommandButton(Caption, X, Y)
{
	var caption = Caption;
	var x = X;
	var y = Y;
	var width;
	var height = 25;
	var mouseover = false;
	this.enabled = true;
	
	this.getX = function()
	{
		return x;	
	}
	
	this.getY = function()
	{
		return y;	
	}
	
	this.onClick = function(X, Y)
	{
		return (X > x && X < x + width && Y > y - height && Y < y);
	}
	
	this.isMouseEnter = function(X, Y)
	{
		if (X > x && X < x + width && Y > y - height && Y < y && !mouseover)
		{
			mouseover = true;
			return true;	
		}
		else return false;
	}
	
	this.isMouseOut = function(X, Y)
	{
		if (!(X > x && X < x + width && Y > y - height && Y < y) && mouseover)
		{
			mouseover = false;
			return true;	
		}
		else return false;
	}
	
	this.draw = function(ctx)
	{
		ctx.font = "25px Arial Narrow";
		if (this.enabled) ctx.fillStyle = "#FFFFFF";
		else ctx.fillStyle = "#636164";
		ctx.fillText(caption, x, y);
		width = ctx.measureText(caption).width;
	}
}
function Card(GL, program, X, Y, Z)
{
	var gl = GL;	// the webGL context	
	var mvMatrix = glMatrix.mat4.create();	// model-view matrix
	
	var positionBuffer;	// position buffer
	var indexBuffer;	// index buffer
	var indices;		// indices of vertices used for drawing
	
	this.x = X;				// X position
	this.y = Y;				// Y position
	this.z = Z				// Z position
	this.addition = 0;		// Elemental bonus
	this.mouseOver = false;	// is the mouse over this card?
	this.shine = false;
	this.col = -1;
	this.row = -1;
	var rotX = 0;			// X rotation
	var rotY = 0;			// Y rotation
	var cardIndex = 0;		// index for card data
	var player = false;		// true if card belongs to player
	var gradY = -125;
	
	initBuffers(program);	// setup webGL
	
	this.addRot = function(value)
	{
		rotY += value;	
	}
	
	this.getRot = function()
	{
		return rotY;	
	}	
	
	this.setClosed = function(closed)
	{
		if (closed)
		{
			rotY = Math.PI;
		}
		else
		{
			rotY = 0;
		}
	}
	
	this.setOwner = function(value)
	{
		player = value;
	}
	
	this.getOwner = function()
	{
		return player;
	}
	
	this.setData = function(index)
	{
		cardIndex = index;
	}
	
	this.getIndex = function()
	{
		return cardIndex;	
	}
	
	function initBuffers(program)
	{
		var vertices = 
		[	// X, Y, Z, U, V
			// Front
			1.0, 1.4, 0.01,    0.5, 0.0,
			1.0, -1.4, 0.01,    0.5, 1.0,
			-1.0, -1.4, 0.01,    0.0, 1.0,
			-1.0, 1.4, 0.01,    0.0, 0.0,
	
			// Back
			1.0, 1.4, -0.01,    0.5, 0.0,
			1.0, -1.4, -0.01,    0.5, 1.0,
			-1.0, -1.4, -0.01,    1.0, 1.0,
			-1.0, 1.4, -0.01,    1.0, 0.0,
		];
	
		positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		
		indices = 
		[
			1, 0, 2,
			3, 2, 0,
			
			4, 5, 6,
			4, 6, 7
		];
		indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		
		program.positionAttribute = gl.getAttribLocation(program, 'aPosition');
		program.texCoordAttribute = gl.getAttribLocation(program, 'aTexCoord');
		gl.vertexAttribPointer(program.positionAttribute, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.vertexAttribPointer(program.texCoordAttribute, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
		gl.enableVertexAttribArray(program.positionAttribute);
		gl.enableVertexAttribArray(program.texCoordAttribute);
	}
	
	this.turnOver = function(timer)
	{
		if (timer <= 20)
		{
			this.z += 0.15;  // Sobe
		}
		else
		{
			this.z -= 0.15;  // Desce
		}
		
		if (timer == 20)
		{
			player = !player;
		}
		if (timer >= 40)
		{
			this.z = 0;
			rotX = 0;
			rotY = 0;
		}
	}
	
	this.turnUp = function(timer)
	{
		rotX += Math.PI / 20;
		this.turnOver(timer);		
	}
	
	this.turnDown = function(timer)
	{
		rotX -= Math.PI / 20;
		this.turnOver(timer);		
	}
	
	this.turnLeft = function(timer)
	{
		rotY -= Math.PI / 20;
		this.turnOver(timer);
	}
	
	this.turnRight = function(timer)
	{
		rotY += Math.PI / 20;
		this.turnOver(timer);
	}
	
	this.draw = function(program, pMatrix, canvas, ctx)
	{
		// Asslemble card texture
		// Assemble background gradient, blue or red
		var grad = ctx.createLinearGradient(0, 0, 0, 125);
		grad.addColorStop(0, "#E7E7E7");
		if (player)
		{
			grad.addColorStop(1, "#2142BD"); // blue
		}
		else
		{
			grad.addColorStop(1, "#BD4221"); // red
		}
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, canvas.width / 2, canvas.height);
		ctx.drawImage(game.imgCards, 94 * cardIndex, 0, 94, 125, 0, 0, 94, 125); // card front
		ctx.drawImage(game.imgCards, 94 * 110, 0, 94, 125, 94, 0, 94, 125); // card back
		if (this.addition == -1) ctx.drawImage(game.imgMessages, 364, 175, 64, 46, 15, 40, 64, 46); // -1
		else if (this.addition == 1) ctx.drawImage(game.imgMessages, 364, 221, 64, 46, 15, 40, 64, 46); // +1
		if (this.shine)
		{
			grad = ctx.createLinearGradient(gradY, gradY, gradY + 94 * 2, gradY + 125 * 2);
			grad.addColorStop(0, "rgba(8, 13, 19, 0.0)");
			grad.addColorStop(0.25, "rgba(204, 204, 204, 0.7");
			grad.addColorStop(0.25, "rgba(8, 13, 19, 0.0)");
			grad.addColorStop(0.5, "rgba(204, 204, 204, 0.7");
			grad.addColorStop(0.5, "rgba(8, 13, 19, 0.0)");
			grad.addColorStop(0.75, "rgba(204, 204, 204, 0.7");
			grad.addColorStop(0.75, "rgba(8, 13, 19, 0.0)");
			grad.addColorStop(1, "rgba(204, 204, 204, 0.7");
			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, canvas.width / 2, canvas.height);
			gradY += 2;
			if (gradY >= 0) gradY = -110;
		}
		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas); // assign texture
		
		// Position and rotate card
		glMatrix.mat4.identity(mvMatrix);
		glMatrix.mat4.lookAt(mvMatrix, [0, 0, 12], [0, 0, 0], [0, 1, 0]);
		glMatrix.mat4.translate(mvMatrix, mvMatrix, [this.x, this.y, this.z]);
		glMatrix.mat4.rotate(mvMatrix, mvMatrix, rotX, [1, 0, 0]);
		glMatrix.mat4.rotate(mvMatrix, mvMatrix, rotY, [0, 1, 0]);
		
		
		// update data for webGL
		gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
    	gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	}
}
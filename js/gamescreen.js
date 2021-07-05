function GameScreen()
{
	// webgl variables
	var canvas3d;	// canvas for drawing 3D cards
	var gl;			// context for webGL drawing
	var program;	// the shader program
	var pMatrix;	// projection matrix, remains the same all the time
	
	var cardTextureImg;	// a canvas, the assembled texture for the cards
	var texCtx;			// 2D context for assembling cards texture
	
	
	// variables
	var selectAnimation = false;
	var selectOpen = false;
	var confirmAnimation = false;
	var confirmOpen = false;
	var menuAnimation = false;
	var menuOpen = false;
	var titleWindow;
	var cardsWindow;
	var confirmWindow;
	var menuWindow;
	var btnYes;
	var btnNo;
	var btnQuit;
	var btnMusic;
	var btnCardList = [];
	var indexList = [];
	var page = 1;
	var cardSrcX = 110;
	var cardShowUp = false;
	
	var menuSrcY = 286;
	var drawRect = true;		// if we should draw board cursor
	var rectX = 0;				// board cursor position X
	var rectY = 0;				// board cursor position X
	var drawCursor = true;		// if we should draw card cursor
	var cursorX = 0;			// position X of the cursor, only used in the windows
	var cursorY = 85;			// position Y of the card cursor
	var drawCombo = false;
	var messageX = 800;	
	var timer = 0;				// timer for card cursor animation
	var grad;					// gradient created in the context
	var thisScreen = this; 		// used for windows not to lose reference
	var saveData;
	var quants;
	var rulesTxt = ""; 		// texts used in the menu
	var rulesTxt2 = "";
	var rulesTxt3 = "";
	
	
	// game variables
	var coin = null;
	var gameState;
	var playerTurn = true;
	var playerScore = 5;
	var AIScore = 5;
	var cards = [];			// holds 3D cards objects, there are 5 cards
	var playerCards = [];	//
	var AICards = [];		// 
	var boardCards = [];
	var boardElements = [];
	var AIcardUp = 0;
	var selectedCardIndex = -1;
	var selectedCardName = "";
	var col = 0;			// target column
	var row = 0;			// target row
	var movingCard = null;
	var toTurnOverU;
	var toTurnOverD;	// Lista de cartas do tabuleiro que devem virar neste turno
	var toTurnOverL;
	var toTurnOverR;
	var shineList = [];
	var same = false;
	var plus = false;
	var combo = false;
	
	
	
	
	// make array 2d
	boardCards[0] = [];
	boardCards[1] = [];
	boardCards[2] = [];
	
	
	
	
	// If not a Quick Game, load profile
	if (game.tradeRule != -1)
	{
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
		quants = saveData.quant.concat();  // copia as cartas do profile
	}
	

	setupGL();	// setup webGL
	
	// Create cards
	for (var n = 0; n < 10; n++)
	{
		if (n <= 4) // AI Cards
		{
			cards[n] = new Card(gl, program, -6.5, -7, n * 0.001);
		}
		else  // player cards
		{
			cards[n] = new Card(gl, program, 6.5, -7, n * 0.001);
			cards[n].setOwner(true);
		}
	}
	
	
	if (game.rules[1])  // Random
	{
		selectRandomCards();  // if Random rule is active, cards chosen automatically
		if (!game.rules[0]) // Open
		{
			cards[0].setClosed(true);
			cards[1].setClosed(true);
			cards[2].setClosed(true);
			cards[3].setClosed(true);
			cards[4].setClosed(true);
		}
		gameState = "beginRandom";
	}
	else // Not Random
	{
		selectComputerCards(); // computer cards are still randomly picked up
		// if not Random, cards aways come up closed
		cards[0].setClosed(true);
		cards[1].setClosed(true);
		cards[2].setClosed(true);
		cards[3].setClosed(true);
		cards[4].setClosed(true);
		gameState = "AICardsShowUp";
	}
	
	setMenuText();
	
	if (game.musicOn)
	{
		game.sndGameTrack.currentTime = 0;
		game.sndGameTrack.play();
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

	function setMenuText()
	{
		var rulesNo = 0;
		
		for (var n = 0; n < 7; n++)
		{
			if (game.rules[n]) rulesNo++;
		}
		
		if (game.rules[0])
		{
			rulesTxt += "Open";
			rulesNo--;
			if (rulesNo > 0) rulesTxt += ", ";
		}
		if (game.rules[1])
		{						
			rulesTxt += "Random";
			rulesNo--;
			if (rulesNo > 0) rulesTxt += ", ";
		}
		if (game.rules[2])
		{
			rulesTxt += "Sudden Death";
			rulesNo--;
			if (rulesNo > 0) rulesTxt += ", ";
		}
		if (game.rules[3])
		{
			rulesTxt2 += "Same";
			rulesNo--;
			if (rulesNo > 0) rulesTxt2 += ", ";
		}
		if (game.rules[4])
		{
			rulesTxt2 += "Plus";
			rulesNo--;
			if (rulesNo > 0) rulesTxt2 += ", ";
		}
		if (game.rules[5])
		{
			rulesTxt2 += "Same Wall";
			rulesNo--;
			if (rulesNo > 0) rulesTxt2 += ", ";
		}
		if (game.rules[6])
		{
			rulesTxt2 += "Elemental";
			rulesNo--;
			if (rulesNo > 0) rulesTxt2 += ", ";
		}
		
		if (rulesTxt == "")
		{
			rulesTxt = rulesTxt2;
			rulesTxt2 = "";
		}
		
		switch (game.tradeRule)
		{
			case -1: rulesTxt3 = "None (Quick Game)"; break;	
			case 0: rulesTxt3 = "None"; break;
			case 1: rulesTxt3 = "One"; break;
			case 2: rulesTxt3 = "Difference"; break;
			case 3: rulesTxt3 = "Direct"; break;
			case 4: rulesTxt3 = "All"; break;
		}
	}

	function selectRandomCards()
	{
		var n = 0;
		var i = 0;
		var double = false;
		var card = 0;
		var rarecards = [];
		
		if (game.tradeRule == -1) // Quick Game
		{
			while (n < 10)
			{			
				double = false;
				card = Math.floor(Math.random() * 110);
				/* Cartas raras só podem sair uma vez. */
				if ((card >= 77) || (card == 47))
				{
					for (i = 0; i < rarecards.length; i++)
					{
						if (card == rarecards[i])
						{
							double = true;
						}
					}
					rarecards.push(card);
				}
				if (!double)
				{
					cards[n].setData(card);
					n++;					
				}
			}
		}
		else // Carreira
		{
			selectComputerCards();
			
			// Selecionando as cartas do jogador
			n = 5;
			while (n < 10)
			{			
				card = Math.floor(Math.random() * quants.length); // sorteia um índice
				if (quants[card] > 0)
				{
					cards[n].setData(saveData.cards[card]);
					quants[card]--;
					n++;
				}
			}
		}
	}
	
	function selectComputerCards()
	{
		var rarecards = []; // Lista de cartas raras em jogo
		var card;
		var n;
		var i;
		var double; // Indica se uma carta rara já saiu ou não
		
		// O computador não pode ter as mesmas cartas raras do jogador
		for (i = 0; i < saveData.cards.length; i++)
		{
			if ((saveData.cards[i] >= 77) || (saveData.cards[i] == 47))
			{
				rarecards.push(saveData.cards[i]);
			}
		}
		
		// Selecionando as cartas do computador
		n = 0;
		while (n < 5)
		{			
			double = false;
			card = Math.floor(Math.random() * 110);
			/* Cartas raras só podem sair uma vez. */
			if ((card >= 77) || (card == 47))
			{
				for (i = 0; i < rarecards.length; i++)
				{
					if (card == rarecards[i])
					{
						double = true;
					}
				}
			}
			if (!double)
			{
				rarecards.push(card);
				cards[n].setData(card);
				n++;					
			}
		}
	}
	
	function extractLabels() // Called when Card Window is open, creates buttons with card names on it
	{
		btnCardList = [];
		indexList = [];
		for (var n = 0; n < saveData.cards.length; n++)
		{
			if (saveData.cards[n] >= (page - 1) * 11 && saveData.cards[n] <= (page - 1) * 11 + 10)
			{
				if (quants[n] != 0)
				{
					btnCardList.push(new CommandButton(game.cardData[saveData.cards[n]].name, 10 + 70, 65 + (saveData.cards[n] % 11) * 26 + 40));
					indexList.push(saveData.cards[n]);
				}
			}
		}
	}
	
	function setBoardElements()
	{
		boardElements[0] = [];
		boardElements[1] = [];
		boardElements[2] = [];
		for (var i = 0; i < 3; i++)
		{
			for (var j = 0; j < 3; j++)
			{
				var elem = Math.floor(Math.random() * 11);
				if (elem > 8) elem = 0; // more chance to have no elements
				boardElements[i][j] = elem;
			}
		}	
	}
	
	function moveAI() // AI chooses card to play and location on the board
	{
		var score;				// pontuação da carta atual, da mão do computador
		var bestScore = -100;		// melhor pontuação das cartas da mão
		var bestLocation;		// melhor posição do tabuleiro para aquela carta
		var avgValues;				// média dos valores da carta atual
		var CUp = null;
		var CDown = null;
		var CLeft = null;
		var CRight = null;			// guardam algumas relações entre cartas 
		var freeAdj;			// número de cartas adjacentes àquela posição
		var avgPos;
		var Location = [];
		var Opponent = [];
		var cData = null;
		var cData2 = null;
		var i, j, n, k;
		
		col = 0;
		row = 0;
		
		for (n = 0; n < AICards.length; n++)
		{
			score = 0;
			Location = [];
			for (i = 0; i < 9; i++) Location[i] = 0;
			
			cData = game.cardData[AICards[n].getIndex()];			
			avgValues = (cData.up + cData.down + cData.left + cData.right) / 4;
			
			for (i = 0; i < 3; i++)
				for (j = 0; j < 3; j++)
				{
					CUp = {Bigg: false, Same: false, Plus: 0};
					CDown = {Bigg: false, Same: false, Plus: 0};
					CLeft = {Bigg: false, Same: false, Plus: 0};
					CRight = {Bigg: false, Same: false, Plus: 0};
					
					avgPos = 0;
					freeAdj = 0;
					for (k = 0; k < playerCards.length; k++) Opponent[k] = 0;
					
					if (boardCards[i][j] == null) // se a posição está vazia
					{
						// Observando a carta de cima
						if (i != 0)
						{
							if (boardCards[i - 1][j] != null)  // Se a posição de cima está cheia
							{  
								cData2 = game.cardData[boardCards[i - 1][j].getIndex()];
							// Estabelece algumas relações com a carta de cima
								CUp.Plus = cData.up + cData2.down;
								CUp.Same = cData.up == cData2.down;
								CUp.Bigg = cData.up > cData2.down + boardCards[i - 1][j].addition;
							}
							else // se a posição está vazia
							{
								avgPos += cData.up;
								freeAdj++;
								/* Se a regra Open está ativa, observa as cartas do adversário. */
								if (game.rules[0])
									for (k = 0; k < playerCards.length; k++)
									{
										cData2 = game.cardData[playerCards[k].getIndex()];
										if (cData2.down > cData.up)
											Opponent[k] += 3; // Adiciona 3 pontos àquela carta do adversário
									}
							}
						}
						
						// Observando a carta de baixo
						if (i != 2)
						{
							if (boardCards[i + 1][j] != null)  // Se a posição de baixo está cheia
							{
								cData2 = game.cardData[boardCards[i + 1][j].getIndex()];	
							// Estabelece algumas relações com a carta de baixo
								CDown.Plus = cData.down + cData2.up;
								CDown.Same = cData.down == cData2.up;
								CDown.Bigg = cData.down > cData2.up + boardCards[i + 1][j].addition;
							}
							else // se a posição está vazia
							{
								avgPos += cData.down;
								freeAdj++;
								/* Se a regra Open está ativa, observa as cartas do adversário. */
								if (game.rules[0])
									for (k = 0; k < playerCards.length; k++)
									{
										cData2 = game.cardData[playerCards[k].getIndex()];
										if (cData2.up > cData.down)
											Opponent[k] += 3; // Adiciona 3 pontos àquela carta do adversário
									}
							}
						}
						
						// Observando a carta da esquerda
						if (j != 0)
						{
							if (boardCards[i][j - 1] != null)  // Se a posição de baixo está cheia
							{
								cData2 = game.cardData[boardCards[i][j - 1].getIndex()];	 
							// Estabelece algumas relações com a carta de baixo
								CLeft.Plus = cData.left + cData2.right;
								CLeft.Same = cData.left == cData2.right;
								CLeft.Bigg = cData.left > cData2.right + boardCards[i][j - 1].addition;
							}
							else // se a posição está vazia
							{
								avgPos += cData.left;
								freeAdj++;
								/* Se a regra Open está ativa, observa as cartas do adversário. */
								if (game.rules[0])
									for (k = 0; k < playerCards.length; k++)
									{
										cData2 = game.cardData[playerCards[k].getIndex()];
										if (cData2.right > cData.left)
											Opponent[k] += 3; // Adiciona 3 pontos àquela carta do adversário
									}
							}
						}
						
						// Observando a carta da direita
						if (j != 2)
						{
							if (boardCards[i][j + 1] != null)  // Se a posição de baixo está cheia
							{
								cData2 = game.cardData[boardCards[i][j + 1].getIndex()];
							// Estabelece algumas relações com a carta de baixo
								CRight.Plus = cData.right + cData2.left;
								CRight.Same = cData.right == cData2.left;
								CRight.Bigg = cData.right > cData2.left + boardCards[i][j + 1].addition;
							}
							else // se a posição está vazia
							{
								avgPos += cData.right;
								freeAdj++;
								/* Se a regra Open está ativa, observa as cartas do adversário. */
								if (game.rules[0])
									for (k = 0; k < playerCards.length; k++)
									{
										cData2 = game.cardData[playerCards[k].getIndex()];
										if (cData2.left > cData.right)
											Opponent[k] += 3; // Adiciona 3 pontos àquela carta do adversário
									}
							}
						}
						
						// Lados livres
						if (freeAdj > 0)
							Location[i * 3 + j] = Math.floor(avgPos / freeAdj) + 1;
							
						// Leva em consideração as cartas do adversário se puder.
						if (game.rules[0])
						{
							for (k = 0; k < playerCards.length; k++)
								Location[i * 3 + j] -= Opponent[k];
						}
						
						// Elemental
						if (game.rules[6])
						{
							if (boardElements[i][j] != cData.elemental) Location[i * 3 + j] -= 1;
							else if (boardElements[i][j] == cData.elemental) Location[i * 3 + j] += 1;
						}
						
						// Virando pela regra Same
						if (game.rules[3])
						{
							// Acima e Abaixo
							if (CUp.Same && CDown.Same)
							{
								if (boardCards[i - 1][j].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i + 1][j].getOwner()) Location[i * 3 + j] += 20;
							}
							// Acima e À Esquerda
							if (CUp.Same && CLeft.Same)
							{
								if (boardCards[i - 1][j].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i][j - 1].getOwner()) Location[i * 3 + j] += 20;
							}
							// Acima e À Direita
							if (CUp.Same && CRight.Same)
							{
								if (boardCards[i - 1][j].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i][j + 1].getOwner()) Location[i * 3 + j] += 20;
							}
							// À Direita e Abaixo
							if (CRight.Same && CDown.Same)
							{
								if (boardCards[i][j + 1].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i + 1][j].getOwner()) Location[i * 3 + j] += 20;
							}
							// À Direita e À Esquerda
							if (CRight.Same && CLeft.Same)
							{
								if (boardCards[i][j + 1].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i][j - 1].getOwner()) Location[i * 3 + j] += 20;
							}
							// Abaixo e À Esquerda
							if (CDown.Same && CLeft.Same)
							{
								if (boardCards[i + 1][j].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i][j - 1].getOwner()) Location[i * 3 + j] += 20;
							}
						}
						
						// Virando pela regra Plus
						if (game.rules[4])
						{
							// Acima e Abaixo
							if (CUp.Plus && CDown.Plus)
							{
								if (boardCards[i - 1][j].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i + 1][j].getOwner()) Location[i * 3 + j] += 20;
							}
							// Acima e À Esquerda
							if (CUp.Plus && CLeft.Plus)
							{
								if (boardCards[i - 1][j].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i][j - 1].getOwner()) Location[i * 3 + j] += 20;
							}
							// Acima e À Direita
							if (CUp.Plus && CRight.Plus)
							{
								if (boardCards[i - 1][j].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i][j + 1].getOwner()) Location[i * 3 + j] += 20;
							}
							// À Direita e Abaixo
							if (CRight.Plus && CDown.Plus)
							{
								if (boardCards[i][j + 1].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i + 1][j].getOwner()) Location[i * 3 + j] += 20;
							}
							// À Direita e À Esquerda
							if (CRight.Plus && CLeft.Plus)
							{
								if (boardCards[i][j + 1].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i][j - 1].getOwner()) Location[i * 3 + j] += 20;
							}
							// Abaixo e À Esquerda
							if (CDown.Plus && CLeft.Plus)
							{
								if (boardCards[i + 1][j].getOwner()) Location[i * 3 + j] += 20;
								if (boardCards[i][j - 1].getOwner()) Location[i * 3 + j] += 20;
							}
						}
						
						// Virando Normal
						if (CUp.Bigg && boardCards[i - 1][j].getOwner()) Location[i * 3 + j] += 10;
						if (CDown.Bigg && boardCards[i + 1][j].getOwner()) Location[i * 3 + j] += 10;
						if (CLeft.Bigg && boardCards[i][j - 1].getOwner()) Location[i * 3 + j] += 10;
						if (CRight.Bigg && boardCards[i][j + 1].getOwner()) Location[i * 3 + j] += 10;
					}  // IF posição vazia
					score += Location[i * 3 + j];
				} // FOR testando i e j
				
			if (score > bestScore)
			{
				bestScore = score;
				selectedCardIndex = n;
				
				// Obtendo o maior valor da matriz Location
				bestLocation = -100;
				for (i = 0; i < 3; i++)
					for (j = 0; j < 3; j++) 
					{
						if ((Location[i * 3 + j] > bestLocation) && (boardCards[i][j] == null))
						{
							bestLocation = Location[i * 3 + j];
							row = i;
							col = j;
						}
					}
			}
		} // FOR testando n
		
		// Tudo escolhido! Manda a carta para o tabuleiro.
		AIcardUp = 0;
		AICards[AIcardUp].x = -5.7;
		
		timer = 0;
		gameState = "AICard";
	}
	
	function pushIntoArray(array, elem)
	{
		if (array.indexOf(elem) == -1) array.push(elem);
	}
	
	function pushIntoArray4(array, elem)
	{
		// if not in any array
		if (toTurnOverU.indexOf(elem) == -1 && toTurnOverD.indexOf(elem) == -1 && toTurnOverL.indexOf(elem) == -1 && toTurnOverR.indexOf(elem) == -1)
		{
			array.push(elem);
		}
	}
	
	function calculate()
	{
		var cData = game.cardData[boardCards[row][col].getIndex()];
		var cData1 = null;
		var cData2 = null;
		var list = [];
		var sides = [];
		var list2 = [];
		toTurnOverU = [];
		toTurnOverD = [];
		toTurnOverL = [];
		toTurnOverR = [];
		same = false;
		plus = false;
		shineList = [];
		
		sides = [false, false, false, false];
		
		// Virando pela regra SAME
		if (game.rules[3])
		{
			// Acima
			if (row != 0 && boardCards[row - 1][col] != null)
			{
				cData1 = game.cardData[boardCards[row - 1][col].getIndex()];
				if (cData.up == cData1.down)
				{
					list.push(boardCards[row - 1][col]);
					sides[0] = true;
				}
			}
			// Abaixo
			if (row != 2 && boardCards[row + 1][col] != null)
			{
				cData1 = game.cardData[boardCards[row + 1][col].getIndex()];
				if (cData.down == cData1.up)
				{
					list.push(boardCards[row + 1][col]);
					sides[1] = true;
				}
			}
			// Esquerda
			if (col != 0 && boardCards[row][col - 1] != null)
			{
				cData1 = game.cardData[boardCards[row][col - 1].getIndex()];
				if (cData.left == cData1.right)
				{
					list.push(boardCards[row][col - 1]);
					sides[2] = true;
				}
			}
			// Direita
			if (col != 2 && boardCards[row][col + 1] != null)
			{
				cData1 = game.cardData[boardCards[row][col + 1].getIndex()];
				if (cData.right == cData1.left)
				{
					list.push(boardCards[row][col + 1]);
					sides[3] = true;
				}
			}
			
			if (list.length >= 2)
			{
				for (var n = 0; n < list.length; n++)
				{
					if (list[n].getOwner() != boardCards[row][col].getOwner())	// turn
					{
						same = true;
						break;
					}
				}			
				if (same)
				{
					if (sides[0]) // Carta acima
					{
						pushIntoArray(shineList, boardCards[row - 1][col]);
						if (boardCards[row][col].getOwner() != boardCards[row - 1][col].getOwner())
						{
							toTurnOverU.push(boardCards[row - 1][col]);
						}
					}
					if (sides[1])
					{
						pushIntoArray(shineList, boardCards[row + 1][col]);
						if (boardCards[row][col].getOwner() != boardCards[row + 1][col].getOwner())
						{
							toTurnOverD.push(boardCards[row + 1][col]);
						}
					}
					if (sides[2])
					{
						pushIntoArray(shineList, boardCards[row][col - 1]);
						if (boardCards[row][col].getOwner() != boardCards[row][col - 1].getOwner())
						{
							toTurnOverL.push(boardCards[row][col - 1]);
						}
					}
					if (sides[3])
					{
						pushIntoArray(shineList, boardCards[row][col + 1]);
						if (boardCards[row][col].getOwner() != boardCards[row][col + 1].getOwner())
						{
							toTurnOverR.push(boardCards[row][col + 1]);
						}
					}
				}
			}
		}
		
		// Virando pela regra SAME WALL
		if (game.rules[5])
		{
			// Duas abaixo
			if (row == 0) // linha de cima
				if ((boardCards[row + 1][col] != null) && (boardCards[row + 2][col] != null)) // se tem cartas
				{
					cData1 = game.cardData[boardCards[row + 1][col].getIndex()];
					cData2 = game.cardData[boardCards[row + 2][col].getIndex()];
					if ((cData.up == cData2.down) && (cData.down == cData1.up)) // same wall
					{
						if (boardCards[row][col].getOwner() != boardCards[row + 1][col].getOwner())
						{
							same = true;
							pushIntoArray(toTurnOverD, boardCards[row + 1][col]);
						}
						if (boardCards[row][col].getOwner() != boardCards[row + 2][col].getOwner())
						{
							same = true;
							pushIntoArray(toTurnOverD, boardCards[row + 2][col]);
						}
						if (same)
						{
							pushIntoArray(shineList, boardCards[row + 1][col]);
							pushIntoArray(shineList, boardCards[row + 2][col]);
						}
					}
				}
			// Duas acima
			if (row == 2) // linha de baixo
				if ((boardCards[row - 1][col] != null) && (boardCards[row - 2][col] != null)) // se tem cartas
				{
					cData1 = game.cardData[boardCards[row - 1][col].getIndex()];
					cData2 = game.cardData[boardCards[row - 2][col].getIndex()];
					if ((cData.up == cData1.down) && (cData.down == cData2.up)) // same wall
					{
						if (boardCards[row][col].getOwner() != boardCards[row - 1][col].getOwner())
						{
							same = true;
							pushIntoArray(toTurnOverU, boardCards[row - 1][col]);
						}
						if (boardCards[row][col].getOwner() != boardCards[row - 2][col].getOwner())
						{
							same = true;
							pushIntoArray(toTurnOverU, boardCards[row - 2][col]);
						}
						if (same)
						{
							pushIntoArray(shineList, boardCards[row - 1][col]);
							pushIntoArray(shineList, boardCards[row - 2][col]);
						}
					}
				}
			// Duas à direita
			if (col == 0) // coluna da esquerda
				if ((boardCards[row][col + 1] != null) && (boardCards[row][col + 2] != null)) // se tem cartas
				{
					cData1 = game.cardData[boardCards[row][col + 1].getIndex()];
					cData2 = game.cardData[boardCards[row][col + 2].getIndex()];
					if ((cData.right == cData1.left) && (cData.left == cData2.right)) // same wall
					{
						if (boardCards[row][col].getOwner() != boardCards[row][col + 1].getOwner())
						{
							same = true;
							pushIntoArray(toTurnOverR, boardCards[row][col + 1]);
						}
						if (boardCards[row][col].getOwner() != boardCards[row][col + 2].getOwner())
						{
							same = true;
							pushIntoArray(toTurnOverR, boardCards[row][col + 2]);
						}
						if (same)
						{
							pushIntoArray(shineList, boardCards[row][col + 1]);
							pushIntoArray(shineList, boardCards[row][col + 2]);
						}
					}
				}
			// Duas à esquerda
			if (col == 2) // coluna da direita
				if ((boardCards[row][col - 1] != null) && (boardCards[row][col - 2] != null)) // se tem cartas
				{
					cData1 = game.cardData[boardCards[row][col - 1].getIndex()];
					cData2 = game.cardData[boardCards[row][col - 2].getIndex()];
					if ((cData.left == cData1.right) && (cData.right == cData2.left)) // same wall
					{							
						if (boardCards[row][col].getOwner() != boardCards[row][col - 1].getOwner())
						{
							same = true;
							pushIntoArray(toTurnOverL, boardCards[row][col - 1]);
						}
						if (boardCards[row][col].getOwner() != boardCards[row][col - 2].getOwner())
						{
							same = true;
							pushIntoArray(toTurnOverL, boardCards[row][col - 2]);
						}
						if (same)
						{
							pushIntoArray(shineList, boardCards[row][col - 1]);
							pushIntoArray(shineList, boardCards[row][col - 2]);
						}
					}
				}
		}
		
		// Virando pela regra PLUS
		if (game.rules[4])
		{
			list = [null, null, null, null];
			// Acima
			if (row != 0 && boardCards[row - 1][col] != null)
			{
				cData1 = game.cardData[boardCards[row - 1][col].getIndex()];
				sides[0] = cData.up + cData1.down;
				list[0] = boardCards[row - 1][col];
			}
			// Abaixo
			if (row != 2 && boardCards[row + 1][col] != null)
			{
				cData1 = game.cardData[boardCards[row + 1][col].getIndex()];
				sides[1] = cData.down + cData1.up;
				list[1] = boardCards[row + 1][col];
			}
			// Esquerda
			if (col != 0 && boardCards[row][col - 1] != null)
			{
				cData1 = game.cardData[boardCards[row][col - 1].getIndex()];
				sides[2] = cData.left + cData1.right;
				list[2] = boardCards[row][col - 1];
			}
			// Direita
			if (col != 2 && boardCards[row][col + 1] != null)
			{
				cData1 = game.cardData[boardCards[row][col + 1].getIndex()];
				sides[3] = cData.right + cData1.left;
				list[3] = boardCards[row][col + 1];
			}
			
			for (var n = 0; n < sides.length; n++)
			{
				for (var m = n + 1; m < sides.length; m++)
				{
					if (list[n] != null && list[m] != null && sides[n] == sides[m])
					{
						if (list[n].getOwner() != boardCards[row][col].getOwner())	// turn
						{
							plus = true;
							if (n == 0)	pushIntoArray(toTurnOverU, list[n]);
							else if (n == 1) pushIntoArray(toTurnOverD, list[n]);
							else if (n == 2) pushIntoArray(toTurnOverL, list[n]);
							else if (n == 3) pushIntoArray(toTurnOverR, list[n]);
							
						}
						if (list[m].getOwner() != boardCards[row][col].getOwner())	// turn
						{
							plus = true;
							if (m == 0) pushIntoArray(toTurnOverU, list[m]);
							else if (m == 1) pushIntoArray(toTurnOverD, list[m]);
							else if (m == 2) pushIntoArray(toTurnOverL, list[m]);
							else if (m == 3) pushIntoArray(toTurnOverR, list[m]);
						}
						if (plus)
						{
							pushIntoArray(shineList, list[n]);
							pushIntoArray(shineList, list[m]);
						}
					}
				}
			}
		}
		
		if (same || plus)
		{
			shineList.push(boardCards[row][col]);
		}
		
		
		// Virando normal
		// Observando a carta de cima
		if ((row != 0) && (boardCards[row - 1][col] != null))
		{
			if (boardCards[row][col].getOwner() != boardCards[row - 1][col].getOwner())
			{
				cData1 = game.cardData[boardCards[row - 1][col].getIndex()];			
				if (cData.up + boardCards[row][col].addition > cData1.down + boardCards[row - 1][col].addition)
				{
					pushIntoArray(toTurnOverU, boardCards[row - 1][col]);
				}
			}
		}
		// Observando a carta de baixo
		if ((row != 2) && (boardCards[row + 1][col] != null))
		{
			if (boardCards[row][col].getOwner() != boardCards[row + 1][col].getOwner())
			{
				cData1 = game.cardData[boardCards[row + 1][col].getIndex()];	
				if (cData.down + boardCards[row][col].addition > cData1.up + boardCards[row + 1][col].addition)
				{
					pushIntoArray(toTurnOverD, boardCards[row + 1][col]);
				}
			}
		}
		// Observando a carta da esquerda
		if ((col != 0) && (boardCards[row][col - 1] != null))
		{
			if (boardCards[row][col].getOwner() != boardCards[row][col - 1].getOwner())
			{
				cData1 = game.cardData[boardCards[row][col - 1].getIndex()];
				if (cData.left + boardCards[row][col].addition > cData1.right + boardCards[row][col - 1].addition)
				{
					pushIntoArray(toTurnOverL, boardCards[row][col - 1]);
				}
			}
		}
		// Observando a carta da direita
		if ((col != 2) && (boardCards[row][col + 1] != null))
		{
			if (boardCards[row][col].getOwner() != boardCards[row][col + 1].getOwner())
			{
				cData1 = game.cardData[boardCards[row][col + 1].getIndex()];
				if (cData.right + boardCards[row][col].addition > cData1.left + boardCards[row][col + 1].addition)
				{
					pushIntoArray(toTurnOverR, boardCards[row][col + 1]);
				}
			}
		}
				
		
		timer = 0;
		if (toTurnOverU.length > 0 || toTurnOverD.length > 0 || toTurnOverL.length > 0 || toTurnOverR.length > 0)
		{
			if (same || plus)
			{
				for (var n = 0; n < shineList.length; n++)
				{
					shineList[n].shine = true;	
				}
				messageX = 800;
				game.sndCardShine.play();
				gameState = "shineCards";
			}
			else gameState = "turnOver";
		}
		else if (gameOver()) // no cards turned over and game over
		{
			coin.setVisible(false);
			grad = 0;
			game.canvas.addEventListener("click", onClick, false);
			gameState = "gameOver";
		}
		else // no cards turned over and still not game over
		{
			coin.changeSide(playerTurn);
			gameState = "swapTurn";
		}
	}
	
	function testCombo()
	{
		var cData = null;
		var cData1 = null;		
		var comboList = toTurnOverU.concat(toTurnOverD, toTurnOverL, toTurnOverR);
		
		toTurnOverU = [];
		toTurnOverD = [];
		toTurnOverL = [];
		toTurnOverR = [];
		same = false;
		plus = false;
		combo = false;
		
		for (var i = 0; i < comboList.length; i++)
		{
			var Row = comboList[i].row;
			var Col = comboList[i].col;
			cData = game.cardData[boardCards[Row][Col].getIndex()];	
			
			// Observando a carta de cima
			if ((Row != 0) && (boardCards[Row - 1][Col] != null))
			{
				cData1 = game.cardData[boardCards[Row - 1][Col].getIndex()];	
				if (cData.up > cData1.down)
					if (boardCards[Row][Col].getOwner() != boardCards[Row - 1][Col].getOwner())
					{
						combo = true;
						pushIntoArray4(toTurnOverU, boardCards[Row - 1][Col]);
					}
			}
			// Observando a carta de baixo
			if ((Row != 2) && (boardCards[Row + 1][Col] != null))
			{
				cData1 = game.cardData[boardCards[Row + 1][Col].getIndex()];	
				if (cData.down > cData1.up)
					if (boardCards[Row][Col].getOwner() != boardCards[Row + 1][Col].getOwner())
					{
						combo = true;
						pushIntoArray4(toTurnOverD, boardCards[Row + 1][Col]);
					}
			}
			// Observando a carta da esquerda
			if ((Col != 0) && (boardCards[Row][Col - 1] != null))
			{
				cData1 = game.cardData[boardCards[Row][Col - 1].getIndex()];	
				if (cData.left > cData1.right)
					if (boardCards[Row][Col].getOwner() != boardCards[Row][Col - 1].getOwner())
					{
						combo = true;
						pushIntoArray4(toTurnOverL, boardCards[Row][Col - 1]);
					}
			}
			// Observando a carta da direita
			if ((Col != 2) && (boardCards[Row][Col + 1] != null))
			{
				cData1 = game.cardData[boardCards[Row][Col + 1].getIndex()];	
				if (cData.right > cData1.left)
					if (boardCards[Row][Col].getOwner() != boardCards[Row][Col + 1].getOwner())
					{
						combo = true;
						pushIntoArray4(toTurnOverR, boardCards[Row][Col + 1]);
					}
			}
		}
		
		if (combo)
		{
			if (!drawCombo)
			{
				drawCombo = true;
				messageX = 800;
			}
			timer = 0;
			gameState = "turnOver";	
		}
		else
		{
			timer = 0;				
			if (gameOver()) // game over
			{
				coin.setVisible(false);
				grad = 0;
				game.canvas.addEventListener("click", onClick, false);
				gameState = "gameOver";	
			}
			else // next turn
			{
				coin.changeSide(playerTurn);
				gameState = "swapTurn";
			}
		}
	}
	
	function gameOver() // set score and test for game over
	{
		var quant = 0;
		playerScore = 0;
		AIScore = 0;
		for (n = 0; n < 3; n++)
		{
			for (var m = 0; m < 3; m++)	
			{
				if (boardCards[n][m] != null)
				{
					quant++;
					if (boardCards[n][m].getOwner()) playerScore++;
					else AIScore++;
				}	
			}
		}
		playerScore += playerCards.length;
		AIScore += AICards.length;
		return (quant == 9); // if 9 the game over
	}
	
	function beginSuddenDeath()
	{
		// return cards to the hands of players
		for (var i = 0; i < 3; i++)
		{
			for (var j = 0; j < 3; j++)
			{	
				boardCards[i][j].addition = 0; // remove elemental effect
				if (boardCards[i][j].getOwner()) playerCards.push(boardCards[i][j]);
				else AICards.push(boardCards[i][j]);
				boardCards[i][j] = null;
			}
		}
		
		// reposition cards
		for (var n = 0; n < 5; n++)
		{
			AICards[n].x = -6.5;
			AICards[n].y = (n - 2) * -1.4;
			AICards[n].z = n * 0.001;
			if (!game.rules[0]) AICards[n].setClosed(true); // Open
			
			playerCards[n].x = 6.5;
			playerCards[n].y = (n - 2) * -1.4;
			playerCards[n].z = n * 0.001;
		}		
		
		// Seleciona novamente os elementos do tabuleiro
		if (game.rules[6]) // Elemental
		{
			setBoardElements();
		}
		
		coin.setVisible(true);
		coin.changeSide(playerTurn);
		gameState = "swapTurn";
	}
	
	function cardOwnerChanged()
	{
		if (game.tradeRule != 3) return false;
		
		var changed = false;
		for (var n = 0; n < 5; n++)
		{
			if (cards[n].getOwner())
			{
				game.changes.push(n);
				changed = true;
			}
		}
		for (var n = 5; n < 10; n++)
		{
			if (!cards[n].getOwner())
			{
				game.changes.push(n);
				changed = true;
			}
		}
		
		return changed;	
	}
	
	function endGame()
	{
		timer = -100;
		if (game.tradeRule == -1) // Quick Game
		{
			if (game.musicOn) game.sndGameTrack.pause();			
			changeScreen("title");
		}
		else // Career
		{
			// Save result
			game.scoreDiff = playerScore - AIScore;
			if (playerScore > AIScore) saveData.wins++;
			else if (playerScore < AIScore) saveData.losses++;
			else saveData.draws++;
			window.localStorage.setItem("ttt", JSON.stringify(game.saveData));
			
			var changed = cardOwnerChanged();
			if (game.tradeRule != 0 && (game.scoreDiff != 0 || (game.tradeRule == 3 && changed)))
			{
				changeScreen("result");
			}
			else
			{
				if (game.musicOn) game.sndGameTrack.pause();
				changeScreen("status");
			}
		}
	}

	this.startGame = function() // called when the coin stops turning
	{
		var n;
		
		// save initial cards, used for result screen
		game.changes = [];
		for (n = 0; n <= 9; n++)
		{
			game.startingCards[n] = cards[n].getIndex();
		}
		
		// Divide cards into players
		for (n = 0; n <= 4; n++)
		{
			AICards[n] = cards[n];
		}
		for (n = 0; n <= 4; n++)
		{
			playerCards[n] = cards[n+5];
		}
		
		if (playerTurn)
		{
			selectedCardIndex = 0;
			playerCards[0].x = 5.7;
			selectedCardName = game.cardData[playerCards[0].getIndex()].name;
			game.canvas.addEventListener("mousemove", onMouseMove, false);
			game.canvas.addEventListener("click", onClick, false);
			gameState = "playerCard";
		}
		else
		{
			selectedCardIndex = 0;
			moveAI();
			cursorY = 85;
			selectedCardName = game.cardData[AICards[0].getIndex()].name;
			playSound(game.sndCursor);
		}
	}
	
	this.startAITurn = function()
	{
		selectedCardIndex = 0;
		playerTurn = false;
		moveAI();
		cursorY = 85;
		selectedCardName = game.cardData[AICards[0].getIndex()].name;
		playSound(game.sndCursor);
	}
	
	this.startPlayerTurn = function()
	{
		playerTurn = true;
		selectedCardIndex = 0;
		playerCards[0].x = 5.7;
		selectedCardName = game.cardData[playerCards[0].getIndex()].name;
		game.canvas.addEventListener("mousemove", onMouseMove, false);
		game.canvas.addEventListener("click", onClick, false);
		gameState = "playerCard";
	}
	
	this.windowOpen = function(index) // Called by the GameWindow objects when fully open
	{
		if (index == 2) // Cards Window
		{
			game.canvas.addEventListener("click", onClick, false);
			game.canvas.addEventListener("mousemove", onMouseMove, false);
			selectAnimation = false;
			selectOpen = true;
			extractLabels();
		}
		else if (index == 3) // Confirm Window
		{
			btnYes = new CommandButton("Yes, start game", 200 + 100, 125 + 80);
			btnNo = new CommandButton("No, select again", 200 + 100, 125 + 120);
			btnQuit = new CommandButton("Quit game", 200 + 100, 125 + 160);
			
			game.canvas.addEventListener("click", onClick, false);
			game.canvas.addEventListener("mousemove", onMouseMove, false);
			confirmAnimation = false;
			confirmOpen = true;
		}
		else if (index == 4) // Menu Window
		{
			btnNo = new CommandButton("Close", 200 + 120, 125 + 165);
			btnMusic = new CommandButton("Music: ", 200 + 120, 125 + 195);
			btnQuit = new CommandButton("Quit game", 200 + 120, 125 + 225);
			
			game.canvas.addEventListener("click", onClick, false);
			game.canvas.addEventListener("mousemove", onMouseMove, false);
			menuAnimation = false;
			menuOpen = true;
		}
	}
	
	this.windowClosed = function(index) // Called by the GameWindow objects when fully closed
	{
		if (index == 4) // Menu
		{
			menuSrcY = 286;
			menuAnimation = false;
			menuWindow = null;
			btnNo = null;
			btnQuit = null;
			btnMusic = null;
			game.canvas.addEventListener("click", onClick, false);
			game.canvas.addEventListener("mousemove", onMouseMove, false);
		}
		else if (index == 3)
		{
			titleWindow = null;
			cardsWindow = null;
			confirmWindow = null;
			btnYes = null;
			btnNo = null;
			btnQuit = null;
			btnCardList = null;
			selectAnimation = false;
			confirmAnimation = false;
			
			// Start Game
			if (game.rules[6]) // Elemental
			{
				setBoardElements();
			}
			timer = 0;
			playerTurn = Math.random() > 0.5;  // define who has the initiative turn
			if (game.rules[0]) // Open
			{
				gameState = "openAICards";
			}
			else
			{
				gameState = "rollCoin";
				coin = new Coin(this, playerTurn);
				game.sndCoinTurn.play();
			}
		}
	}

	// public methods
	this.update = function()
	{
		if (gameState == "beginRandom") // Cards come up until position
		{
			if (cards[0].y < 2.8) cards[0].y += 1;
			if (cards[0].y > 2.8)
			{
				cards[0].y = 2.8;
				playSound(game.sndCardMove);
			}
			
			for (var n = 1; n < cards.length; n++)
			{
				if ((cards[n].y < (n%5 - 2) * -1.4) && (cards[n-1].y == ((n-1)%5 - 2) * -1.4)) cards[n].y += 1;
				if (cards[n].y > (n%5 - 2) * -1.4)
				{
					cards[n].y = (n%5 - 2) * -1.4;
					playSound(game.sndCardMove);
				}
			}
			
			if (cards[9].y == -2.8) // all cards in position
			{
				if (game.rules[6]) // Elemental
				{
					setBoardElements();
				}				
				gameState = "rollCoin";
				playerTurn = Math.random() > 0.5;  // define who has the initiative turn
				coin = new Coin(this, playerTurn);
				game.sndCoinTurn.play();
			}
		}
		else if (gameState == "AICardsShowUp") // Computer cards come up until position, closed
		{
			if (cards[0].y < 2.8) cards[0].y += 1;
			if (cards[0].y > 2.8)
			{
				cards[0].y = 2.8;
				playSound(game.sndCardMove);
			}
			
			for (var n = 1; n < 5; n++)
			{
				if ((cards[n].y < (n%5 - 2) * -1.4) && (cards[n-1].y == ((n-1)%5 - 2) * -1.4)) cards[n].y += 1;
				if (cards[n].y > (n%5 - 2) * -1.4)
				{
					cards[n].y = (n%5 - 2) * -1.4;
					playSound(game.sndCardMove);
				}
			}
			
			if (cards[4].y == -2.8) // all cards in position
			{
				// Open selection window
				titleWindow = new GameWindow(this, "", 10, 10, 785, 50, 1);
				cardsWindow = new GameWindow(this, "CARDS PAGE 01                     STOCK", 10, 65, 295, 320, 2);
				selectAnimation = true;
				drawCursor = false;
				selectedCardIndex = 5; // the next card to select
				gameState = "selectCards";
			}
		}
		else if (gameState == "selectCards") // Player selecting his cards
		{
			if (selectAnimation)
			{
				titleWindow.update();
				cardsWindow.update();
			}
			if (confirmAnimation)
			{
				confirmWindow.update();
			}
			
			if (cardShowUp) // selected card come to position
			{
				var n = selectedCardIndex;
				
				if (cards[n].y < (n - 7) * -1.4) cards[n].y += 1;
				if (cards[n].y >= (n - 7) * -1.4)
				{
					cards[n].y = (n - 7) * -1.4;
					selectedCardIndex++;
					cardShowUp = false;
				}
			}
		}
		else if (gameState == "openAICards") // Open rule in career mode
		{
			for (var n = 0; n < 5; n++)
			{
				cards[n].addRot(Math.PI / 20);
			}
			if (cards[0].getRot() >= Math.PI * 2)
			{
				timer = 0;
				gameState = "rollCoin";
				coin = new Coin(this, playerTurn);
				game.sndCoinTurn.play();
			}
		}
		else if (gameState == "rollCoin") // Coin rolling at start of the game
		{
			coin.update();
			// just wait until coin animation is complete. Next is function this.startTurn
		}
		else if (gameState == "playerCard") // player choosing his cards
		{
			coin.update();
			if (menuAnimation)
			{
				menuWindow.update();
			}
		}
		else if (gameState == "playerBoard") // player choosing where to place the card
		{
			coin.update();
			
			timer++;
			if (timer >= 10)
			{
				drawCursor = !drawCursor;
				timer = 0;	
			}
		}
		else if (gameState == "cardGoUp") // card moving up to the board
		{
			movingCard.y += 0.4;
			if (movingCard.y >= 10)
			{
				movingCard.x = col * 2.15 - 2.2;
				movingCard.y = 10;
				movingCard.z = 2;
				boardCards[row][col] = movingCard;
				if (playerTurn)
				{
					playerCards.splice(selectedCardIndex, 1);
					// adjust cards Y position
					for (var n = 0; n < playerCards.length; n++)
					{
						playerCards[n].y = (n - 2) * -1.4;
					}
				}
				else
				{
					movingCard.setClosed(false);
					AICards.splice(selectedCardIndex, 1);
					// adjust cards Y position
					for (var n = 0; n < AICards.length; n++)
					{
						AICards[n].y = (n - 2) * -1.4;
					}
				}
				gameState = "cardGoDown";
			}
		}
		else if (gameState == "cardGoDown") // card moving down to the board
		{
			movingCard.y -= 0.4;
			movingCard.z -= 0.1;
			if (movingCard.z < 0.1) movingCard.z = 0.1;
			if (movingCard.y <= row * -2.85 + 2.9)
			{
				movingCard.y = row * -2.85 + 2.9;
				movingCard.z = 0;
				movingCard.col = col;
				movingCard.row = row;
				selectedCardIndex = -1;
				
				if (game.rules[6]) // Elemental
				{
					if (boardElements[row][col] > 0)
					{
						if (game.cardData[movingCard.getIndex()].element == boardElements[row][col])
						{
							movingCard.addition = 1;
						}
						else
						{
							movingCard.addition = -1;
						}
					}
				}
				
				calculate(); // do calculations to turn over cards
			}
		}
		else if (gameState == "swapTurn") // Coin changing sides
		{
			coin.update(); // wait for changing side
		}
		else if (gameState == "AICard") // AI cursor getting to its chosen card
		{
			coin.update();
			
			timer++;
			if (timer % 50 == 0)
			{	
				if (AIcardUp == selectedCardIndex)
				{
					timer = 0;
					gameState = "AIBoard";
				}
				else // go one down
				{
					for (var n = 0; n < AICards.length; n++)
					{
						AICards[n].x = -6.5;
					}	
					
					AIcardUp++;				
					AICards[AIcardUp].x = -5.7;
					cursorY = AIcardUp * 64 + 85;
					playSound(game.sndCursor);
					if (game.rules[0]) // Open
					{
						selectedCardName = game.cardData[AICards[AIcardUp].getIndex()].name;
					}
				}
			}
		}
		else if (gameState == "AIBoard") // Cursor blinking for a second
		{
			coin.update();
			
			timer++;
			if (timer % 10 == 0)
			{
				drawCursor = !drawCursor;
			}
			if (timer >= 60)
			{
				movingCard = AICards[selectedCardIndex];
				playSound(game.sndCardMove);
				gameState = "cardGoUp";
			}
		}
		else if (gameState == "shineCards") // Cards shining before turning over
		{
			timer++;
			if (timer <= 10 || timer >= 50)
			{
				messageX -= 53;
			}
			
			if (timer >= 60) // end of animation
			{
				for (var n = 0; n < shineList.length; n++)
				{
					shineList[n].shine = false;	
				}
				timer = 0;
				gameState = "turnOver";	
			}
		}
		else if (gameState == "turnOver") // Cards turning over
		{
			var n;
			
			coin.update();
			
			timer++;
			if (timer == 1)
			{
				playSound(game.sndCardTurn);
			}
			
			
			for (n = 0; n < toTurnOverU.length; n++) toTurnOverU[n].turnUp(timer);
			for (n = 0; n < toTurnOverD.length; n++) toTurnOverD[n].turnDown(timer);
			for (n = 0; n < toTurnOverL.length; n++) toTurnOverL[n].turnLeft(timer);
			for (n = 0; n < toTurnOverR.length; n++) toTurnOverR[n].turnRight(timer);
			
			if (timer >= 40)
			{
				if (same || plus || combo)
				{
					testCombo();	
				}
				else
				{
					timer = 0;				
					if (gameOver()) // game over
					{
						coin.setVisible(false);
						grad = 0;
						game.canvas.addEventListener("click", onClick, false);
						gameState = "gameOver";	
					}
					else // next turn
					{
						coin.changeSide(playerTurn);
						gameState = "swapTurn";
					}
				}
			}
			
			if (drawCombo)
			{
				if (timer <= 10)
				{
					messageX -= 47;
				}
			}
		}
		else if (gameState == "gameOver") // End of the game, show result
		{
			timer++;
			if (playerScore > AIScore && timer == 10)
			{
				if (game.musicOn) game.sndGameTrack.pause();
				game.sndFanfare.currentTime = 0;
				game.sndFanfare.play();	
				
				if (game.musicOn)
				{
					if (game.sndGameTrack.paused && game.sndFanfare.ended)
					{
						game.sndWinTrack.play();
					}
				}
				
			}
			
			grad += 0.01;
			if (grad > 1) grad = 1;
			
			if (timer >= 300)
			{
				game.canvas.removeEventListener("click", onClick, false);
				if (playerScore == AIScore && game.rules[2]) // Sudden Death
				{
					beginSuddenDeath();
				}
				else
				{
					endGame();
				}
			}
		}
		
		if (!combo && drawCombo)
		{
			messageX -= 47;
			if (messageX <= -330) drawCombo = false;
		}
		
		if (game.musicOn)
		{
			if (game.sndGameTrack.ended)
			{
				game.sndGameTrack.currentTime = 15.5;
				game.sndGameTrack.play();
			}
		}
	}
	
	
	function drawNamePanel(ctx)
	{
		// gradient color background
		grad = ctx.createLinearGradient(264, 390, 264 + 270, 390 + 45);
		grad.addColorStop(0, "#414139");
		grad.addColorStop(1, "#636164");
		ctx.fillStyle = grad;
		ctx.fillRect(264, 390, 270, 45);
		
		// top border
		ctx.fillStyle = "#706E71";
		ctx.fillRect(264, 390, 270, 5);
		ctx.fillStyle = "#848285";
		ctx.fillRect(264, 390 + 5, 270 - 5, 2);
		
		// left border
		ctx.fillStyle = "#706E71";
		ctx.fillRect(264, 390, 5, 45);
		ctx.fillStyle = "#848285";
		ctx.fillRect(264 + 5, 390 + 5, 2, 45 - 10);
		
		// bottom border
		ctx.fillStyle = "#39373A";
		ctx.fillRect(264, 390 + 45 - 5, 270, 5);
		
		// right border
		ctx.fillRect(264 + 270 - 5, 390 + 5, 5, 45 - 10);
		
		// bottom left corner
		grad = ctx.createLinearGradient(264, 390 + 45 - 5, 264 + 5, 390 + 45);
		grad.addColorStop(0.5, "#706E71");
		grad.addColorStop(0.5, "#39373A");
		ctx.fillStyle = grad;
		ctx.fillRect(264, 390 + 45 - 5, 5, 5);
		
		// top right corner
		grad = ctx.createLinearGradient(264 + 270 - 5, 390, 264 + 270, 390 + 5);
		grad.addColorStop(0.5, "#706E71");
		grad.addColorStop(0.5, "#39373A");
		ctx.fillStyle = grad;
		ctx.fillRect(264 + 270 - 5, 390, 5, 5);
		
		ctx.font = "25px Arial Narrow";
		ctx.textAlign = "center";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(selectedCardName, 400, 422);
	}
	
	this.draw = function(ctx)
	{
		ctx.drawImage(game.imgBoard, 0, 0);
		
		
		if (coin != null && game.rules[6]) // Elemental
		{
			for (var i = 0; i < 3; i++)
			{
				for (var j = 0; j < 3; j++)
				{
					if (boardElements[i][j] != 0)
					{
						ctx.drawImage(game.imgElements, (boardElements[i][j] - 1) * 25, 0, 25, 28, 282 + 104 * j, 84 + 128 * i, 25, 28);
					}
				}
			}	
		}
		
		// Draw cards on 3D Canvas
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);			
		glMatrix.mat4.perspective(pMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 10000.0);
		for (var n = 0; n < cards.length; n++)
		{
			cards[n].draw(program, pMatrix, cardTextureImg, texCtx);	
		}
		ctx.drawImage(canvas3d, 0, 0);
		
		if (coin != null) // Coin and score
		{
			coin.draw(ctx);
			
			// draw score
			ctx.drawImage(game.imgScoreNumbers, (AIScore - 1) * 41, 0, 41, 50, 80, 390, 41, 50);
			ctx.drawImage(game.imgScoreNumbers, (playerScore - 1) * 41, 0, 41, 50, 670, 390, 41, 50);
		}
		
		if (gameState == "selectCards") // Player selecting his cards
		{
			titleWindow.draw(ctx);
			cardsWindow.draw(ctx);
			
			if (selectOpen)
			{
				ctx.font = "25px Arial Narrow";
				ctx.fillStyle = "#FFFFFF";
				ctx.fillText("Cards Selection", 10 + 20, 10 + 35);
				
				// arrow buttons
				ctx.beginPath();
				ctx.moveTo(287, 218);
				ctx.lineTo(287, 218 + 14);
				ctx.lineTo(287 + 10, 218 + 7);
				ctx.lineTo(287, 218);
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
					ctx.fillText("x " + quants[saveData.cards.indexOf(indexList[n])], 250, btnCardList[n].getY());
				}
				
				if (cardSrcX < 110)
				{
					grad = ctx.createLinearGradient(290, 250, 290, 250 + 125);
					grad.addColorStop(0, "#E7E7E7");
					grad.addColorStop(1, "#2142BD"); // blue
					ctx.fillStyle = grad;
					ctx.fillRect(310, 250, 94, 125);
				}
				ctx.drawImage(game.imgCards, 94 * cardSrcX, 0, 94, 125, 310, 250, 94, 125); // card back
			}
			if (confirmAnimation || confirmOpen)
			{
				confirmWindow.draw(ctx);
				if (confirmOpen)
				{
					ctx.font = "25px Arial Narrow";
					ctx.fillStyle = "#FFFFFF";
					ctx.fillText("Are you sure?", 200 + 20, 125 + 40);
					btnYes.draw(ctx);
					btnNo.draw(ctx);
					btnQuit.draw(ctx);
				}
			}
			
			if (drawCursor)
			{
				ctx.drawImage(game.imgCursor, cursorX, cursorY);
			}
		}
		else if (gameState == "playerCard")  // player choosing his cards
		{
			// draw card name panel
			drawNamePanel(ctx);
			ctx.drawImage(game.imgMessages, 392, menuSrcY, 35, 35, 765, 5, 30, 30); // menu button
			
			if (menuAnimation || menuOpen)
			{
				ctx.textAlign = "left";
				menuWindow.draw(ctx);
				if (menuOpen)
				{
					ctx.font = "25px Arial Narrow";
					ctx.fillStyle = "#FFFFFF";
					ctx.fillText("Active Rules:", 225, 125);
					ctx.fillText(rulesTxt, 250, 155);
					ctx.fillText(rulesTxt2, 250, 185);
					ctx.fillText("Trade Rule:", 225, 220);
					ctx.fillText(rulesTxt3, 250, 250);
					btnNo.draw(ctx);
					btnMusic.draw(ctx);
					btnQuit.draw(ctx);
					if (game.musicOn) ctx.fillText("On", 380, 320);
					else ctx.fillText("Off", 380, 320);
				}
				if (drawCursor)
				{
					ctx.drawImage(game.imgCursor, cursorX, cursorY);
				}
				
			}
		}
		else if (gameState == "playerBoard")  // player choosing where to place the card
		{			
			if (drawCursor)
			{
				ctx.drawImage(game.imgCursor, 590, cursorY);
			}
			
			// draw board cursor
			if (drawRect)
			{
				ctx.strokeStyle = "#0000FF";
				ctx.lineWidth = 5;
				ctx.strokeRect(rectX, rectY, 95, 115);
			}
			
			drawNamePanel(ctx);
		}
		else if (gameState == "AICard")  // AI choosing his cards
		{
			// draw cursor
			ctx.save();
			ctx.scale(-1, 1);			
			ctx.drawImage(game.imgCursor, -210, cursorY);
			ctx.restore();
			
			if (game.rules[0]) // Open
			{
				drawNamePanel(ctx);
			}
		}
		else if (gameState == "AIBoard")  // AI choosing his cards
		{
			if (drawCursor)
			{
				ctx.save();
				ctx.scale(-1, 1);			
				ctx.drawImage(game.imgCursor, -210, cursorY);
				ctx.restore();
			}
			if (game.rules[0]) // Open
			{
				drawNamePanel(ctx);
			}
		}
		else if (gameState == "shineCards") // Cards shining before turning over
		{
			if (same)
			{
				ctx.drawImage(game.imgMessages, 2, 236, 264, 121, messageX, 164, 264, 121);	
			}
			else if (plus)
			{
				ctx.drawImage(game.imgMessages, 2, 360, 242, 121, messageX, 164, 242, 121);
			}
		}
		else if (gameState == "gameOver")
		{
			// draw score
			ctx.drawImage(game.imgScoreNumbers, (AIScore - 1) * 41, 0, 41, 50, 80, 390, 41, 50);
			ctx.drawImage(game.imgScoreNumbers, (playerScore - 1) * 41, 0, 41, 50, 670, 390, 41, 50);
			
			if (playerScore > AIScore)  // You Win
			{
				if (timer == 10 || timer == 11) // flash
				{
					ctx.fillStyle = "#FFFFFF";
					ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
				}
				else if (timer > 11)
				{
					ctx.drawImage(game.imgMessages, 0, 0, 360, 79, 220, 185, 360, 79);
					ctx.globalAlpha = 1 - grad;
					ctx.globalCompositeOperation = "xor";
					ctx.drawImage(game.imgMessages, 0, 0, 360, 79, 220, 185, 360, 79);
					ctx.globalCompositeOperation = "source-over";
					ctx.globalAlpha = 1.0;
				}
			}
			else if (playerScore < AIScore) // You Lose...
			{
				ctx.globalAlpha = grad;
				ctx.drawImage(game.imgMessages, 0, 78, 430, 79, 185, 185, 430, 79);
				ctx.globalAlpha = 1.0;
			}
			else  // Draw
			{
				ctx.globalAlpha = grad;
				ctx.drawImage(game.imgMessages, 0, 156, 210, 79, 295, 185, 210, 79);
				ctx.globalAlpha = 1.0;
			}
		}
		
		if (drawCombo)
		{
			ctx.drawImage(game.imgMessages, 2, 484, 330, 121, messageX, 164, 330, 121);	
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
	
	function checkMouseOnButton2(button, index, X, Y)
	{
		if (button.isMouseEnter(X, Y))
		{
			playSound(game.sndCursor);
			drawCursor = true;
			cursorX = button.getX() - 35;
			cursorY = button.getY() - 16;
			cardSrcX = index;
		}
		else if (button.isMouseOut(X, Y))
		{
			cardSrcX = 110;
			drawCursor = false;
		}
	}
	
	function onMouseMove(e)
	{
		if (gameState == "selectCards") // Player selecting his cards - Carrer, not Random
		{
			if (confirmOpen) // Modal window
			{
				checkMouseOnButton(btnYes, e.offsetX, e.offsetY);
				checkMouseOnButton(btnNo, e.offsetX, e.offsetY);
				checkMouseOnButton(btnQuit, e.offsetX, e.offsetY);
			}
			else
			{
				for (var n = 0; n < btnCardList.length; n++)
				{
					if (btnCardList[n].enabled)
					{
						checkMouseOnButton2(btnCardList[n], indexList[n], e.offsetX, e.offsetY);
					}
				}
			}
		}
		else if (gameState == "playerCard")  // player choosing his cards
		{
			if (menuOpen)  // Modal Window
			{
				checkMouseOnButton(btnNo, e.offsetX, e.offsetY);
				checkMouseOnButton(btnMusic, e.offsetX, e.offsetY);
				checkMouseOnButton(btnQuit, e.offsetX, e.offsetY);
			}
			else
			{
				for (var n = 0; n < playerCards.length; n++)
				{
					if (e.offsetX >= 649 && e.offsetX <= 739 && e.offsetY >= n * 64 + 34 && e.offsetY <= n * 64 + 97 && !playerCards[n].mouseOver)
					{
						for (var m = 0; m < playerCards.length; m++)
						{
							playerCards[m].x = 6.5;
						}
						
						playerCards[n].x = 5.7;
						playerCards[n].mouseOver = true;
						if (selectedCardIndex != n)
						{
							playSound(game.sndCursor);
							selectedCardName = game.cardData[playerCards[n].getIndex()].name;
						}
						selectedCardIndex = n;
					}
					else if (!(e.offsetX > 649 && e.offsetX < 739 && e.offsetY > n * 64 + 34 && e.offsetY < n * 64 + 97) && playerCards[n].mouseOver)
					{
						playerCards[n].mouseOver = false;
					}
				}
				// Menu
				if (e.offsetX >= 765 && e.offsetX <= 765 + 30 && e.offsetY >= 5 && e.offsetY <= 5 + 30)
				{
					menuSrcY = 325;
				}
				else
				{
					menuSrcY = 286;
				}
			}
		}
		else if (gameState == "playerBoard")  // player choosing where to place the card
		{
			drawRect = false;
			for (var i = 0; i <= 2; i++)
			{
				for (var j = 0; j <= 2; j++)
				{
					if (e.offsetX >= j * 106 + 244 && e.offsetX < j * 106 + 339 && e.offsetY >= i * 128 + 40 && e.offsetY < i * 128 + 155)
					{
						if (boardCards[i][j] == null) // only if space is empty
						{
							rectX = j * 106 + 244;
							rectY = i * 128 + 40;
							drawRect = true;
							col = j;
							row = i;
							break;
						}
					}
				}
			}
		}
	}
	
	function format(num)
	{
		if (num < 10) return "0" + num;
		else return num.toString();
	}
	
	function onClick(e)
	{
		if (gameState == "selectCards") // Player selecting his cards - Carrer, not Random
		{
			if (confirmOpen) // Modal window
			{
				if (btnYes.onClick(e.offsetX, e.offsetY)) // Start game
				{
					playSound(game.sndClick);
					game.canvas.removeEventListener("click", onClick, false);
					game.canvas.removeEventListener("mousemove", onMouseMove, false);
					titleWindow.close();
					cardsWindow.close();
					confirmWindow.close();
					selectAnimation = true;
					selectOpen = false;
					confirmAnimation = true;
					confirmOpen = false;
					drawCursor = false;			
				}
				else if (btnNo.onClick(e.offsetX, e.offsetY)) // Reselect cards
				{
					playSound(game.sndCoinBegin);
					quants = saveData.quant.concat();  // copia as cartas do profile
					confirmOpen = false;
					cards[5].y = -7;
					cards[6].y = -7;
					cards[7].y = -7;
					cards[8].y = -7;
					cards[9].y = -7;
					drawCursor = false;
					selectedCardIndex = 5;
					for (var n = 0; n < btnCardList.length; n++)
					{
						btnCardList[n].enabled = true;
					}
				}
				else if (btnQuit.onClick(e.offsetX, e.offsetY)) // Quit game
				{
					playSound(game.sndCoinBegin);
					game.canvas.removeEventListener("click", onClick, false);
					game.canvas.removeEventListener("mousemove", onMouseMove, false);
					if (game.musicOn) game.sndGameTrack.pause();
					changeScreen("status");
				}
			}
			else // Cards Window
			{
				// Left Arrow
				if (e.offsetX > 20 && e.offsetX < 20 + 10 && e.offsetY > 218 && e.offsetY < 218 + 14)
				{
					page--;
					if (page <= 0) page = 10;
					extractLabels();
					cardsWindow.setCaption("CARDS PAGE " + format(page) + "                     STOCK");
				}
				// Right Arrow
				else if (e.offsetX > 287 && e.offsetX < 287 + 10 && e.offsetY > 218 && e.offsetY < 218 + 14)
				{
					page++;
					if (page > 10) page = 1;
					extractLabels();
					cardsWindow.setCaption("CARDS PAGE " + format(page) + "                     STOCK");
				}
				else // click on card name
				{
					for (var n = 0; n < btnCardList.length; n++)
					{
						if (btnCardList[n].enabled && btnCardList[n].onClick(e.offsetX, e.offsetY))
						{
							cards[selectedCardIndex].setData(indexList[n]);
							playSound(game.sndCardMove);
							cardShowUp = true;
							quants[saveData.cards.indexOf(indexList[n])]--;
							if (quants[saveData.cards.indexOf(indexList[n])] == 0)
							{
								drawCursor = false;
								btnCardList[n].enabled = false;
								cardSrcX = 110;
							}
							
							// All player cards in position
							if (selectedCardIndex == 9)
							{
								game.canvas.removeEventListener("click", onClick, false);
								game.canvas.removeEventListener("mousemove", onMouseMove, false);
								confirmWindow = new GameWindow(thisScreen, "CONFIRMATION", 200, 125, 400, 200, 3);
								confirmAnimation = true;
								drawCursor = false;
							}
						}
					}	
				}
			}
		}
		else if (gameState == "playerCard")  // player choosing his cards
		{
			if (menuOpen) // Modal Window
			{
				if (btnNo.onClick(e.offsetX, e.offsetY)) // Close window
				{
					playSound(game.sndCoinBegin);
					game.canvas.removeEventListener("click", onClick, false);
					game.canvas.removeEventListener("mousemove", onMouseMove, false);
					menuWindow.close();
					menuAnimation = true;
					menuOpen = false;
					drawCursor = false;		
				}
				else if (btnMusic.onClick(e.offsetX, e.offsetY)) // Toggle music
				{
					playSound(game.sndClick);
					game.musicOn = !game.musicOn;
					
					if (game.musicOn)
					{
						if (game.sndGameTrack.paused)
						{
							game.sndGameTrack.currentTime = 0;
							game.sndGameTrack.play();
						}
					}
					else
					{
						game.sndGameTrack.pause();
					}
				}
				else if (btnQuit.onClick(e.offsetX, e.offsetY)) // Quit game
				{
					playSound(game.sndCoinBegin);
					game.canvas.removeEventListener("click", onClick, false);
					game.canvas.removeEventListener("mousemove", onMouseMove, false);
					if (game.musicOn) game.sndGameTrack.pause();
					if (game.tradeRule == -1) // Quick Game
					{
						changeScreen("title");
					}
					else
					{
						changeScreen("status");
					}
				}
			}
			else
			{
				for (var n = 0; n < playerCards.length; n++)
				{
					if (e.offsetX > 613 && e.offsetX < 703 && e.offsetY > n * 64 + 34 && e.offsetY < n * 64 + 97)
					{
						gameState = "playerBoard";
						cursorY = n * 64 + 85;
						drawRect = false;
						break;
					}
				}
				// Menu
				if (e.offsetX >= 765 && e.offsetX <= 765 + 30 && e.offsetY >= 5 && e.offsetY <= 5 + 30)
				{
					game.canvas.removeEventListener("click", onClick, false);
					game.canvas.removeEventListener("mousemove", onMouseMove, false);
					menuWindow = new GameWindow(thisScreen, "MENU", 200, 75, 400, 300, 4);
					menuAnimation = true;
					drawCursor = false;
				}
			}
		}
		else if (gameState == "playerBoard")  // player choosing where to place the card
		{
			if (e.offsetX > 613 && e.offsetX < 703 && e.offsetY > selectedCardIndex * 64 + 34 && e.offsetY < selectedCardIndex * 64 + 97)
			{
				gameState = "playerCard";
			}
			if (drawRect) // on a card space
			{
				game.canvas.removeEventListener("mousemove", onMouseMove, false);
				game.canvas.removeEventListener("click", onClick, false);
				drawRect = false;
				drawCursor = false;
				movingCard = playerCards[selectedCardIndex];
				playSound(game.sndCardMove);
				gameState = "cardGoUp";
			}
		}
		else if (gameState == "gameOver")  // player choosing where to place the card
		{
			if (!game.sndFanfare.paused && game.tradeRule == -1) // only if Quick Game
			{
				game.sndFanfare.pause();
			}
			game.canvas.removeEventListener("click", onClick, false);
			if (playerScore == AIScore && game.rules[2]) // Sudden Death
			{
				beginSuddenDeath();
			}
			else
			{
				endGame();
			}
		}
		
		// Menu
		
	}
}





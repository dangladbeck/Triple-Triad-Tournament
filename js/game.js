var game = 
{
	// global variables
	canvas: null,
	ctx: null,
	saveData: null,
	currentProfile: 0,
	musicOn: true,
	imgTitle: new Image(),
	imgCursor: new Image(),
	imgBoard: new Image(),
	imgResult: new Image(),
	imgCards: new Image(),
	imgCoin: new Image(),
	imgScoreNumbers: new Image(),
	imgMessages: new Image(),
	imgElements: new Image(),
	imgTuto0: new Image(),
	imgTutorial: new Image(),
	sndCursor: new Audio(),
	sndClick: new Audio(),
	sndCoinBegin: new Audio(),
	sndCoinTurn: new Audio(),
	sndCardMove: new Audio(),
	sndCardTurn: new Audio(),
	sndCardShine: new Audio(),
	sndFanfare: new Audio(),
	sndMenuTrack: new Audio(),
	sndGameTrack: new Audio(),
	sndWinTrack: new Audio(),
	
	rules: [false, false, false, false, false, false, false],  // open, random, sudden death, same, plus, same wall, elemental
	tradeRule: -1, // No rule selected
	
	startingCards: [], // cards at the start of the game, used for result
	changes: [],   // stores changes to the ownership
	scoreDiff: 0,   // difference in the score, used for result
	
	cardData:
	[
		{name: "Geezard", up: 1, left: 5, right: 4, down: 1, element: 0},
		{name: "Funguar", up: 5, left: 3, right: 1, down: 1, element: 0},
		{name: "Bite Bug", up: 1, left: 5, right: 3, down: 3, element: 0},
		{name: "Red Bat", up: 2, left: 6, right: 1, down: 1, element: 0},
		{name: "Blobra", up: 2, left: 5, right: 3, down: 1, element: 0},
		{name: "Gayla", up: 2, left: 4, right: 1, down: 4, element: 6},
		{name: "Gesper", up: 1, left: 1, right: 5, down: 4, element: 0},
		{name: "Fastitocalon-F", up: 3, left: 1, right: 5, down: 2, element: 1},
		{name: "Blood Soul", up: 2, left: 1, right: 1, down: 6, element: 0},
		{name: "Caterchipillar", up: 4, left: 3, right: 2, down: 4, element: 0},
		{name: "Cockatrice", up: 2, left: 6, right: 1, down: 2, element: 6},
		{name: "Grat", up: 7, left: 1, right: 1, down: 3, element: 0},
		{name: "Buel", up: 6, left: 3, right: 2, down: 2, element: 0},
		{name: "Mesmerize", up: 5, left: 4, right: 3, down: 3, element: 0},
		{name: "Glacial Eye", up: 6, left: 3, right: 1, down: 4, element: 4},
		{name: "Belhelmel", up: 3, left: 3, right: 4, down: 5, element: 0},
		{name: "Thrustaevis", up: 5, left: 5, right: 3, down: 2, element: 8},
		{name: "Anacondaur", up: 5, left: 5, right: 1, down: 3, element: 5},
		{name: "Creeps", up: 5, left: 2, right: 2, down: 5, element: 6},
		{name: "Grendel", up: 4, left: 2, right: 4, down: 5, element: 6},
		{name: "Jelleye", up: 3, left: 7, right: 2, down: 1, element: 0},
		{name: "Grand Mantis", up: 5, left: 3, right: 2, down: 5, element: 0},
		{name: "Forbidden", up: 6, left: 3, right: 6, down: 3, element: 0},
		{name: "Armadodo", up: 6, left: 6, right: 3, down: 1, element: 1},
		{name: "Tri-Face", up: 3, left: 5, right: 5, down: 5, element: 5},
		{name: "Fastitocalon", up: 7, left: 3, right: 5, down: 1, element: 1},
		{name: "Snow Lion", up: 7, left: 3, right: 1, down: 5, element: 4},
		{name: "Ochu", up: 5, left: 3, right: 6, down: 3, element: 0},
		{name: "SAM08G", up: 5, left: 4, right: 6, down: 2, element: 2},
		{name: "Death Claw", up: 4, left: 2, right: 4, down: 7, element: 2},
		{name: "Cactuar", up: 6, left: 3, right: 2, down: 6, element: 0},
		{name: "Tonberry", up: 3, left: 4, right: 6, down: 4, element: 0},
		{name: "Abyss Worm", up: 7, left: 5, right: 2, down: 3, element: 1},
		{name: "Turtapod", up: 2, left: 7, right: 3, down: 6, element: 0},
		{name: "Vysage", up: 6, left: 5, right: 5, down: 4, element: 0},
		{name: "T-Rexaur", up: 4, left: 7, right: 6, down: 2, element: 0},
		{name: "Bomb", up: 2, left: 3, right: 7, down: 6, element: 2},
		{name: "Blitz", up: 1, left: 7, right: 6, down: 4, element: 6},
		{name: "Wendigo", up: 7, left: 6, right: 3, down: 1, element: 0},
		{name: "Torama", up: 7, left: 4, right: 4, down: 4, element: 0},
		{name: "Imp", up: 3, left: 6, right: 7, down: 3, element: 0},
		{name: "Blue Dragon", up: 6, left: 3, right: 2, down: 7, element: 5},
		{name: "Adamantoise", up: 4, left: 6, right: 5, down: 5, element: 1},
		{name: "Hexadragon", up: 7, left: 3, right: 5, down: 4, element: 2},
		{name: "Iron Giant", up: 6, left: 5, right: 5, down: 6, element: 0},
		{name: "Behemoth", up: 3, left: 7, right: 6, down: 5, element: 0},
		{name: "Chimera", up: 7, left: 3, right: 6, down: 5, element: 7},
		{name: "PuPu", up: 3, left: 1, right: 10, down: 2, element: 0},
		{name: "Elastoid", up: 6, left: 7, right: 2, down: 6, element: 0},
		{name: "GIM47N", up: 5, left: 4, right: 5, down: 7, element: 0},
		{name: "Malboro", up: 7, left: 2, right: 7, down: 4, element: 5},
		{name: "Ruby Dragon", up: 7, left: 4, right: 2, down: 7, element: 2},
		{name: "Elnoyle", up: 5, left: 6, right: 3, down: 7, element: 0},
		{name: "Tonberry King", up: 4, left: 4, right: 6, down: 7, element: 0},
		{name: "Wedge, Biggs", up: 6, left: 7, right: 6, down: 2, element: 0},
		{name: "Fujin, Raijin", up: 2, left: 4, right: 8, down: 8, element: 0},
		{name: "Elvoret", up: 7, left: 4, right: 8, down: 3, element: 8},
		{name: "X-ATM092", up: 4, left: 3, right: 8, down: 7, element: 0},
		{name: "Granaldo", up: 7, left: 5, right: 2, down: 8, element: 0},
		{name: "Gerogero", up: 1, left: 3, right: 8, down: 8, element: 5},
		{name: "Iguion", up: 8, left: 2, right: 2, down: 8, element: 0},
		{name: "Abadon", up: 6, left: 5, right: 8, down: 4, element: 0},
		{name: "Trauma", up: 4, left: 6, right: 8, down: 5, element: 0},
		{name: "Oilboyle", up: 1, left: 8, right: 8, down: 4, element: 0},
		{name: "Shumi Tribe", up: 6, left: 4, right: 5, down: 8, element: 0},
		{name: "Krysta", up: 7, left: 1, right: 5, down: 8, element: 0},
		{name: "Propagator", up: 8, left: 8, right: 4, down: 4, element: 0},
		{name: "Jumbo Cactuar", up: 8, left: 4, right: 8, down: 4, element: 0},
		{name: "Tri-Point", up: 8, left: 8, right: 5, down: 2, element: 6},
		{name: "Gargantua", up: 5, left: 8, right: 6, down: 6, element: 0},
		{name: "Mobile Type-8", up: 8, left: 3, right: 6, down: 7, element: 0},
		{name: "Sphinxara", up: 8, left: 8, right: 3, down: 5, element: 0},
		{name: "Tiamat", up: 8, left: 4, right: 8, down: 5, element: 0},
		{name: "BGH251F2", up: 5, left: 5, right: 7, down: 8, element: 0},
		{name: "Red Giant", up: 6, left: 7, right: 8, down: 4, element: 0},
		{name: "Catoblepas", up: 1, left: 7, right: 8, down: 7, element: 0},
		{name: "Ultima Weapon", up: 7, left: 8, right: 7, down: 2, element: 0},
		{name: "Chubby Chocobo", up: 4, left: 9, right: 4, down: 8, element: 0},
		{name: "Angelo", up: 9, left: 3, right: 6, down: 7, element: 0},
		{name: "Gilgamesh", up: 3, left: 6, right: 7, down: 9, element: 0},
		{name: "MiniMog", up: 9, left: 2, right: 3, down: 9, element: 0},
		{name: "Chicobo", up: 9, left: 4, right: 4, down: 8, element: 0},
		{name: "Quezacotl", up: 2, left: 4, right: 9, down: 9, element: 6},
		{name: "Shiva", up: 6, left: 9, right: 7, down: 4, element: 4},
		{name: "Ifrit", up: 9, left: 8, right: 6, down: 2, element: 2},
		{name: "Siren", up: 8, left: 2, right: 9, down: 6, element: 0},
		{name: "Sacred", up: 5, left: 9, right: 1, down: 9, element: 1},
		{name: "Minotaur", up: 9, left: 9, right: 5, down: 2, element: 1},
		{name: "Carbuncle", up: 8, left: 4, right: 4, down: 10, element: 0},
		{name: "Diablos", up: 5, left: 3, right: 10, down: 8, element: 0},
		{name: "Leviathan", up: 7, left: 7, right: 10, down: 1, element: 7},
		{name: "Odin", up: 8, left: 5, right: 10, down: 3, element: 0},
		{name: "Pandemona", up: 10, left: 7, right: 1, down: 7, element: 8},
		{name: "Cerberus", up: 7, left: 10, right: 4, down: 6, element: 0},
		{name: "Alexander", up: 9, left: 2, right: 10, down: 4, element: 3},
		{name: "Phoenix", up: 7, left: 10, right: 2, down: 7, element: 2},
		{name: "Bahamut", up: 10, left: 6, right: 8, down: 2, element: 0},
		{name: "Doomtrain", up: 3, left: 10, right: 1, down: 10, element: 5},
		{name: "Eden", up: 4, left: 10, right: 4, down: 9, element: 0},
		{name: "Ward", up: 10, left: 8, right: 7, down: 2, element: 0},
		{name: "Kiros", up: 6, left: 10, right: 7, down: 6, element: 0},
		{name: "Laguna", up: 5, left: 9, right: 10, down: 3, element: 0},
		{name: "Selphie", up: 10, left: 4, right: 8, down: 6, element: 0},
		{name: "Quistis", up: 9, left: 2, right: 6, down: 10, element: 0},
		{name: "Irvine", up: 2, left: 10, right: 6, down: 9, element: 0},
		{name: "Zell", up: 8, left: 6, right: 5, down: 10, element: 0},
		{name: "Rinoa", up: 4, left: 10, right: 10, down: 2, element: 0},
		{name: "Edea", up: 10, left: 3, right: 10, down: 3, element: 0},
		{name: "Seifer", up: 6, left: 4, right: 9, down: 10, element: 0},
		{name: "Squall", up: 10, left: 9, right: 4, down: 6, element: 0},
	]
};

var currentScreen;
var resLoaded;

var transition = false;
var fadein = true;
var alpha = 0;

window.onload = function()
{
	// initialize canvas
	game.canvas = document.getElementById("canvas");
	game.ctx = game.canvas.getContext("2d");
		
	resLoaded = 0;
	
	// Load all resources, in the form:
	game.imgTitle.src = "img/title.jpg";
	game.imgTitle.onload = loadRes;
	game.imgCursor.src = "img/cursor.png";
	game.imgCursor.onload = loadRes;
	game.imgBoard.src = "img/board.jpg";
	game.imgBoard.onload = loadRes;
	game.imgResult.src = "img/results.jpg";
	game.imgResult.onload = loadRes;
	game.imgCards.src = "img/cards.png";
	game.imgCards.onload = loadRes;
	game.imgCoin.src = "img/coin.png";
	game.imgCoin.onload = loadRes;
	game.imgScoreNumbers.src = "img/score.png";
	game.imgScoreNumbers.onload = loadRes;
	game.imgMessages.src = "img/messages.png";
	game.imgMessages.onload = loadRes;
	game.imgElements.src = "img/elements.png";
	game.imgElements.onload = loadRes;
	game.imgTuto0.src = "img/tutorialbg.jpg";
	game.imgTuto0.onload = loadRes;
	game.imgTutorial.src = "img/tutorialpics.png";
	game.imgTutorial.onload = loadRes;
	
	game.sndCursor.src = "snd/menumove.wav";
	game.sndCursor.onloadeddata = loadRes;
	game.sndClick.src = "snd/menuclick.wav";
	game.sndClick.onloadeddata = loadRes;
	game.sndCoinBegin.src = "snd/coinbegin.wav";
	game.sndCoinBegin.onloadeddata = loadRes;
	game.sndCoinTurn.src = "snd/cointurn.wav";
	game.sndCoinTurn.onloadeddata = loadRes;
	game.sndCardMove.src = "snd/cardmove.wav";
	game.sndCardMove.onloadeddata = loadRes;
	game.sndCardTurn.src = "snd/cardturn.wav";
	game.sndCardTurn.onloadeddata = loadRes;
	game.sndFanfare.src = "snd/fanfare.mp3";
	game.sndFanfare.onloadeddata = loadRes;
	game.sndCardShine.src = "snd/cardshine.wav";
	game.sndCardShine.onloadeddata = loadRes;
	game.sndMenuTrack.src = "snd/menutrack.mp3";
	game.sndMenuTrack.onloadeddata = loadRes;
	game.sndGameTrack.src = "snd/gametrack.mp3";
	game.sndGameTrack.onloadeddata = loadRes;
	game.sndWinTrack.src = "snd/gamewin.mp3";
	game.sndWinTrack.onloadeddata = loadRes;
}

function loadRes()
{
	resLoaded++;	
	if (resLoaded == 22) // if this is the last resource loaded
	{
		run();	
	}
}

function run()
{
	document.getElementById("loadtxt").style.display = "none";
	game.canvas.style.display = "block";
	
	// retrieve save data
	if (window.localStorage.getItem("ttt") != null)
	{
		game.saveData = JSON.parse(localStorage.getItem("ttt"));
	}
	else
	{
		game.saveData = {profile1: null, profile2: null, profile3: null};
	}
	
	// set game loop - at fixed frame rate
	setInterval(loop, 1000 / 60); // 60 fps
	game.sndWinTrack.loop = true;
	game.sndMenuTrack.loop = true;
	game.sndMenuTrack.play();
	
	// begin with first screen
	currentScreen = new TitleScreen();
}

function loop()
{
	// call update and draw methods
    update();
    draw();
}

function update()
{
	currentScreen.update(); // update screen
	
	if (transition)
	{
		if (fadein)
		{
			alpha += 0.06;
			if (alpha >= 1)
			{
				alpha = 1;
				fadein = false;
				// change screen
				changeS();
			}
		}
		else
		{
			alpha -= 0.06;
			if (alpha <= 0)
			{
				transition = false;
			}
		}
	}
}

function draw()
{
	currentScreen.draw(game.ctx);  // draw current screen
	
	if (transition)
	{
		game.ctx.globalAlpha = alpha;
		game.ctx.fillStyle = "#000000";
		game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
		game.ctx.globalAlpha = 1;
	}
}

function changeScreen(next)
{
	nextScreen = next;
	fadein = true;
	alpha = 0;
	transition = true;
}

function changeS()
{
	if (nextScreen == "title")
	{
		currentScreen = new TitleScreen();
	}
	else if (nextScreen == "tutorial")
	{
		currentScreen = new TutorialScreen();
	}
	else if (nextScreen == "quickgame")
	{
		currentScreen = new QuickGameScreen();
	}
	else if (nextScreen == "profile")
	{
		currentScreen = new ProfileScreen();
	}
	else if (nextScreen == "newprofile")
	{
		currentScreen = new NewProfileScreen();
	}
	else if (nextScreen == "status")
	{
		currentScreen = new StatusScreen();
	}
	else if (nextScreen == "newgame")
	{
		currentScreen = new NewGameScreen();
	}
	else if (nextScreen == "game")
	{
		currentScreen = new GameScreen();
	}
	else if (nextScreen == "result")
	{
		currentScreen = new ResultScreen();
	}
}





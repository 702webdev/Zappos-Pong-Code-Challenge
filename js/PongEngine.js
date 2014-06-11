// JavaScript Document
// Author: Nicholas Darley 

$(document).ready(function ()
{

    //global variables

    //stage
    var canvas;
    var ctx;
    var WIDTH;
    var HEIGHT;
	var temp;
	var conditionCode; 
	var weatherBG; 
	var mouse = {}; // Mouse object to store it's current position
    //ball
    var x;
    var y;
    var ballRadius = 10;

    //paddles
    var paddleHeight = 70;
    var paddleWidth = 10;
    var playerPaddle;
    var compPaddle;


    //attach event listeners
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

    //flags
    var upPressed = false;
    var downPressed = false;

    //interval variable
    var refreshStage;

    var directionX;
    var directionY;

    //timeout variable
    var wait;

    //scores
    var playerScore = 0;
    var compScore = 0;
    var lastWinner = "comp";

    //sounds
    var paddleBeep = new Audio("http://cd.textfiles.com/10000soundssongs/WAV/POP.WAV");
    var sideBeep = new Audio("http://cd.textfiles.com/10000soundssongs/WAV/BTN3_22.WAV");
    var scoreBeep = new Audio("http://cd.textfiles.com/10000soundssongs/WAV/BEAM.WAV");
    var overBeep = new Audio("http://cd.textfiles.com/10000soundssongs/WAV/BUZZER.WAV");
       
    //this function initialises the game and sets up some of the 
    //initial variables
	
    function init()
    {
        //get the canvas element
        canvas = $('#pongGame')[0];
        //get the context of that element
        ctx = canvas.getContext("2d");
        //set our width and height variables equal to the width
        //and height of the canvas element  
        WIDTH = canvas.width;
        HEIGHT = canvas.height;

        //set the starting height of the paddles to the center
        //of the y-axis
        playerPaddle = (HEIGHT / 2) - (paddleHeight / 2);
        compPaddle = (HEIGHT / 2) - (paddleHeight / 2);
		//alert(playerPaddle);
        //set the x and y values for where the ball will start
        //in this case the center of the canvas
        x = 400;
        y = 250;

        //once the game begins, the ball will move 6 pixels right every
        //time the game stage is redrawn. A minus number would send the
        //ball left
        if (lastWinner == "comp")
        {
            directionX = 6;
        }
        else
        {
            directionX = -4;
        }

        //once the game begins, the ball will move a random number of pixels
        //either up or down every time the game stage is redrawn
        directionY = Math.floor(Math.random() * 10) - 6;


        //this interval calls the drawGame function below every 100th of
        //a second (10ms).
        refreshStage = setInterval(drawGame, 10);
		
		
		
    }

    //This function draws the game stage

    function drawGame()
    {
        
		var weather = getWeather();
		var paddleColor = getPaddleColor(weather);
		//setBackground();
		//firstly wipe the old frame
        clearStage();
        //draw the sidelines
        drawSideLines();
        //draw the ball
        drawBall();
        //draw the player paddle, passing variables defined above
		
		$("#pongGame").mousemove(function(e){
		  var pageCoords = "( " + e.pageX + ", " + e.pageY + " )";		
		  
		  playerPaddle = e.pageY - 395;

		 
		});
		
		//check to see if the downPressed flag equals true 
        if (downPressed == true)
        {
            //make sure there is room for the paddle to move further down
            if (playerPaddle + paddleHeight + 20 <= HEIGHT)
            {
                //set the new position of the playerPaddle down 5 pixels
                playerPaddle += 5;
            }
        }
        //check to see if the upPressed flag equals true
        else if (upPressed == true)
        {
            //make sure there is room for the paddle to move further up
            if (playerPaddle - 20 >= 0)
            {
                //set the new position of the playerPaddle up 5 pixels
                playerPaddle -= 5;
            }
        }

        //call the compMoves function to move the compPaddle
        compMoves();

         drawPaddle(0, playerPaddle, paddleWidth, paddleHeight, paddleColor);
        //draw the comp paddle, passing variables defined above
        drawPaddle(WIDTH - 10, compPaddle, paddleWidth, paddleHeight, paddleColor);

        //if the x position of the ball added onto the amount we want to move
        //the ball on the x axis is greater than or equal to the width of the
        //canvas
        if (x + directionX >= WIDTH)
        {
            //if the ball hits the compPaddle
            if (y > compPaddle && y < compPaddle + paddleHeight)
            {
                //depending on where the ball hits the compPaddle, rebound at an angle
                directionY = 10 * ((y - (compPaddle + paddleHeight / 2)) / paddleHeight);
                //rebound the ball
                directionX = -directionX;
                //play sound
                paddleBeep.play();
            }
            else
            {
                //comp loses
                scoreBeep.play();
                //increase players score variable by one
                playerScore++;
                //update the scoreboard
                updateScore();

                //stop the current game from redrawing
                clearInterval(refreshStage);

                lastWinner = "player";
                //check if either player has won the overall game by getting
                //5 points or if a new game needs to be spawned
                checkScore();

            }
        }


        //if the x position of the ball added onto the amount we want to move
        //the ball on the x axis is less than or equal to 0
        else if (x + directionX <= 0)
        {
            //if the ball hits the playerPaddle
            if (y > playerPaddle && y < playerPaddle + paddleHeight)
            {
                //depending on where the ball hits the paddle, rebound at an angle
                directionY = 10 * ((y - (playerPaddle + paddleHeight / 2)) / paddleHeight);
                //rebound the ball
                directionX = -directionX;
                //play sound
                paddleBeep.play();
            }
            else
            {
                //player loses
                scoreBeep.play();
                //increase the computers score by one
                compScore++;
                //update the scoreboard
                updateScore();

                //stop the current game from redrawing
                clearInterval(refreshStage);

                lastWinner = "comp";
                //check if either player has won the overall game by getting
                //5 points or if a new game needs to be spawned
                checkScore();
            }
        }


        //if the ball hits the sides (roof or floor) of the stage
        if (y + directionY + ballRadius >= HEIGHT - 13 || y + directionY - ballRadius <= 13)
        {
            //rebound the ball
            directionY = -directionY;
            //play sound
            sideBeep.play();
        }


        x += directionX;
        y += directionY;
    }

	
			
    //This function draws the side lines on the stage (roof and floor)

    function drawSideLines()
    {
        ctx.beginPath();
        ctx.rect(0, 0, WIDTH, 15);
        ctx.closePath();
        ctx.fillStyle = "#254e7b";
        ctx.fill();

        ctx.beginPath();
        ctx.rect(0, HEIGHT - 15, WIDTH, 15);
        ctx.closePath();
        ctx.fillStyle = "#254e7b";
        ctx.fill();
		
    }

    //this function draws the ball

    function drawBall()
    {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = "#6DB33F";
        ctx.fill();
		
    }

    //this function draws a paddle

    function drawPaddle(xaxis, yaxis, pwidth, pheight, pcolour)
    {
        ctx.beginPath();
        ctx.rect(xaxis, yaxis, pwidth, pheight);
        ctx.closePath();
        ctx.fillStyle = pcolour;
        ctx.fill();
    }

    //set upPressed or downPressed if the up or down keys are pressed

    function onKeyDown(evt)
    {
        if (evt.keyCode == 38)
        {
            upPressed = true;
        }
        else if (evt.keyCode == 40)
        {
            downPressed = true;
        }
    }

    //unset upPressed or downPressed if the up or down keys are let go

    function onKeyUp(evt)
    {
        if (evt.keyCode == 38)
        {
            upPressed = false;
        }
        else if (evt.keyCode == 40)
        {
            downPressed = false;
        }
    }

    //This function clears the stage so it is blank

    function clearStage()
    {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
	
	function getWeather()
	{
		
		 $.simpleWeather({
			zipcode: '89141',
			unit: 'f',
			success: function(weather) {
				  html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
				  html += '<ul><li>'+weather.city+', '+weather.region+'</li>';
				  html += '<li class="currently">'+weather.currently+'</li>';
				  html += '<li>'+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+'</li></ul>';
				temp = weather.temp;
				conditionCode = weather.code;
				weatherBG = weather.image; 
			
				$("#weather").html(html);
			},
			error: function(error) {
				$("#weather").html("<p>"+error+"</p>");
			}
		});
		
		return temp;
	}
	
	function getPaddleColor(weather)
	{
		var paddleColor; 
		switch (Math.ceil(weather/10))
			{
			case 0:
			  paddleColor = "#002366";
			  break;
			case 1: // Temp is between 1-10
			  paddleColor = "#191970";
			  break;
			case 2: // Temp is between 11-20
			  paddleColor = "#00009C";
			  break;
			case 3: // Temp is between 21-30
			   paddleColor = "#00008B";
			  break;
			case 4: // Temp is between 31-40
			   paddleColor = "#120A8F";
			  break;
			case 5: // Temp is between 41-50
			   paddleColor = "#003399";
			  break;
			case 6:  // Temp is between 51-60
			   paddleColor = "#00b2ad";
			   break;
		    case 7:  // Temp is between 61-70
			   paddleColor = "#00e273";
			  break;
			case 8: // Temp is between 71-80
			   paddleColor = "#00de55";
			  break;
		    case 9: // Temp is between 81-90
			   paddleColor = "#ff9f00";
			  break;
			case 10: // Temp is between 91-100
			   paddleColor = "#ff2d00";
			  break;
			case 11: // Temp is between 101-110
			   paddleColor = "#ff0000";
			  break;
			}
			
		return paddleColor;	
		
	}

	
    //this function calculates the movement of the compPaddle

    function compMoves()
    {
        //randomly pick a number beteween 0 and 1
        var delayReaction = Math.random();

        //chance of delayed reaction
        if (delayReaction >= 0.45)
        {
            if (y > compPaddle + paddleHeight)
            {
                if (compPaddle + paddleHeight + 20 <= HEIGHT)
                {
                    compPaddle += 5;
					
                }
            }
            else if (y < compPaddle)
            {
                if (compPaddle - 20 >= 0)
                {
                    compPaddle -= 5;
                }
            }
            else
            {
                var centerPaddle = Math.random();

                //chance of ball hitting center of the paddle
                if (centerPaddle > 0.5)
                {
                    //if ball closer to left side of computer paddle
                    if (Math.abs(y - compPaddle) < Math.abs(y - compPaddle - paddleHeight))
                    {
                        if (compPaddle - 20 >= 0)
                        {
                            compPaddle -= 5;
                        }
                    }
                    else
                    {
                        if (compPaddle + paddleHeight + 20 <= HEIGHT)
                        {
                            compPaddle += 5;
                        }
                    }
                }
            }
        }
    }

    //this function updates the scoreboard

    function updateScore()
    {
        $('#playerScore').html(playerScore);
        $('#compScore').html(compScore);
    }

    //this function checks if either player has won the overall game by getting
    //5 points or if another game needs to be played.

    function checkScore()
    {
        //if both players scores are less than 5
        if (playerScore < 5 && compScore < 5)
        {
            //play another game after 3 second (3000ms) delay
            var wait = setTimeout(init, 3000);
            //show a message to the player stating the game is restarting
            ctx.fillStyle = "#fff";
            ctx.font = "38px 'Orbitron', sans-serif";
            if (lastWinner == "comp")
            {
                ctx.fillText("Computer +1", 275, 400);
            }
            else
            {
                ctx.fillText("You +1", 310, 400);
            }

        }
        //if the players score equals 5
        else if (playerScore == 5)
        {
            //show a message to the player stating they won
            ctx.fillStyle = "#EE3424";
            ctx.font = "48px 'Orbitron', sans-serif";
            ctx.fillText("You win!", 315, 400);
            //display button for playing a new overall game
            $('#replay').css('display', 'block');
            //play sound
            overBeep.play();

        }
        //if the computers score equals 5
        else if (compScore == 5)
        {
            //show a message to the player stating they lost
            ctx.fillStyle = "#EE8722";
            ctx.font = "48px 'Orbitron', sans-serif";
            ctx.fillText("You lose!", 305, 400);
            //display button for playing a new overall game
            $('#replay').css('display', 'block');
            //play sound
            overBeep.play();
        }
    }

    //call the init function		
    init();
});
//board
let board;
let boardWidth =  1600;
let boardHeight = 800;
let context;

//player
let playerWidth = 1600; //1600 for testing, 180 for normal
let playerHeight = 20;
let playerVelocityX = 100;

let player = {
    x: boardWidth/2 - playerWidth/2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
}

//parts of player
let playerCenter = {
    x: player.x + player.width / 2 - (player.width / 16),
    y: player.y,
    width: player.width / 8,
    height: playerHeight,
    velocityX: playerVelocityX
}
let playerInnerLeft = {
    x: playerCenter.x - player.width / 4,
    y: player.y,
    width: player.width / 4,
    height: playerHeight,
    velocityX: playerVelocityX
}
let playerOuterLeft = {
    x: player.x,
    y: player.y,
    width: 3 * player.width / 16,
    height: playerHeight,
    velocityX: playerVelocityX
}
let playerInnerRight = {
    x: playerCenter.x + player.width / 8,
    y: player.y,
    width: player.width / 4,
    height: playerHeight,
    velocityX: playerVelocityX
}
let playerOuterRight = {
    x: playerCenter.x + player.width / 8 + player.width / 4,
    y: player.y,
    width: 3 * player.width / 16,
    height: playerHeight,
    velocityX: playerVelocityX
}

//ball
let ballWidth = 15;
let ballHeight = 15;
let ballVelocityX = 15; //15 for testing, 3 normal
let ballVelocityY = 10; //10 for testing, 2 normal

let ball = {
    x: boardWidth/2,
    y: boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : ballVelocityX,
    velocityY: ballVelocityY

}

//blocks
let blockArray = [];
let blockWidth = 100;
let blockHeight = 30;
let blockColumns = 12;
let blockRows = 3; //add more as game goes on
let blockMaxRows = 10; //limit how many rows
let blockCount = 0;
let hitCount = 0;

//starting block corner top left
let blockX = 35;
let blockY = 45;

let score = 0;
let randomNumber = 0;
let gameOver = false;


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //draw initial player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);
    context.fillRect(playerCenter.x, playerCenter.y, playerCenter.width, playerCenter.height);
    context.fillRect(playerInnerLeft.x, playerInnerLeft.y, playerInnerLeft.width, playerInnerLeft.height);
    context.fillRect(playerOuterLeft.x, playerOuterLeft.y, playerOuterLeft.width, playerOuterLeft.height);
    context.fillRect(playerInnerRight.x, playerInnerRight.y, playerInnerRight.width, playerInnerRight.height);
    context.fillRect(playerOuterRight.x, playerOuterRight.y, playerOuterRight.width, playerOuterRight.height);


    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    //create blocks
    createBlocks();
}

function update() {
    requestAnimationFrame(update);
    if(gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);
    
    //player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);
    //parts of player
    context.fillStyle = "red";
    context.fillRect(playerCenter.x, playerCenter.y, playerCenter.width, playerCenter.height);
    context.fillStyle = "green";
    context.fillRect(playerInnerLeft.x, playerInnerLeft.y, playerInnerLeft.width, playerInnerLeft.height);
    context.fillRect(playerInnerRight.x, playerInnerRight.y, playerInnerRight.width, playerInnerRight.height);
    context.fillStyle = "blue";
    context.fillRect(playerOuterLeft.x, playerOuterLeft.y, playerOuterLeft.width, playerOuterLeft.height);
    context.fillRect(playerOuterRight.x, playerOuterRight.y, playerOuterRight.width, playerOuterRight.height);


    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height)


    //bounce ball off walls
    if (ball.y <= 0) { //if ball touches top of canvas
        if (changingDirection(ball)) { // check if ball.x changes direction
            randomAngle = Math.floor(Math.random() * 360) + 1; // Random 0-360 degrees
            ball.velocityX = Math.cos(randomAngle * Math.PI / 180); // Convert degree to radians for cosine
            ball.velocityY *= -1;
            randomNumber = ball.velocityX;
            !changingDirection(); //set it to false to bounce off top canvas normal then
        }
        else {  //if ball.x changed then bounce off normal
            ball.velocityY *= -1; //reverse direction
    }
    }
    else if (ball.x <= 0 || (ball.x + ball.width) >= boardWidth) {
        //if ball touches left or right of canvas
        ball.velocityX *= -1; //reverse direction
    }
    else if (ball.y + ball.height >= boardHeight) {
        //if ball touches bottom of canvas 
        //game over
        context.font = "25px sans-serif";
        context.fillText("Game Over: Press 'Space' to Restart", 600, 400);
        gameOver = true;
    }

    //bounce the ball off player paddle
    if(topCollision(ball, player) || bottomCollision(ball, player)) {
    if(topCollision(ball, playerCenter) || bottomCollision(ball, playerCenter)) {
        ball.velocityX = 0;
        ball.velocityY *= -1;
    }
    else if (topCollision(ball, playerInnerLeft) || bottomCollision(ball, playerInnerLeft)) {
           // Calculate the intersection point of the ball and the paddle
           let intersectionX = ball.x + ball.width / 2;
    
           // Calculate the distance from the intersection point to the paddle's center
           let distanceFromCenter = intersectionX - (player.x + player.width / 2);
           
           // Normalize the distance to the range [-1, 1]
           let normalizedDistance = distanceFromCenter / (player.width / 2);
       
           // Calculate the new velocities
           ball.velocityX = normalizedDistance * ballVelocityX;
           ball.velocityY = -Math.sqrt(ballVelocityX ** 2 - ball.velocityX ** 2);
    }
    else if (topCollision(ball, playerInnerRight) || bottomCollision(ball, playerInnerRight)) {
           // Calculate the intersection point of the ball and the paddle
           let intersectionX = ball.x + ball.width / 2;
    
           // Calculate the distance from the intersection point to the paddle's center
           let distanceFromCenter = intersectionX - (player.x + player.width / 2);
           
           // Normalize the distance to the range [-1, 1]
           let normalizedDistance = distanceFromCenter / (player.width / 2);
       
           // Calculate the new velocities
           ball.velocityX = normalizedDistance * ballVelocityX;
           ball.velocityY = -Math.sqrt(ballVelocityX ** 2 - ball.velocityX ** 2);

    }
    else if (topCollision(ball, playerOuterLeft) || bottomCollision(ball, playerOuterLeft)) {
        ball.velocityY *= -1;
    }
    else if (topCollision(ball, playerOuterRight) || bottomCollision(ball, playerOuterRight)) {
        ball.velocityY *= -1;    
    }
    else{
        ball.velocityY *= -1;
    }
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        if(leftCollision(ball, playerCenter) || rightCollision(ball, playerCenter)) {
            ball.velocityX *= -1;
            ball.velocityY = 0;
        }
        else if (leftCollision(ball, playerInnerLeft) || rightCollision(ball, playerInnerLeft)) {
           // Calculate the intersection point of the ball and the paddle
           let intersectionX = ball.x + ball.width / 2;
    
           // Calculate the distance from the intersection point to the paddle's center
           let distanceFromCenter = intersectionX - (player.x + player.width / 2);
           
           // Normalize the distance to the range [-1, 1]
           let normalizedDistance = distanceFromCenter / (player.width / 2);
       
           // Calculate the new velocities
           ball.velocityX = normalizedDistance * ballVelocityX;
           ball.velocityY = -Math.sqrt(ballVelocityX ** 2 - ball.velocityX ** 2);    
        }
        else if (leftCollision(ball, playerInnerRight) || rightCollision(ball, playerInnerRight)) {
           // Calculate the intersection point of the ball and the paddle
    let intersectionX = ball.x + ball.width / 2;
    
    // Calculate the distance from the intersection point to the paddle's center
    let distanceFromCenter = intersectionX - (player.x + player.width / 2);
    
    // Normalize the distance to the range [-1, 1]
    let normalizedDistance = distanceFromCenter / (player.width / 2);

    // Calculate the new velocities
    ball.velocityX = normalizedDistance * ballVelocityX;
    ball.velocityY = -Math.sqrt(ballVelocityX ** 2 - ball.velocityX ** 2);    
        }
        else if (leftCollision(ball, playerOuterLeft) || rightCollision(ball, playerOuterLeft)) {
            ball.velocityX *= -1;
        }
        else if (leftCollision(ball, playerOuterRight) || rightCollision(ball, playerOuterRight)) {
            ball.velocityX *= -1;
        }
    }

    //blocks
    context.fillStyle = "skyblue";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.hitCount--;
                ball.velocityY *= -1; //flip y direction up or down
                
                if (block.hitCount == 0) {
                    block.break = true;
                    blockCount -= 1;
                    score += 100;
                }
            }
            else if(leftCollision(ball, block) || rightCollision(ball, block)) {
                block.hitCount--;
                ball.velocityX *= -1;

                if (block.hitCount == 0) {
                    block.break = true;
                    blockCount -= 1;
                    score += 100;
                }
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    //next level
    if(blockCount == 0) {
        score += 100*blockRows*blockColumns; //bonus point
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }
    //score
    context.font = "20px sans-serif"
    context.fillText(score, 10, 25);

//hitcount
for (let i = 0; i < blockArray.length; i++) {
    let block = blockArray[i];
        if (!block.break) {
            context.fillStyle = "black";
            context.font = "20px Arial";
            context.fillText(block.hitCount, block.x + block.width / 2 - 10, block.y + block.height / 2 + 10);
    }
}

    //random
    context.font = "20px sans-serif"
    context.fillText(randomNumber, 1520, 25);
}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);

}

function movePlayer(e) {
    if(gameOver) {
        if (e.code == "Space") {
            resetGame();
        }
    }
    if (e.code == "ArrowLeft") {
        let nextPlayerX = player.x - player.velocityX;
        //parts of player
        let nextPlayerCenterX = playerCenter.x - playerCenter.velocityX;
        let nextPlayerInnerLeftX = playerInnerLeft.x - playerInnerLeft.velocityX;
        let nextPlayerOuterLeftX = playerOuterLeft.x - playerOuterLeft.velocityX;
        let nextPlayerInnerRightX = playerInnerRight.x - playerInnerRight.velocityX;
        let nextPlayerOuterRightX = playerOuterRight.x - playerOuterRight.velocityX;

        if(!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;

            //parts of player
            playerCenter.x = nextPlayerCenterX;
            playerInnerLeft.x =  nextPlayerInnerLeftX;
            playerOuterLeft.x = nextPlayerOuterLeftX;
            playerInnerRight.x = nextPlayerInnerRightX;
            playerOuterRight.x = nextPlayerOuterRightX;
        }

    }
    else if (e.code == "ArrowRight") {
        let nextPlayerX = player.x + player.velocityX;

        //parts of player
        let nextPlayerCenterX = playerCenter.x + playerCenter.velocityX;
        let nextPlayerInnerLeftX = playerInnerLeft.x + playerInnerLeft.velocityX;
        let nextPlayerOuterLeftX = playerOuterLeft.x + playerOuterLeft.velocityX;
        let nextPlayerInnerRightX = playerInnerRight.x + playerInnerRight.velocityX;
        let nextPlayerOuterRightX = playerOuterRight.x + playerOuterRight.velocityX;
        if(!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;

            //parts of player
            playerCenter.x = nextPlayerCenterX;
            playerInnerLeft.x =  nextPlayerInnerLeftX;
            playerOuterLeft.x = nextPlayerOuterLeftX;
            playerInnerRight.x = nextPlayerInnerRightX;
            playerOuterRight.x = nextPlayerOuterRightX;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
            a.x + a.width > b.x && //a's top right corner passes b's top left corner
            a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
            a.y + a.height > b.y; //a's bottom left corner passes b's top left corner
}

function topCollision(ball, block) { //a is above b (ball is above block)
    return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
}

function bottomCollision(ball, block) { //a is below b (ball is below block)
    return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftCollision(ball, block) { //a is left of b (ball is left of block)
    return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightCollision(ball, block) { //a is below b (ball is below block)
    return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
}

function createBlocks() {
    blockArray = []; //clear blockArray
    for (let c = 0; c < blockColumns; c++) {
        for (let r = blockRows; r > 0; r--) {
            let block = {
                hitCount: r, // start with the highest hitCount at the top row
                x : blockX + c*blockWidth + c*30, //c*10 space 10 pixels apart columns
                y: blockY + (blockRows - r)*blockHeight + (blockRows - r)*20, //r*10 space 10 pixels apart rows
                width : blockWidth,
                height : blockHeight,
                break : false,
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x: boardWidth/2 - playerWidth/2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    }
    //parts of player
 playerCenter = {
    x: player.x + player.width / 2 - (player.width / 16),
    y: player.y,
    width: player.width / 8,
    height: playerHeight,
    velocityX: playerVelocityX
}
 playerInnerLeft = {
    x: playerCenter.x - player.width / 4,
    y: player.y,
    width: player.width / 4,
    height: playerHeight,
    velocityX: playerVelocityX
}
 playerOuterLeft = {
    x: player.x,
    y: player.y,
    width: 3 * player.width / 16,
    height: playerHeight,
    velocityX: playerVelocityX
}
 playerInnerRight = {
    x: playerCenter.x + player.width / 8,
    y: player.y,
    width: player.width / 4,
    height: playerHeight,
    velocityX: playerVelocityX
}
 playerOuterRight = {
    x: playerCenter.x + player.width / 8 + player.width / 4,
    y: player.y,
    width: 3 * player.width / 16,
    height: playerHeight,
    velocityX: playerVelocityX
}
    
    ball = {
        x: boardWidth/2,
        y: boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : ballVelocityX,
        velocityY: ballVelocityY
    
    }
    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
}

// check if ball.x changes
function changingDirection(ball) {
    // Get ball's X position before and after
    ballX1 = ball.x;
    ballX2 = ballX1 + ball.velocityX;

    // Check if ball.x is change
    //if ball.x didn't change return true;
    return ballX1 == ballX2;
}
//board
let board;
let boardWidth =  1600;
let boardHeight = 800;
let context;

//player
let playerWidth = 180; //500 for testing, 80 for normal
let playerHeight = 20;
let playerVelocityX = 100;

let player = {
    x: boardWidth/2 - playerWidth/2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
}

//ball
let ballWidth = 15;
let ballHeight = 15;
let ballVelocityX = 3; //15 for testing, 3 normal
let ballVelocityY = 2; //10 for testing, 2 normal

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

//starting block corner top left
let blockX = 35;
let blockY = 45;

let score = 0;
let gameOver = false;


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //draw initial player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

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

    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ball.width, ball.height)

    //bounce ball off walls
    if (ball.y <= 0) {
        //if ball touches top of canvas
        ball.velocityY *= -1;
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
        ball.velocityY *= -1; //flip y direction up or down
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        ball.velocityX *= -1;
    }

    //blocks
    context.fillStyle = "skyblue";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.break =  true;
                ball.velocityY *= -1; //flip y direction up or down
                blockCount -= 1;
                score +=100;
            }
            else if(leftCollision(ball, block) || rightCollision(ball, block)) {
                block.break = true;
                ball.velocityX *= -2;
                blockCount -= 1;
                score +=100;

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
        if(!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }

    }
    else if (e.code == "ArrowRight") {
        let nextPlayerX = player.x + player.velocityX;
        if(!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
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
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x : blockX + c*blockWidth + c*30, //c*10 space 10 pixels apart columns
                y: blockY + r*blockHeight + r*20, //r*10 space 10 pixels apart rows
                width : blockWidth,
                height : blockHeight,
                break : false
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
//21130596_NguyenThanhTu_0987823027_DH21DTD
//board
let board;
let boardWidth = 1600;
let boardHeight = 800;
let context;
let gameStarted = false;

//player
let playerWidth = 1600; //1600 for testing, 180 for normal
let playerHeight = 20;
let playerVelocityX = 100;

let player = {
    x: boardWidth / 2 - playerWidth / 2,
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
let lastCollision = [null, null];

let ball = {
    x: player.x + (player.width / 2) - (ballWidth / 2), // Đặt x ở đây
    y: player.y - ballHeight - 1, // Đặt y ở đây
    width: ballWidth,
    height: ballHeight,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY
}

//blocks
let blockArray = [];
let blockWidth = 100;
let blockHeight = 30;
let blockColumns = 12;
let blockRows = null; //add more as game goes on
let blockMaxRows = 8; //limit how many rows
let blockCount = 0;
let hitCount = 0;

//starting block corner top left
let blockX = 35;
let blockY = 45;

let score = 0;
let randomNumber = 0;
let gameOver = false;
let level = null;
let choseLevel = false;

window.onload = function () {
    home = document.getElementById("home");
    home.width = 1600;
    home.height = 800;
    homeContext = home.getContext("2d");


    // Vẽ button "Play"
    drawButton(homeContext, "Play", 700, 200, 200, 50);

    // Vẽ button "About"
    drawButton(homeContext, "About", 700, 300, 200, 50);

    // Vẽ button "Choose level"
    drawButton(homeContext, "Choose level", 700, 400, 200, 50);


    home.addEventListener("click", function (event) {
        let x = event.clientX - home.offsetLeft;
        let y = event.clientY - home.offsetTop;

        // Kiểm tra xem có bấm vào button "Play" không
        if (x > 700 && x < 900 && y > 200 && y < 250) {
            if(!choseLevel) {
                setLevel(level);
            }

            // Ẩn canvas "home"
            home.style.display = "none";

            board = document.getElementById("board");
            board.style.display = "block"; // Thiết lập display thành "block"

            // Thiết lập chiều cao và chiều rộng cho canvas "board"
            board.width = boardWidth;
            board.height = boardHeight;

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
            document.addEventListener("keydown", handleKeyPress);

            //create blocks
            createBlocks();
        }

        // Kiểm tra xem có bấm vào button "Choose level" không
        if (x > 700 && x < 900 && y > 400 && y < 450) {
            let selectedLevel = prompt("Choose level (1-6):");
            if (selectedLevel >= 1 && selectedLevel <= 6) {
                setLevel(selectedLevel);
            } else {
                alert("Please enter a valid level between 1 and 6.");
            }
        }

    });
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
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
    context.fillRect(ball.x, ball.y, ball.width, ball.height)

    if (gameStarted) {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
    }

    //bounce ball off walls
    if (ball.y <= 0) { //if ball touches top of canvas
        lastCollision[1] = lastCollision[0]; // lastCollision becomes the old lastCollision
        lastCollision[0] = {// check if ball.x exceed the board
            x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth
            y: 0,
            velocityX: ball.velocityX,
            velocityY: ball.velocityY
        };
        lastCollision = [lastCollision[0], lastCollision[1]];

        if (lastCollision[0].x == lastCollision[1].x) {
            // Generate a random angle for changing the horizontal direction
            lastCollision[1] = lastCollision[0]; // lastCollision becomes the old lastCollision

            if (lastCollision[0].x == 0 || lastCollision[0].x == boardWidth - ball.width) {
                lastCollision[1] = lastCollision[0]; // lastCollision becomes the old lastCollision
                ball.velocityX = (lastCollision[0].x == 0 || lastCollision[0].x == boardWidth - ball.width)
                    ? Math.abs(Math.cos(randomAngle * Math.PI / 180)) : -Math.abs(Math.cos(randomAngle * Math.PI / 180));
                ball.velocityY *= -1; // reverse vertical direction
                lastCollision[0] = {// check if ball.x exceed the board
                    x: ball.x, //set ball.x = 0 || boardWidth
                    y: 0,
                    velocityX: ball.velocityX,
                    velocityY: ball.velocityY
                };
                lastCollision = [lastCollision[0], lastCollision[1]];

            }
            else {
                let randomAngle = Math.floor(Math.random() * 360) + 1; // Random 0-360 degrees
                ball.velocityX = Math.cos(randomAngle * Math.PI / 180); // Convert degree to radians for cosine

                ball.velocityY *= -1; // reverse vertical direction
                lastCollision = [lastCollision[0], lastCollision[1]];

                randomNumber = ball.velocityX;
            }

        } else {
            ball.velocityY *= -1; //turn to Oy        
        }
    }
    else if (ball.x <= 0 || (ball.x + ball.width) >= boardWidth) { //ball touches side of canvas
        lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
        lastCollision[0] = {
            x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || board - ball width
            y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
            velocityX: ball.velocityX,
            velocityY: ball.velocityY
        };
        lastCollision = [lastCollision[0], lastCollision[1]];

        if (lastCollision[0].y == 0 || lastCollision[0].y == boardHeight - ball.height) {

            // Xác định hướng va chạm
            if (lastCollision[0].x > lastCollision[1].x) {
                ball.velocityX = -Math.abs(ball.velocityX); // left to right, make it turn to right
            } else {
                ball.velocityX = Math.abs(ball.velocityX); // right to left, make it turn to left
            }
            ball.velocityY *= -1; //turn to Oy        
        }
        else {
            ball.velocityX *= -1; //reverse direction
        }
    }
    else if (ball.y + ball.height >= boardHeight) {
        //if ball touches bottom of canvas 
        //game over
        context.font = "25px sans-serif";
        context.fillText("Game Over: Press 'Arrow Down' to Restart", 560, 400);
        gameOver = true;
    }

    //bounce the ball off player paddle
    if (topCollision(ball, player) || bottomCollision(ball, player)) {
        if (topCollision(ball, playerCenter) || bottomCollision(ball, playerCenter)) {
            lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
            lastCollision[0] = {
                x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth - ball width
                y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
                velocityX: ball.velocityX,
                velocityY: ball.velocityY
            };
            lastCollision = [lastCollision[0], lastCollision[1]];
            ball.velocityX = 0;
            ball.velocityY *= -1;
        }
        else if (topCollision(ball, playerInnerLeft) || bottomCollision(ball, playerInnerLeft)) {
            lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
            lastCollision[0] = {
                x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth - ball width
                y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
                velocityX: ball.velocityX,
                velocityY: ball.velocityY
            };
            lastCollision = [lastCollision[0], lastCollision[1]];
            // Handle collision for playerInnerLeft
            let alpha = Math.atan(lastCollision[1].velocityX / lastCollision[1].velocityY); // Angle alpha
            let beta = 90 - alpha; // Angle beta
            lastCollision[0].velocityY = lastCollision[1].velocityY; // Update velocityY for lastCollision[1]
            lastCollision[0].velocityX = Math.tan(beta) * lastCollision[1].velocityY; // Calculate new velocityX for lastCollision[1]
            ball.velocityX = Math.abs(lastCollision[0].velocityX); // Assign new velocityX to the ball
            ball.velocityY = -Math.abs(lastCollision[0].velocityY); // Reverse direction of ball
        }
        else if (topCollision(ball, playerInnerRight) || bottomCollision(ball, playerInnerRight)) {
            lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
            lastCollision[0] = {
                x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth - ball width
                y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
                velocityX: ball.velocityX,
                velocityY: ball.velocityY
            };
            lastCollision = [lastCollision[0], lastCollision[1]];
            // Handle collision for playerInnerRight
            let alpha = Math.atan(lastCollision[1].velocityX / lastCollision[1].velocityY); // Angle alpha
            let beta = 90 - alpha; // Angle beta
            lastCollision[0].velocityY = lastCollision[1].velocityY; // Update velocityY for lastCollision[1]
            lastCollision[0].velocityX = Math.tan(beta) * lastCollision[0].velocityY; // Calculate new velocityX for lastCollision[1]
            ball.velocityX = Math.abs(lastCollision[0].velocityX); // Assign new velocityX to the ball
            ball.velocityY = -Math.abs(lastCollision[0].velocityY); // Reverse direction of ball

        }
        else if (topCollision(ball, playerOuterLeft) || bottomCollision(ball, playerOuterLeft)) {
            lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
            lastCollision[0] = {
                x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth - ball width
                y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
                velocityX: ball.velocityX,
                velocityY: ball.velocityY
            };
            lastCollision = [lastCollision[0], lastCollision[1]];

            // Xác định hướng va chạm
            if (lastCollision[0].x > lastCollision[1].x) {
                ball.velocityX = -Math.abs(ball.velocityX); // left to right, make it turn to right
            } else {
                ball.velocityX = Math.abs(ball.velocityX); // right to left, make it turn to left
            }
            ball.velocityY *= -1; //turn to Oy
        }

        else if (topCollision(ball, playerOuterRight) || bottomCollision(ball, playerOuterRight)) {
            lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
            lastCollision[0] = {
                x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth - ball width
                y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
                velocityX: ball.velocityX,
                velocityY: ball.velocityY
            };
            lastCollision = [lastCollision[0], lastCollision[1]];

            // Xác định hướng va chạm
            if (lastCollision[0].x > lastCollision[1].x) {
                ball.velocityX = -Math.abs(ball.velocityX); // left to right, make it turn to right
            } else {
                ball.velocityX = Math.abs(ball.velocityX); // right to left, make it turn to left
            }
            ball.velocityY *= -1; //turn to Oy
        }
    }
    else if (leftCollision(ball, player) || rightCollision(ball, player)) {
        if (leftCollision(ball, playerOuterLeft) || rightCollision(ball, playerOuterLeft)) {
            lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
            lastCollision[0] = {
                x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth - ball width
                y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
                velocityX: ball.velocityX,
                velocityY: ball.velocityY
            };
            lastCollision = [lastCollision[0], lastCollision[1]];

            // Xác định hướng va chạm
            if (lastCollision[0].x > lastCollision[1].x) {
                ball.velocityY = -Math.abs(ball.velocityY); // left to right, make it turn to right
            } else {
                ball.velocityY = Math.abs(ball.velocityY); // right to left, make it turn to left
            }
            ball.velocityX *= -1; //turn to Ox
        }
        else if (leftCollision(ball, playerOuterRight) || rightCollision(ball, playerOuterRight)) {
            lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
            lastCollision[0] = {
                x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth - ball width
                y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
                velocityX: ball.velocityX,
                velocityY: ball.velocityY
            };
            lastCollision = [lastCollision[0], lastCollision[1]];

            // Xác định hướng va chạm
            if (lastCollision[0].x > lastCollision[1].x) {
                ball.velocityY = -Math.abs(ball.velocityY); // left to right, make it turn to right
            } else {
                ball.velocityY = Math.abs(ball.velocityY); // right to left, make it turn to left
            }
            ball.velocityX *= -1; //turn to Ox
        }
    }

    //blocks
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        context.fillStyle = "gray";

        if (!block.break) {
            if (topCollision(ball, block) || bottomCollision(ball, block)) {
                block.hitCount--;
                ball.velocityY *= -1; //flip y direction up or down
                lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
                lastCollision[0] = {
                    x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth - ball width
                    y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
                    velocityX: ball.velocityX,
                    velocityY: ball.velocityY
                };
                lastCollision = [lastCollision[0], lastCollision[1]];

                if (block.hitCount == 0) {
                    block.break = true;
                    blockCount -= 1;
                    score = score + 10 * block.scoring;
                }
            }
            else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                block.hitCount--;
                ball.velocityX *= -1;
                lastCollision[1] = lastCollision[0]; // lastCollision become old lastCollision
                lastCollision[0] = {
                    x: (ball.x <= 0) ? 0 : (ball.x + ball.width >= boardWidth) ? boardWidth - ball.width : ball.x, //set ball.x = 0 || boardWidth - ball width
                    y: (ball.y <= 0) ? 0 : (ball.y + ball.height >= boardHeight) ? boardHeight - ball.height : ball.y, //set ball.y = 0 || board - ball height
                    velocityX: ball.velocityX,
                    velocityY: ball.velocityY
                };
                lastCollision = [lastCollision[0], lastCollision[1]];

                if (block.hitCount == 0) {
                    block.break = true;
                    blockCount -= 1;
                    score = score + 10 * block.scoring;
                }
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }
    //next level
    if (blockCount == 0) {
        score += 100 * blockRows * blockColumns; //bonus point
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }
    //score
    context.font = "20px sans-serif"
    context.fillText(score, 10, 25);


    //hitcount
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        context.fillStyle = "black";
        context.font = "20px Arial";
        context.fillText(block.hitCount, block.x + block.width / 2 - 10, block.y + block.height / 2 + 10);
    }

    if (!gameStarted) {
        context.fillStyle = "red";
        context.font = "25px sans-serif";
        context.fillText("Move around and press 'Arrow Up' to release the ball", 500, 400);
        return;
    }

    //lastCollision
    context.fillStyle = "red";
    context.font = "20px sans-serif"
    context.fillText(level, 400, 25);

    //random
    // context.font = "20px sans-serif"
    // context.fillText(randomNumber, 1520, 25);

}

function outOfBounds(xPosition) {
    return (xPosition < 0 || xPosition + playerWidth > boardWidth);

}

function movePlayer(e) {

    if (!gameStarted) { //ball hasn't been released, game have not started yet
        if (e.code == "ArrowLeft" || e.code == "ArrowRight") {
            let nextPlayerX = e.code == "ArrowLeft" ? player.x - player.velocityX : player.x + player.velocityX;
            let nextBallX = nextPlayerX + (player.width / 2) - (ball.width / 2);
            //parts of player
            let nextPlayerCenterX = nextPlayerX + player.width / 2 - (player.width / 16);
            let nextPlayerInnerLeftX = nextPlayerCenterX - player.width / 4;
            let nextPlayerOuterLeftX = nextPlayerX;
            let nextPlayerInnerRightX = nextPlayerCenterX + player.width / 8;
            let nextPlayerOuterRightX = nextPlayerCenterX + player.width / 8 + player.width / 4;

            if (!outOfBounds(nextPlayerX)) {
                player.x = nextPlayerX;
                ball.x = nextBallX;

                //parts of player
                playerCenter.x = nextPlayerCenterX;
                playerInnerLeft.x = nextPlayerInnerLeftX;
                playerOuterLeft.x = nextPlayerOuterLeftX;
                playerInnerRight.x = nextPlayerInnerRightX;
                playerOuterRight.x = nextPlayerOuterRightX;
            }
        }
    } else { //game started
        if (e.code == "ArrowLeft" || e.code == "ArrowRight") {
            let nextPlayerX = e.code == "ArrowLeft" ? player.x - player.velocityX : player.x + player.velocityX;
            //parts of player
            let nextPlayerCenterX = nextPlayerX + player.width / 2 - (player.width / 16);
            let nextPlayerInnerLeftX = nextPlayerCenterX - player.width / 4;
            let nextPlayerOuterLeftX = nextPlayerX;
            let nextPlayerInnerRightX = nextPlayerCenterX + player.width / 8;
            let nextPlayerOuterRightX = nextPlayerCenterX + player.width / 8 + player.width / 4;
            if (!outOfBounds(nextPlayerX)) {
                player.x = nextPlayerX;
                //parts of player
                playerCenter.x = nextPlayerCenterX;
                playerInnerLeft.x = nextPlayerInnerLeftX;
                playerOuterLeft.x = nextPlayerOuterLeftX;
                playerInnerRight.x = nextPlayerInnerRightX;
                playerOuterRight.x = nextPlayerOuterRightX;

            }
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
                scoring: r,
                x: blockX + c * blockWidth + c * 30, //c*10 space 10 pixels apart columns
                y: blockY + (blockRows - r) * blockHeight + (blockRows - r) * 20, //r*10 space 10 pixels apart rows
                width: blockWidth,
                height: blockHeight,
                break: false,
            }
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameStarted = false;
    gameOver = false;
    player = {
        x: boardWidth / 2 - playerWidth / 2,
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
        x: player.x + (player.width / 2) - (ball.width / 2),
        y: player.y - ball.height - 1,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY

    }
    blockArray = [];
    score = 0;
    createBlocks();
    lastCollision = [null, null];
}

function handleKeyPress(e) {
    if (!gameStarted) { //Game hasn't start yet
        movePlayer(e);
    } else { //Game started
        if (e.code == "ArrowLeft" || e.code == "ArrowRight") {
            movePlayer(e);
        }
    }

    if (e.code == "ArrowUp" && !gameStarted) {
        startGame();
    }

    if (e.code == "ArrowDown" && gameOver) {
        resetGame();
    }
}

function startGame() {
    gameStarted = true; // start game

    // Ball initial postion
    ball.x = player.x + (player.width / 2) - (ball.width / 2);
    ball.y = player.y - ball.height - 1;

    // Ball initial velocity // direction

    randomVelocityX = Math.floor(Math.random() * 360) + 1; // Random 0-360 degrees
    ball.velocityX = Math.cos(randomVelocityX * Math.PI / 180); // Convert degree to radians for cosine
    ball.velocityY *= -1;

    // Ball direction
    ball.velocityY = -Math.abs(ball.velocityY); // Ball up

    //lastCollision
    lastCollision[0] = { X: ball.x, y: ball.y, velocityX: ball.velocityX, velocityY: ball.velocityY }; //set it to ball released position to bounce top canva
    lastCollision = [{ x: ball.x, y: ball.y, velocityX: ball.velocityX, velocityY: ball.velocityY }, null];

}
// Hàm vẽ button
function drawButton(ctx, text, x, y, width, height) {
    ctx.fillStyle = "blue"; // Màu nền của button
    ctx.fillRect(x, y, width, height); // Vẽ hình chữ nhật

    ctx.font = "20px Arial"; // Font chữ và kích thước
    ctx.fillStyle = "white"; // Màu chữ
    ctx.textAlign = "center"; // Căn giữa theo chiều ngang
    ctx.textBaseline = "middle"; // Căn giữa theo chiều dọc
    ctx.fillText(text, x + width / 2, y + height / 2); // Hiển thị text ở giữa button
}
function setLevel(lvl) {
    level = lvl;
    if(level == null){
        level = 1; // Mặc định mức độ chơi là 1
        choseLevel = true;
    }
    switch (level) {
        case "1":
            blockRows = 2;
            choseLevel = true;

            break;
        case "2":
            blockRows = 3;
            choseLevel = true;

            break;
        case "3":
            blockRows = 4;
            choseLevel = true;

            break;
        case "4":
            blockRows = 6;
            choseLevel = true;

            break;
        case "5":
            blockRows = 8;
            choseLevel = true;

            break;
        case "6":
            blockRows = 10;
            choseLevel = true;
            break;
        default:
            blockRows = 3; // Mặc định mức độ chơi là 1
            choseLevel = true;
            break;
    
}}
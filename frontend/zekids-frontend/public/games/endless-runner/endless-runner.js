var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = document.body.clientWidth,
    height = document.body.clientHeight,
    gameHeight = 200, // height of the area that the player can navigate
    requestID,
    player = {
        x: Math.round(width / 3),
        y: gameHeight - 15,
        width: 5,
        height: 5,
        speed: 2,
        velX: 0,
        velY: 0,
        jumping: false,
        grounded: false
    },
    keys = [],
    friction = 0.8,
    gravity = 0.2,
    verticalSpeed = 1, // speed of the vertical scroll of the game
    score = 0,
    bestScore = 0,
    touches = [],
    touchButtonSize = 70,
    touchButtonMargin = 20,
    upButton = {
        x: touchButtonMargin,
        y: height - touchButtonMargin - touchButtonSize,
        width: touchButtonSize,
        height: touchButtonSize
    },
    leftButton = {
        x: width - 2 * touchButtonMargin - 2 * touchButtonSize,
        y: height - touchButtonMargin - touchButtonSize,
        width: touchButtonSize,
        height: touchButtonSize
    },
    rightButton = {
        x: width - touchButtonMargin - touchButtonSize,
        y: height - touchButtonMargin - touchButtonSize,
        width: touchButtonSize,
        height: touchButtonSize
    },
    touchButtonTimeout = 0, // remaining animation frame count to hide the touch buttons
    drawCount = 1; // animation frame count. used to change verticalSpeed dynamically

var boxes = [];

boxes.push({
    x: 0,
    y: gameHeight - 4,
    width: width + 20,
    height: 4
});

// Set display size (css pixels).
canvas.style.width = width + "px";
canvas.style.height = height + "px";

// Set actual size in memory (scaled to account for extra pixel density).
var scale = window.devicePixelRatio;
canvas.width = width * scale;
canvas.height = height * scale;

// Normalize coordinate system to use css pixels.
ctx.scale(scale, scale);

requestID = requestAnimationFrame(mainMenuDraw);

function update() {
    // check keys
    if (keys[38] || keys[32] || keys[87]) {
        // up arrow or space or w
        jumpAction();
    }
    if (keys[39] || keys[68]) {
        // right arrow or d
        goRightAction();
    }
    if (keys[37] || keys[65]) {
        // left arrow or a
        goLeftAction();
    }

    //check touches
    for (var i = 0; i < touches.length; i++) {
        if (buttonTouched(upButton, touches[i])) {
            jumpAction();
        } else if (buttonTouched(leftButton, touches[i])) {
            goLeftAction();
        } else if (buttonTouched(rightButton, touches[i])) {
            goRightAction();
        }
    }

    if (touchButtonTimeout > 0) {
        touchButtonTimeout--;
    }

    for (var i = 0; i < boxes.length; i++) {
        boxes[i].x -= verticalSpeed;
        score += verticalSpeed;
    }

    if (verticalSpeed < 9) {
        verticalSpeed = (drawCount / 2000) * (2 - (drawCount / 2000)) * 8 + 1;
    }
    drawCount++;

    // adds new boxes to the screen
    if (boxes[boxes.length - 1].x + boxes[boxes.length - 1].width < width) {
        boxHeight = 4 + randFromToStep(0, 10, 2);
        boxes.push({
            x: boxes[boxes.length - 1].x + boxes[boxes.length - 1].width + randFromToStep(8, 68, 10),
            y: gameHeight - boxHeight,
            width: randFromToStep(100, 300, 40),
            height: boxHeight
        });
    }

    // deletes the boxes that go out of screen
    if (boxes[0].x + boxes[0].width < 0) {
        boxes = boxes.slice(1);
    }


    player.velX *= friction;
    player.velY += gravity;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.beginPath();

    player.grounded = false;
    for (var i = 0; i < boxes.length; i++) {
        ctx.rect(Math.round(boxes[i].x), boxes[i].y, boxes[i].width, boxes[i].height);

        var dir = colCheck(player, boxes[i]);

        if (dir === "l" || dir === "r") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        } else if (dir === "t") {
            player.velY *= -1;
        }

    }

    if (player.grounded) {
        player.velY = 0;
    }

    player.x += player.velX;
    player.y += player.velY;

    ctx.fill();
    ctx.save();
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.restore();

    ctx.save();
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.fillText("Score: " + Math.round(score / 100), width / 2, 20);
    ctx.fillText("Best: " + bestScore, width / 2, 40);
    //ctx.fillText(verticalSpeed, 10, 70);
    ctx.restore();

    if (touchButtonTimeout > 0) {
        ctx.fillStyle = "blue";
        ctx.fillRect(upButton.x, upButton.y, upButton.width, upButton.height);
        ctx.fillRect(leftButton.x, leftButton.y, leftButton.width, leftButton.height);
        ctx.fillRect(rightButton.x, rightButton.y, rightButton.width, rightButton.height);
        ctx.fillStyle = "white";
        drawTriangle(upButton.x + upButton.width / 2, upButton.y + upButton.height / 2, 0, 15);
        drawTriangle(leftButton.x + leftButton.width / 2, leftButton.y + leftButton.height / 2, -Math.PI / 2, 15);
        drawTriangle(rightButton.x + rightButton.width / 2, rightButton.y + rightButton.height / 2, Math.PI / 2, 15);
        ctx.fillStyle = "black";
    }

    if ((player.y > gameHeight + 20) || (player.x + player.width < 0) || (player.x > width)) {
        bestScore = Math.max(bestScore, Math.round(score / 100));
        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.textAlign = "center";
        ctx.font = "18px sans-serif";
        ctx.fillText("Game Over", width / 2, 60);
        ctx.font = "14px sans-serif";
        ctx.fillText("Score: " + Math.round(score / 100), width / 2, 90);
        ctx.fillText("Best: " + bestScore, width / 2, 110);
        ctx.fillText("Press Space or touch the screen to restart", width / 2, 140);
        ctx.restore();
        window.setTimeout(requestAnimationFrame, 700, gameoverLoop);
    } else {
        requestID = requestAnimationFrame(update);
    }
}

/**
 * Draws a equilateral triangle on canvas.
 * @param {*} x x of center of the triangle
 * @param {*} y y of center of the triangle
 * @param {*} angle The angle to rotate clockwise in radians.
 * @param {*} radius The radius of the circle passing over the corners of the triange.
 */
function drawTriangle(x, y, angle, radius) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius * 0.866, radius / 2);
    ctx.lineTo(-radius * 0.866, radius / 2);
    ctx.fill();
    ctx.restore();
}

function mainMenuDraw() {
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "48px serif";
    ctx.fillText("Endless Runner", width / 2, height / 2);
    ctx.font = "12px sans-serif";
    ctx.fillText("Press Space or touch the screen to start", width / 2, height / 2 + 30);
    ctx.fillText("Controls:", width / 2, height / 2 + 50);
    ctx.fillText("Use W, A, D or arrows or space", width / 2, height / 2 + 70);
    ctx.fillText("to jump, go left and go right", width / 2, height / 2 + 90);
    ctx.restore();
    requestID = requestAnimationFrame(mainMenuLoop);
}

function mainMenuLoop() {
    if (keys[32] || touches.length > 0) {
        // space or screen touched
        requestID = requestAnimationFrame(update);
    } else {
        requestID = requestAnimationFrame(mainMenuLoop);
    }
}

function buttonTouched(button, touch) {
    return (touch.pageX >= button.x && touch.pageX <= (button.x + button.width) &&
        touch.pageY >= button.y && touch.pageY <= (button.y + button.height));
}

function jumpAction() {
    if (!player.jumping && player.grounded) {
        player.jumping = true;
        player.grounded = false;
        player.velY = -player.speed * 3.5;
    }
}

function goLeftAction() {
    if (player.velX > -player.speed) {
        player.velX--;
    }
}

function goRightAction() {
    if (player.velX < player.speed) {
        player.velX++;
    }
}

function gameoverLoop() {
    if (keys[32] || touches.length > 0) {
        // space key or screen is touched
        resetGameState();

        requestID = requestAnimationFrame(update);
    } else {
        requestID = requestAnimationFrame(gameoverLoop);
    }
}

function resetGameState() {
    player = {
        x: Math.round(width / 3),
        y: gameHeight - 15,
        width: 5,
        height: 5,
        speed: 2,
        velX: 0,
        velY: 0,
        jumping: false,
        grounded: false
    };
    verticalSpeed = 1;
    drawCount = 1;
    score = 0;

    boxes = [];

    boxes.push({
        x: 0,
        y: gameHeight - 4,
        width: width + 20,
        height: 4
    });
}

function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;

    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
}

function randFromToStep(from, to, step) {
    return Math.floor(Math.random() * (((to - from) / step) + 1)) * step + from;
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

/*window.addEventListener("load", function () {
    requestAnimationFrame(update);
});*/

window.addEventListener('touchstart', function (e) {
    touchButtonTimeout = 60 * 5;
    var changedTouches = e.changedTouches;
    for (var i = 0; i < changedTouches.length; i++) {
        touches.push({
            id: changedTouches[i].identifier,
            pageX: changedTouches[i].pageX,
            pageY: changedTouches[i].pageY
        });
    }
});

// Finds the array index of a touch in the touches array.
var findCurrentTouchIndex = function (id) {
    for (var i = 0; i < touches.length; i++) {
        if (touches[i].id === id) {
            return i;
        }
    }

    // Touch not found! Return -1.
    return -1;
};

window.addEventListener('touchend', function (e) {
    var changedTouches = e.changedTouches;
    for (var i = 0; i < changedTouches.length; i++) {
        var touch = changedTouches[i];
        var currentTouchIndex = findCurrentTouchIndex(touch.identifier);

        if (currentTouchIndex >= 0) {
            // Remove the record.
            touches.splice(currentTouchIndex, 1);
        } else {
            console.log('Touch was not found!');
        }
    }
});

function resized() {
    /*
    width = document.body.clientWidth;
    height = document.body.clientHeight;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    canvas.width = width * scale;
    canvas.height = height * scale;

    window.cancelAnimationFrame(requestID);
    resetGameState();
    requestID = requestAnimationFrame(mainMenuDraw);*/
    alert("Reload the page to correct game screen size");
}

//window.addEventListener("orientationchange", resized);
window.addEventListener("resize", resized);
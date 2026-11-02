const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
const scoreText = document.getElementById("score");
const bestScoreText = document.getElementById("best-score");
const livesText = document.getElementById("lives");
const messageScreen = document.getElementById("message-screen");
const messageTitle = document.getElementById("message-title");
const messageText = document.getElementById("message-text");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");
const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");

let playerPosition = 50;
let score = 0;
let lives = 3;
let bestScore = Number(localStorage.getItem("spaceDodgerBest")) || 0;
let asteroids = [];
let gameRunning = false;
let gamePaused = false;
let spawnTimer;
let gameLoop;
let keys = { left: false, right: false };

bestScoreText.textContent = bestScore;

function movePlayer() {
    if (keys.left) playerPosition -= 1.1;
    if (keys.right) playerPosition += 1.1;

    playerPosition = Math.max(5, Math.min(95, playerPosition));
    player.style.left = playerPosition + "%";
}

function makeAsteroid() {
    const asteroid = document.createElement("div");
    asteroid.className = "asteroid";
    asteroid.textContent = Math.random() > 0.5 ? "☄️" : "🪨";

    const asteroidData = {
        element: asteroid,
        x: Math.random() * 90 + 5,
        y: -40,
        speed: 2 + Math.random() * 1.8 + score / 250
    };

    asteroid.style.left = asteroidData.x + "%";
    gameArea.appendChild(asteroid);
    asteroids.push(asteroidData);
}

function updateAsteroids() {
    const areaHeight = gameArea.clientHeight;
    const playerY = areaHeight - 48;

    asteroids.forEach((asteroid) => {
        asteroid.y += asteroid.speed;
        asteroid.element.style.top = asteroid.y + "px";

        const closeToPlayer = asteroid.y > playerY - 18 && asteroid.y < playerY + 25;
        const closeSideways = Math.abs(asteroid.x - playerPosition) < 7;

        if (closeToPlayer && closeSideways && !asteroid.hit) {
            asteroid.hit = true;
            asteroid.element.remove();
            lives--;
            updateScoreBoard();

            if (lives <= 0) {
                endGame();
            }
        }

        if (asteroid.y > areaHeight + 40 && !asteroid.hit) {
            asteroid.hit = true;
            asteroid.element.remove();
            score += 5;
            updateScoreBoard();
        }
    });

    asteroids = asteroids.filter((asteroid) => !asteroid.hit);
}

function updateScoreBoard() {
    scoreText.textContent = score;
    livesText.textContent = "♥ ".repeat(lives).trim();

    if (score > bestScore) {
        bestScore = score;
        bestScoreText.textContent = bestScore;
        localStorage.setItem("spaceDodgerBest", bestScore);
    }
}

function startGame() {
    clearInterval(spawnTimer);
    clearInterval(gameLoop);
    clearAsteroids();

    score = 0;
    lives = 3;
    playerPosition = 50;
    gameRunning = true;
    gamePaused = false;
    player.style.left = "50%";
    messageScreen.style.display = "none";
    pauseButton.disabled = false;
    pauseButton.textContent = "Pause";
    updateScoreBoard();

    spawnTimer = setInterval(makeAsteroid, 850);
    gameLoop = setInterval(() => {
        if (!gamePaused && gameRunning) {
            movePlayer();
            updateAsteroids();
        }
    }, 20);
}

function clearAsteroids() {
    asteroids.forEach((asteroid) => asteroid.element.remove());
    asteroids = [];
}

function endGame() {
    gameRunning = false;
    clearInterval(spawnTimer);
    pauseButton.disabled = true;
    messageTitle.textContent = "Mission over!";
    messageText.textContent = "You scored " + score + " points. Ready to take another flight?";
    startButton.textContent = "Play again";
    messageScreen.style.display = "grid";
}

function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? "Resume" : "Pause";

    if (gamePaused) {
        messageTitle.textContent = "Game paused";
        messageText.textContent = "Take a breath, pilot. Your ship is waiting.";
        startButton.textContent = "Resume game";
        messageScreen.style.display = "grid";
    } else {
        messageScreen.style.display = "none";
    }
}

startButton.addEventListener("click", () => {
    if (gameRunning && gamePaused) {
        togglePause();
    } else {
        startGame();
    }
});

pauseButton.addEventListener("click", togglePause);
restartButton.addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = true;
        event.preventDefault();
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = true;
        event.preventDefault();
    }

    if (event.key === " " && gameRunning) {
        event.preventDefault();
        togglePause();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = false;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = false;
});

function holdButton(button, direction) {
    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        keys[direction] = true;
    });

    button.addEventListener("pointerup", () => keys[direction] = false);
    button.addEventListener("pointerleave", () => keys[direction] = false);
    button.addEventListener("pointercancel", () => keys[direction] = false);
}

holdButton(leftButton, "left");
holdButton(rightButton, "right");

const gameArea = document.getElementById('gameArea');
const playerPaddle = document.getElementById('playerPaddle');
const computerPaddle = document.getElementById('computerPaddle');
const ball = document.getElementById('ball');
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const game = {
  width: gameArea.clientWidth,
  height: gameArea.clientHeight,
  paddles: {
    player: { x: 20, y: (gameArea.clientHeight - 90) / 2, width: 14, height: 90, speed: 7 },
    computer: { x: gameArea.clientWidth - 34, y: (gameArea.clientHeight - 90) / 2, width: 14, height: 90, speed: 5 }
  },
  ball: {
    x: gameArea.clientWidth / 2,
    y: gameArea.clientHeight / 2,
    radius: 8,
    dx: 5,
    dy: 3,
    speed: 5
  },
  score: {
    player: 0,
    computer: 0
  },
  keys: {
    ArrowUp: false,
    ArrowDown: false
  }
};

let mouseY = gameArea.clientHeight / 2;

function updateScores() {
  playerScoreEl.textContent = game.score.player;
  computerScoreEl.textContent = game.score.computer;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updatePaddlePosition(paddle, y) {
  const topLimit = 0;
  const bottomLimit = game.height - paddle.height;
  paddle.y = clamp(y, topLimit, bottomLimit);
  paddle.element.style.top = `${paddle.y}px`;
}

function updateComputerAI() {
  const paddle = game.paddles.computer;
  const ballCenter = game.ball.y;
  const paddleCenter = paddle.y + paddle.height / 2;

  if (ballCenter > paddleCenter) {
    paddle.y += paddle.speed;
  } else if (ballCenter < paddleCenter) {
    paddle.y -= paddle.speed;
  }

  paddle.y = clamp(paddle.y, 0, game.height - paddle.height);
  computerPaddle.style.top = `${paddle.y}px`;
}

function movePlayerWithMouse(event) {
  const rect = gameArea.getBoundingClientRect();
  const mousePos = event.clientY - rect.top;
  mouseY = clamp(mousePos - 45, 0, game.height - game.paddles.player.height);
  updatePaddlePosition(game.paddles.player, mouseY);
}

function movePlayerWithKeys() {
  const player = game.paddles.player;

  if (game.keys.ArrowUp) {
    player.y -= player.speed;
  }

  if (game.keys.ArrowDown) {
    player.y += player.speed;
  }

  updatePaddlePosition(player, player.y);
}

function resetBall(direction = 1) {
  const ballObj = game.ball;
  ballObj.x = game.width / 2;
  ballObj.y = game.height / 2;
  ballObj.dx = direction * (4 + Math.random() * 2);
  ballObj.dy = (Math.random() * 4 - 2);
  ball.style.left = `${ballObj.x}px`;
  ball.style.top = `${ballObj.y}px`;
}

function checkWallCollision() {
  const ballObj = game.ball;

  if (ballObj.y - ballObj.radius <= 0) {
    ballObj.y = ballObj.radius;
    ballObj.dy *= -1;
  }

  if (ballObj.y + ballObj.radius >= game.height) {
    ballObj.y = game.height - ballObj.radius;
    ballObj.dy *= -1;
  }

  if (ballObj.x - ballObj.radius <= 0) {
    game.score.computer += 1;
    updateScores();
    resetBall(1);
  }

  if (ballObj.x + ballObj.radius >= game.width) {
    game.score.player += 1;
    updateScores();
    resetBall(-1);
  }
}

function checkPaddleCollision() {
  const ballObj = game.ball;
  const player = game.paddles.player;
  const computer = game.paddles.computer;

  const playerHit =
    ballObj.x - ballObj.radius <= player.x + player.width &&
    ballObj.x + ballObj.radius >= player.x &&
    ballObj.y >= player.y &&
    ballObj.y <= player.y + player.height &&
    ballObj.dx < 0;

  const computerHit =
    ballObj.x + ballObj.radius >= computer.x &&
    ballObj.x - ballObj.radius <= computer.x + computer.width &&
    ballObj.y >= computer.y &&
    ballObj.y <= computer.y + computer.height &&
    ballObj.dx > 0;

  if (playerHit) {
    ballObj.x = player.x + player.width + ballObj.radius;
    const hitPos = (ballObj.y - (player.y + player.height / 2)) / (player.height / 2);
    ballObj.dx = Math.abs(ballObj.dx) + 0.5;
    ballObj.dy = hitPos * 5;
  }

  if (computerHit) {
    ballObj.x = computer.x - ballObj.radius;
    const hitPos = (ballObj.y - (computer.y + computer.height / 2)) / (computer.height / 2);
    ballObj.dx = -Math.abs(ballObj.dx) - 0.5;
    ballObj.dy = hitPos * 5;
  }
}

function updateBall() {
  const ballObj = game.ball;

  ballObj.x += ballObj.dx;
  ballObj.y += ballObj.dy;

  ball.style.left = `${ballObj.x}px`;
  ball.style.top = `${ballObj.y}px`;

  checkWallCollision();
  checkPaddleCollision();
}

function gameLoop() {
  movePlayerWithKeys();
  updateComputerAI();
  updateBall();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    game.keys[event.key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    game.keys[event.key] = false;
  }
});

gameArea.addEventListener('mousemove', movePlayerWithMouse);

function initialize() {
  playerPaddle.style.left = `${game.paddles.player.x}px`;
  playerPaddle.style.top = `${game.paddles.player.y}px`;
  computerPaddle.style.left = `${game.paddles.computer.x}px`;
  computerPaddle.style.top = `${game.paddles.computer.y}px`;

  updateScores();
  resetBall(1);
  requestAnimationFrame(gameLoop);
}

initialize();
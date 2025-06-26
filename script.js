// Game Variables
const cards = document.querySelectorAll('.card');
const confettiContainer = document.getElementById('confetti-container');
const playAgainBtn = document.getElementById('play-again');
const congratulationsDiv = document.getElementById('congratulations');
const timerDisplay = document.querySelector('#timer .stat-value');
const matchDisplay = document.querySelector('#match-info .stat-value');
const movesDisplay = document.querySelector('#moves-counter .stat-value');

let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let matchesFound = 0;
let moves = 0;
let gameStarted = false;
let startTime;
let timerInterval;

const totalPairs = 8;

// Initialize Game
function initGame() {
    shuffle();
    resetGameStats();
    addEventListeners();
}

// Add Event Listeners
function addEventListeners() {
    cards.forEach(card => {
        card.addEventListener('click', flipCard);
    });
    
    playAgainBtn.addEventListener('click', resetGame);
}

// Shuffle Cards
function shuffle() {
    cards.forEach(card => {
        let randomPos = Math.floor(Math.random() * 16);
        card.style.order = randomPos;
    });
}

// Reset Game Statistics
function resetGameStats() {
    matchesFound = 0;
    moves = 0;
    gameStarted = false;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    
    updateMovesDisplay();
    updateMatchDisplay();
    resetTimer();
    
    // Reset card states
    cards.forEach(card => {
        card.classList.remove('flipped', 'matched');
    });
    
    // Hide victory elements
    congratulationsDiv.style.display = 'none';
    playAgainBtn.style.display = 'none';
}

// Start Game Timer
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

// Update Timer Display
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Reset Timer
function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerDisplay.textContent = '00:00';
}

// Update Matches Display
function updateMatchDisplay() {
    matchDisplay.textContent = `${matchesFound}/${totalPairs}`;
}

// Update Moves Display
function updateMovesDisplay() {
    movesDisplay.textContent = moves.toString();
}

// Flip Card Function
function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains('matched')) return;
    
    // Start timer on first move
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }
    
    this.classList.add('flipped');
    
    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
    } else {
        secondCard = this;
        moves++;
        updateMovesDisplay();
        checkForMatch();
    }
}

// Check for Match
function checkForMatch() {
    let isMatch = firstCard.dataset.image === secondCard.dataset.image;
    isMatch ? handleMatch() : handleMismatch();
}

// Handle Successful Match
function handleMatch() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    // Add celebration effect
    createMatchEffect(firstCard);
    createMatchEffect(secondCard);
    
    matchesFound++;
    updateMatchDisplay();
    
    if (matchesFound === totalPairs) {
        setTimeout(showVictory, 500);
    }
    
    resetBoard();
}

// Handle Card Mismatch
function handleMismatch() {
    lockBoard = true;
    
    // Add shake effect for wrong match
    firstCard.style.animation = 'shake 0.5s ease-in-out';
    secondCard.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        firstCard.style.animation = '';
        secondCard.style.animation = '';
        resetBoard();
    }, 1000);
}

// Create Match Effect
function createMatchEffect(card) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 12; i++) {
        createSpark(centerX, centerY);
    }
}

// Create Spark Effect
function createSpark(x, y) {
    const spark = document.createElement('div');
    spark.style.position = 'fixed';
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    spark.style.width = '4px';
    spark.style.height = '4px';
    spark.style.background = '#00f5ff';
    spark.style.borderRadius = '50%';
    spark.style.pointerEvents = 'none';
    spark.style.zIndex = '1000';
    
    const angle = (Math.PI * 2 * Math.random());
    const velocity = 50 + Math.random() * 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    document.body.appendChild(spark);
    
    let opacity = 1;
    let currentX = x;
    let currentY = y;
    
    const animate = () => {
        currentX += vx * 0.02;
        currentY += vy * 0.02;
        opacity -= 0.02;
        
        spark.style.left = currentX + 'px';
        spark.style.top = currentY + 'px';
        spark.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            document.body.removeChild(spark);
        }
    };
    
    requestAnimationFrame(animate);
}

// Reset Board State
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Show Victory Screen
function showVictory() {
    clearInterval(timerInterval);
    
    // Update final stats
    document.getElementById('final-time').textContent = `Time: ${timerDisplay.textContent}`;
    document.getElementById('final-moves').textContent = `Moves: ${moves}`;
    
    // Show victory elements
    congratulationsDiv.style.display = 'block';
    playAgainBtn.style.display = 'inline-block';

    // Optional: Trigger confetti animation (if using any animation library or custom)
    launchConfetti();
}

// Launch Confetti (optional, placeholder function)
function launchConfetti() {
    // If using a library like canvas-confetti or a custom effect, trigger it here
    // This is just a placeholder in case you're planning to integrate one
    confettiContainer.innerHTML = ''; // Clear any existing confetti if needed
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDuration = 1 + Math.random() * 2 + 's';
        confettiContainer.appendChild(confetti);
    }

    // Optionally remove confetti after a while
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 3000);
}

// Reset Game (called on Play Again)
function resetGame() {
    resetGameStats();
    shuffle();
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);

// Define player and opponent data
let player = {
    lives: 2,
    ap: 4,
    cards: [],
    deployedCards: [] // Cards deployed to battlefield
};

let opponent = {
    lives: 2,
    cards: [],
    deployedCards: [] // Cards deployed to battlefield
};

let availableCards = [
    { name: "Manager", attack: 4, defense: 3, socialStatus: 5, type: "main" },
    { name: "Intern", attack: 1, defense: 2, socialStatus: 2, type: "main" },
    { name: "Supporter", attack: 0, defense: 1, socialStatus: 4, type: "support", effect: "increase_ap" },
    { name: "Executive", attack: 6, defense: 5, socialStatus: 6, type: "main" },
    { name: "Freelancer", attack: 2, defense: 1, socialStatus: 3, type: "support", effect: "decrease_cost" }
];

let isPlayerTurn = true; // Flag to track if it's the player's turn

// Initialize the game
function startGame() {
    // Reset player and opponent data
    player.lives = 2;
    player.ap = 4;
    opponent.lives = 2;
    document.getElementById("player-lives").textContent = player.lives;
    document.getElementById("player-ap").textContent = player.ap;
    document.getElementById("opponent-lives").textContent = opponent.lives;
    document.getElementById("game-end").style.display = "none"; // Hide win/loss screen

    player.cards = [];
    opponent.cards = [];
    player.deployedCards = [];
    opponent.deployedCards = [];

    // Shuffle available cards and give each player some cards
    shuffle(availableCards);
    for (let i = 0; i < 3; i++) {
        player.cards.push(availableCards[i]);
        opponent.cards.push(availableCards[3 + i]);
    }

    renderPlayerDeck();
    renderOpponentDeck();

    // Hide the "Start Game" button
    document.getElementById("start-game").style.display = "none";

    // Show the End Turn button
    document.getElementById("end-turn").style.display = "block";
}

// Shuffle function for cards
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Render player's deck (far left)
function renderPlayerDeck() {
    const playerDeck = document.getElementById("player-deck");
    playerDeck.innerHTML = "";

    player.cards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = `
            <p>${card.name}</p>
            <p>Attack: ${card.attack}</p>
            <p>Defense: ${card.defense}</p>
            <p>Social Status: ${card.socialStatus}</p>
        `;
        cardElement.addEventListener("click", () => deployCard(card));
        playerDeck.appendChild(cardElement);
    });
}

// Render opponent's deck (far right) - Facing backwards (card back side)
function renderOpponentDeck() {
    const opponentDeck = document.getElementById("opponent-deck");
    opponentDeck.innerHTML = "";

    opponent.cards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = `<p>Card Back</p>`; // Placeholder for the opponent's card
        opponentDeck.appendChild(cardElement);
    });
}

// Deploy card from the deck (to the battlefield)
function deployCard(card) {
    if (!isPlayerTurn) return; // If it's not the player's turn, prevent interaction

    if (player.deployedCards.length < 3 && player.ap >= card.socialStatus) { // Ensure AP is enough
        player.deployedCards.push(card);
        player.ap -= card.socialStatus;
        document.getElementById("player-ap").textContent = player.ap;
        renderBattlefield();

        // Check if AP is zero, automatically switch to opponent
        if (player.ap <= 0) {
            endTurn();
        }
    } else if (player.deployedCards.length >= 3) {
        alert("You can only deploy up to 3 cards.");
    } else {
        alert("You don't have enough Action Points.");
    }
}

// Render the battlefield (display deployed cards)
function renderBattlefield() {
    const battlefield = document.getElementById("battlefield");
    battlefield.innerHTML = "";

    // Render deployed player cards
    player.deployedCards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = `
            <p>${card.name}</p>
            <p>Attack: ${card.attack}</p>
            <p>Defense: ${card.defense}</p>
            <p>Social Status: ${card.socialStatus}</p>
        `;
        cardElement.addEventListener("click", () => showAttackButton(card));
        battlefield.appendChild(cardElement);
    });

    // Render deployed opponent cards
    opponent.deployedCards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerHTML = `
            <p>${card.name}</p>
            <p>Attack: ${card.attack}</p>
            <p>Defense: ${card.defense}</p>
            <p>Social Status: ${card.socialStatus}</p>
        `;
        battlefield.appendChild(cardElement);
    });
}

// Show attack button when a deployed card is clicked
function showAttackButton(card) {
    if (!isPlayerTurn) return; // If it's not the player's turn, prevent interaction

    document.getElementById("attack").style.display = "block";
    document.getElementById("attack").onclick = function () {
        attack(card);
    };
}

// Perform the attack action
function attack(card) {
    if (!isPlayerTurn) return; // Prevent attack when it's not player's turn

    const opponentCard = opponent.deployedCards[0]; // Assuming the opponent has only one card deployed
    if (opponentCard) {
        opponent.lives -= card.attack;
        document.getElementById("opponent-lives").textContent = opponent.lives;
        checkGameOver();
        endTurn(); // Automatically end the turn after attack
    }
}

// Opponent AI's turn to play
function opponentAI() {
    if (isPlayerTurn) return; // Prevent AI actions when it's not the opponent's turn

    if (opponent.cards.length > 0) {
        const card = opponent.cards.pop();
        opponent.deployedCards.push(card);
        opponent.lives -= card.attack;
        document.getElementById("opponent-lives").textContent = opponent.lives;
        renderBattlefield();
        checkGameOver();
        endTurn(); // Automatically end the turn after opponent's action
    }
}

// Check for game over (win or loss condition)
function checkGameOver() {
    if (player.lives <= 0) {
        showGameEnd("You Lost!");
    } else if (opponent.lives <= 0) {
        showGameEnd("You Won!");
    }
}

// Show the win/loss screen
function showGameEnd(result) {
    document.getElementById("game-result").textContent = result;
    document.getElementById("game-end").style.display = "block";
    document.getElementById("attack").style.display = "none"; // Hide attack button
}

// End the player's turn and switch to the opponent
function endTurn() {
    isPlayerTurn = false;
    document.getElementById("end-turn").style.display = "none"; // Hide End Turn button during AI's turn
    document.getElementById("attack").style.display = "none"; // Hide Attack button
    setTimeout(() => {
        opponentAI(); // Let the opponent take their turn
        isPlayerTurn = true; // Switch back to player turn
        document.getElementById("end-turn").style.display = "block"; // Show End Turn button
        if (player.ap > 0) {
            document.getElementById("attack").style.display = "block"; // Show Attack button if AP is available
        }
    }, 1000);
}

// Restart the game
document.getElementById("restart-game").addEventListener("click", startGame);

// Start the game when clicking the "Start Game" button
document.getElementById("start-game").addEventListener("click", startGame);

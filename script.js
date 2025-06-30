// script.js

// Map data (1 = grass, 2 = brick, 0 = cant move)
const mapData = [
    [1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1],
];
// Game state
let gameState = {
   playerX: Math.floor(mapData[0].length / 2),
    playerY: Math.floor(mapData.length / 2),
    playerHp: 100,
    playerMaxHp: 100,
    steps: 0,
    battlesWon: 0,
    inBattle: false,
    enemyHp: 80,
    enemyMaxHp: 80,
    defending: false
};

// Initialize game
function initGame() {
    createMap();
    updateUI();
    
    // Event listeners
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Battle buttons
    document.getElementById('attackBtn').addEventListener('click', () => battleAction('attack'));
    document.getElementById('healBtn').addEventListener('click', () => battleAction('heal'));
    document.getElementById('defendBtn').addEventListener('click', () => battleAction('defend'));
    document.getElementById('runBtn').addEventListener('click', () => battleAction('run'));
}

function createMap() {
    const gameMap = document.getElementById('gameMap');
    gameMap.innerHTML = '';
    
    mapData.forEach((row, y) => {
        row.forEach((tile, x) => {
            const tileDiv = document.createElement('div');
            tileDiv.className = `game-tile ${tile === 0 ? 'house' : tile === 1 ? 'grass' : 'brick'}`;
            tileDiv.dataset.x = x;
            tileDiv.dataset.y = y;
            
            // Add player character
            if (x === gameState.playerX && y === gameState.playerY) {
                const player = document.createElement('div');
                player.className = 'character priest';
                player.id = 'player';
                tileDiv.appendChild(player);
            }
            
            gameMap.appendChild(tileDiv);
        });
    });
}

function startGame() {
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
}

function handleKeyPress(e) {
    if (gameState.inBattle) return;
    
    const key = e.key.toLowerCase();
    switch(key) {
        case 'w':
        case 'arrowup':
            e.preventDefault();
            movePlayer(0, -1);
            break;
        case 's':
        case 'arrowdown':
            e.preventDefault();
            movePlayer(0, 1);
            break;
        case 'a':
        case 'arrowleft':
            e.preventDefault();
            movePlayer(-1, 0);
            break;
        case 'd':
        case 'arrowright':
            e.preventDefault();
            movePlayer(1, 0);
            break;
    }
}

function movePlayer(dx, dy) {
    const newX = gameState.playerX + dx;
    const newY = gameState.playerY + dy;
    
    // Check boundaries
    if (newX < 0 || newX >= mapData[0].length || newY < 0 || newY >= mapData.length) return;
    
    // Check if it's a walkable tile (1 or 2)
    if (mapData[newY][newX] === 0) return; // Can't walk on white block
    
    // Update player position
    gameState.playerX = newX;
    gameState.playerY = newY;
    gameState.steps++;
    
    // Update player visual position
    updatePlayerPosition();
    updateUI();
    
    // Random battle encounter only on grass (tile type 1)
    if (mapData[newY][newX] === 1 && Math.random() < 0.1) { // 10% chance
        startBattle();
    }
}

function updatePlayerPosition() {
    // Remove player from current position
    const currentPlayer = document.getElementById('player');
    if (currentPlayer) currentPlayer.remove();
    
    // Add player to new position
    const newTile = document.querySelector(`[data-x="${gameState.playerX}"][data-y="${gameState.playerY}"]`);
    const newPlayer = document.createElement('div');
    newPlayer.className = 'character priest';
    newPlayer.id = 'player';
    newTile.appendChild(newPlayer);
}

function updateUI() {
    document.getElementById('stepCount').textContent = gameState.steps;
    document.getElementById('battlesWon').textContent = gameState.battlesWon;
    document.getElementById('playerHp').textContent = `${gameState.playerHp}/${gameState.playerMaxHp} HP`;
    
    const healthPercent = (gameState.playerHp / gameState.playerMaxHp) * 100;
    document.getElementById('playerHealthBar').style.width = `${healthPercent}%`;
}

function startBattle() {
    gameState.inBattle = true;
    gameState.enemyHp = gameState.enemyMaxHp;
    gameState.defending = false;
    
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('battleScreen').classList.remove('hidden');
    
    updateBattleUI();
    addBattleLog("A wild Soldier blocks your path!");
}

function updateBattleUI() {
    // Player HP
    const playerHealthPercent = (gameState.playerHp / gameState.playerMaxHp) * 100;
    document.getElementById('battlePlayerHp').style.width = `${playerHealthPercent}%`;
    document.getElementById('battlePlayerHpText').textContent = `${gameState.playerHp}/${gameState.playerMaxHp} HP`;
    
    // Enemy HP
    const enemyHealthPercent = (gameState.enemyHp / gameState.enemyMaxHp) * 100;
    document.getElementById('enemyHp').style.width = `${enemyHealthPercent}%`;
    document.getElementById('enemyHpText').textContent = `${gameState.enemyHp}/${gameState.enemyMaxHp} HP`;
}

function addBattleLog(message) {
    const log = document.getElementById('battleLog');
    log.innerHTML += `<div>${message}</div>`;
    log.scrollTop = log.scrollHeight;
}

function battleAction(action) {
    const actions = document.getElementById('battleActions');
    actions.style.pointerEvents = 'none'; // Disable buttons during animation
    
    setTimeout(() => {
        switch(action) {
            case 'attack':
                playerAttack();
                break;
            case 'heal':
                playerHeal();
                break;
            case 'defend':
                playerDefend();
                break;
            case 'run':
                playerRun();
                break;
        }
        
        if (gameState.inBattle && gameState.enemyHp > 0) {
            setTimeout(enemyTurn, 1000);
        } else {
            actions.style.pointerEvents = 'auto';
        }
    }, 200);
}

function playerAttack() {
    const damage = Math.floor(Math.random() * 25) + 15; // 15-40 damage
    gameState.enemyHp = Math.max(0, gameState.enemyHp - damage);
    
    addBattleLog(`Jhenrich attacks for ${damage} damage!`);
    
    // Add shake effect to enemy
    const enemyContainer = document.querySelector('.soldier').closest('.text-center');
    if (enemyContainer) {
        enemyContainer.classList.add('shake');
        setTimeout(() => {
            enemyContainer.classList.remove('shake');
        }, 500);
    }
    
    updateBattleUI();
    
    if (gameState.enemyHp <= 0) {
        setTimeout(() => {
            addBattleLog("Soldier defeated!");
            gameState.battlesWon++;
            endBattle();
        }, 500);
    }
}

function playerHeal() {
    const healAmount = Math.floor(Math.random() * 20) + 15; // 15-35 heal
    const actualHeal = Math.min(healAmount, gameState.playerMaxHp - gameState.playerHp);
    gameState.playerHp += actualHeal;
    
    addBattleLog(`Jhenrich heals for ${actualHeal} HP!`);
    updateBattleUI();
}

function playerDefend() {
    gameState.defending = true;
    addBattleLog("Jhenrich defends! Damage will be reduced next turn.");
}

function playerRun() {
    if (Math.random() < 0.7) { // 70% success rate
        addBattleLog("Successfully escaped!");
        endBattle();
    } else {
        addBattleLog("Couldn't escape!");
    }
}

function enemyTurn() {
    if (!gameState.inBattle) return;
    
    const actions = ['attack', 'attack', 'attack', 'defend']; // Enemy mostly attacks
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    if (action === 'attack') {
        let damage = Math.floor(Math.random() * 20) + 10; // 10-30 damage
        if (gameState.defending) {
            damage = Math.floor(damage / 2);
            addBattleLog("Jhenrich's defense reduces the damage!");
        }
        gameState.defending = false;
        
        gameState.playerHp = Math.max(0, gameState.playerHp - damage);
        addBattleLog(`Soldier attacks for ${damage} damage!`);
        
        // Add shake effect to player
        const playerContainer = document.querySelector('.priest').closest('.text-center');
        if (playerContainer) {
            playerContainer.classList.add('shake');
            setTimeout(() => {
                playerContainer.classList.remove('shake');
            }, 500);
        }
        
        updateBattleUI();
        
        if (gameState.playerHp <= 0) {
            setTimeout(() => {
                addBattleLog("Jhenrich fainted! Game Over!");
                alert("Game Over! Refresh to play again.");
                location.reload();
            }, 500);
            return;
        }
    } else {
        addBattleLog("Soldier prepares to defend!");
    }
    
    // Re-enable battle buttons
    document.getElementById('battleActions').style.pointerEvents = 'auto';
}

function endBattle() {
    gameState.inBattle = false;
    setTimeout(() => {
        document.getElementById('battleScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        document.getElementById('battleLog').innerHTML = '';
        updateUI();
    }, 1500);
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);
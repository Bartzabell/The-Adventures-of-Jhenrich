class Game {
    constructor() {
        this.playerPosition = 100;
        this.currentEnemy = 1;
        this.maxEnemies = 10;
        this.hp = 3;
        this.score = 0;
        this.enemyPositions = [];
        this.isMoving = false;
        this.walkAnimationFrame = 0;
        this.gameRunning = false;
        
        // Generate enemy positions
        for (let i = 1; i <= this.maxEnemies; i++) {
            this.enemyPositions.push(200 + (i * 150));
        }
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateUI();
    }
    
    bindEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('playAgain').addEventListener('click', () => this.resetGame());
        document.getElementById('submitAnswer').addEventListener('click', () => this.submitAnswer());
        document.getElementById('submitRevive').addEventListener('click', () => this.submitRevive());
        document.getElementById('submitBoss').addEventListener('click', () => this.submitBoss());
        document.getElementById('dialogOk').addEventListener('click', () => this.closeDialog());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.addEventListener('keyup', (e) => this.handleKeyRelease(e));
        
        // Enter key for modals
        document.getElementById('answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        document.getElementById('reviveAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitRevive();
        });
        document.getElementById('bossAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitBoss();
        });
    }
    
    startGame() {
        document.getElementById('titleScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        this.gameRunning = true;
        this.renderEnemies();
        const player = document.getElementById('player');
        player.classList.add('player-sprite', 'walking-0');
        this.showDialog("Welcome to your adventure! Use → arrow key to move forward.");
    }
    
    resetGame() {
        this.playerPosition = 100;
        this.currentEnemy = 1;
        this.hp = 3;
        this.score = 0;
        this.walkAnimationFrame = 0;
        this.gameRunning = true;
        
        document.getElementById('victoryScreen').classList.add('hidden');
        document.getElementById('titleScreen').classList.remove('hidden');
        
        this.updateUI();
        this.renderEnemies();
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        if (e.key === 'ArrowRight' && !this.isMoving) {
            this.movePlayer();
        }
    }
    
    handleKeyRelease(e) {
        // Handle key release if needed
    }
    
    movePlayer() {
        if (this.isMoving) return;
        
        this.isMoving = true;
        const moveDistance = 30;
        const newPosition = this.playerPosition + moveDistance;
        
        // Animate walking
        this.animateWalk();
        
        // Check for enemy encounter
        const enemyPosition = this.enemyPositions[this.currentEnemy - 1];
        if (newPosition >= enemyPosition - 25 && this.currentEnemy <= this.maxEnemies) {
            this.playerPosition = enemyPosition - 60;
            this.encounterEnemy();
        } else {
            this.playerPosition = newPosition;
            this.updatePlayerPosition();
        }
        
        setTimeout(() => {
            this.isMoving = false;
        }, 300);
    }
    
    animateWalk() {
        const player = document.getElementById('player');
        player.classList.add('player-sprite');
        
        let frame = 0;
        // Set initial frame
        player.classList.remove('walking-0', 'walking-1', 'walking-2');
        player.classList.add(`walking-${frame}`);
        
        const walkInterval = setInterval(() => {
            // Increment frame first, then apply
            frame = (frame + 1) % 3;
            
            // Remove previous frame class
            player.classList.remove('walking-0', 'walking-1', 'walking-2');
            // Add current frame class
            player.classList.add(`walking-${frame}`);
        }, 100);
        
        setTimeout(() => {
            clearInterval(walkInterval);
            // Reset to standing position
            player.classList.remove('walking-0', 'walking-1', 'walking-2');
            player.classList.add('walking-0');
        }, 300);
    }
    
    updatePlayerPosition() {
        const player = document.getElementById('player');
        player.style.left = this.playerPosition + 'px';
    }
    
    renderEnemies() {
        // Clear existing enemies
        document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());
        
        // Render visible enemies
        for (let i = 0; i < this.maxEnemies; i++) {
            if (i >= this.currentEnemy - 1) {
                const enemy = document.createElement('div');
                enemy.className = 'enemy';
                enemy.style.left = this.enemyPositions[i] + 'px';
                enemy.textContent = `${i + 1}`;
                enemy.style.display = 'flex';
                enemy.style.alignItems = 'center';
                enemy.style.justifyContent = 'center';
                enemy.style.color = 'white';
                enemy.style.fontWeight = 'bold';
                document.querySelector('.world-segment').appendChild(enemy);
            }
        }
    }
    
    encounterEnemy() {
        if (this.currentEnemy > this.maxEnemies) {
            this.showVictory();
            return;
        }
        
        this.showDialog("Enemy encountered!", () => {
            if (this.currentEnemy === this.maxEnemies) {
                this.showFinalBoss();
            } else {
                this.showBattle();
            }
        });
    }
    
    showDialog(text, callback) {
        const dialog = document.getElementById('dialogBox');
        const dialogText = document.getElementById('dialogText');
        
        dialogText.textContent = text;
        dialog.classList.remove('hidden');
        
        this.dialogCallback = callback;
    }
    
    closeDialog() {
        document.getElementById('dialogBox').classList.add('hidden');
        if (this.dialogCallback) {
            this.dialogCallback();
            this.dialogCallback = null;
        }
    }
    
    showBattle() {
        const modal = document.getElementById('battleModal');
        const question = this.generateQuestion();
        
        document.getElementById('question').textContent = question.text;
        document.getElementById('answer').value = '';
        modal.classList.remove('hidden');
        
        this.currentQuestion = question;
        this.startTimer('timer', 15, () => this.timeUp());
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('answer').focus();
        }, 100);
    }
    
    showFinalBoss() {
        const modal = document.getElementById('finalBossModal');
        const question = this.generateBossQuestion();
        
        document.getElementById('bossQuestion').textContent = question.text;
        document.getElementById('bossAnswer').value = '';
        modal.classList.remove('hidden');
        
        this.currentQuestion = question;
        this.startTimer('bossTimer', 20, () => this.timeUp());
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('bossAnswer').focus();
        }, 100);
    }
    
    generateQuestion() {
        const operations = ['+', '-'];
        const numbers = [];
        const numCount = Math.floor(Math.random() * 2) + 2; // 2-3 numbers
        
        for (let i = 0; i < numCount; i++) {
            numbers.push(Math.floor(Math.random() * 20) + 1);
        }
        
        let text = numbers[0].toString();
        let answer = numbers[0];
        
        for (let i = 1; i < numbers.length; i++) {
            const operation = operations[Math.floor(Math.random() * operations.length)];
            text += ` ${operation} ${numbers[i]}`;
            
            if (operation === '+') {
                answer += numbers[i];
            } else {
                answer -= numbers[i];
            }
        }
        
        return { text: text + ' = ?', answer: answer };
    }
    
    generateBossQuestion() {
        const operations = ['+', '-', '*', '/'];
        const numbers = [];
        const numCount = Math.floor(Math.random() * 2) + 3; // 3-4 numbers
        
        // Generate numbers ensuring division results in whole numbers
        for (let i = 0; i < numCount; i++) {
            numbers.push(Math.floor(Math.random() * 10) + 1);
        }
        
        let text = numbers[0].toString();
        let answer = numbers[0];
        
        for (let i = 1; i < numbers.length; i++) {
            const operation = operations[Math.floor(Math.random() * operations.length)];
            text += ` ${operation} ${numbers[i]}`;
            
            switch (operation) {
                case '+':
                    answer += numbers[i];
                    break;
                case '-':
                    answer -= numbers[i];
                    break;
                case '*':
                    answer *= numbers[i];
                    break;
                case '/':
                    answer = Math.floor(answer / numbers[i]);
                    break;
            }
        }
        
        return { text: text + ' = ?', answer: answer };
    }
    
    generateReviveQuestion() {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const operation = Math.random() < 0.5 ? '+' : '-';
        const answer = operation === '+' ? a + b : a - b;
        
        return { text: `${a} ${operation} ${b} = ?`, answer: answer };
    }
    
    startTimer(elementId, seconds, callback) {
        const timerElement = document.getElementById(elementId);
        let timeLeft = seconds;
        
        const timerInterval = setInterval(() => {
            timerElement.textContent = timeLeft;
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                callback();
            }
        }, 1000);
        
        this.currentTimer = timerInterval;
    }
    
    submitAnswer() {
        const answer = parseInt(document.getElementById('answer').value);
        if (isNaN(answer)) return;
        
        clearInterval(this.currentTimer);
        
        if (answer === this.currentQuestion.answer) {
            this.correctAnswer();
        } else {
            this.wrongAnswer();
        }
    }
    
    submitBoss() {
        const answer = parseInt(document.getElementById('bossAnswer').value);
        if (isNaN(answer)) return;
        
        clearInterval(this.currentTimer);
        
        if (answer === this.currentQuestion.answer) {
            this.correctAnswer();
        } else {
            this.wrongAnswer();
        }
    }
    
    submitRevive() {
        const answer = parseInt(document.getElementById('reviveAnswer').value);
        if (isNaN(answer)) return;
        
        clearInterval(this.currentTimer);
        
        if (answer === this.currentQuestion.answer) {
            this.revivePlayer();
        } else {
            this.gameOver();
        }
    }
    
    correctAnswer() {
        document.getElementById('battleModal').classList.add('hidden');
        document.getElementById('finalBossModal').classList.add('hidden');
        
        this.score += 10;
        this.showAnimation('swordsman', () => {
            this.currentEnemy++;
            this.updatePlayerPosition();
            this.renderEnemies();
            this.updateUI();
            
            if (this.currentEnemy > this.maxEnemies) {
                this.showVictory();
            }
        });
    }
    
    wrongAnswer() {
        document.getElementById('battleModal').classList.add('hidden');
        document.getElementById('finalBossModal').classList.add('hidden');
        
        this.takeDamage();
    }
    
    timeUp() {
        document.getElementById('battleModal').classList.add('hidden');
        document.getElementById('finalBossModal').classList.add('hidden');
        document.getElementById('deathModal').classList.add('hidden');
        
        this.takeDamage();
    }
    
    takeDamage() {
        this.hp--;
        this.updateUI();
        
        this.showAnimation('enemy-attack', () => {
            if (this.hp <= 0) {
                this.showDeathModal();
            }
        });
    }
    
    showDeathModal() {
        const modal = document.getElementById('deathModal');
        const question = this.generateReviveQuestion();
        
        document.getElementById('reviveQuestion').textContent = question.text;
        document.getElementById('reviveAnswer').value = '';
        modal.classList.remove('hidden');
        
        this.currentQuestion = question;
        this.startTimer('deathTimer', 15, () => this.gameOver());
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('reviveAnswer').focus();
        }, 100);
    }
    
    revivePlayer() {
        document.getElementById('deathModal').classList.add('hidden');
        
        this.hp = 1;
        this.updateUI();
        
        this.showAnimation('mage', () => {
            this.showDialog("You have been revived with 1 HP!");
        });
    }
    
    gameOver() {
        document.getElementById('deathModal').classList.add('hidden');
        this.gameRunning = false;
        this.showDialog("Game Over! Click OK to return to title screen.", () => {
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('titleScreen').classList.remove('hidden');
        });
    }
    
    showAnimation(type, callback) {
        const overlay = document.getElementById('animationOverlay');
        const character = document.getElementById('animationCharacter');
        
        // Reset classes
        character.className = 'animation-character';
        
        let animationInterval;
        
        if (type === 'swordsman') {
            character.classList.add('swordsman-sprite');
            let frame = 0;
            animationInterval = setInterval(() => {
                character.classList.remove('frame-0', 'frame-1', 'frame-2');
                character.classList.add(`frame-${frame}`);
                frame = (frame + 1) % 3;
            }, 300);
        } else if (type === 'mage') {
            character.classList.add('mage-sprite');
            let frame = 0;
            animationInterval = setInterval(() => {
                character.classList.remove('frame-0', 'frame-1');
                character.classList.add(`frame-${frame}`);
                frame = (frame + 1) % 2;
            }, 400);
        } else if (type === 'enemy-attack') {
            character.classList.add('enemy-sprite');
            let frame = 0;
            animationInterval = setInterval(() => {
                character.classList.remove('frame-0', 'frame-1');
                character.classList.add(`frame-${frame}`);
                frame = (frame + 1) % 2;
            }, 250);
        }
        
        overlay.classList.remove('hidden');
        
        // Add scale effect
        let scale = 1;
        const scaleInterval = setInterval(() => {
            scale = scale === 1 ? 1.2 : 1;
            character.style.transform = `scale(${scale})`;
        }, 200);
        
        setTimeout(() => {
            clearInterval(animationInterval);
            clearInterval(scaleInterval);
            overlay.classList.add('hidden');
            character.style.transform = 'scale(1)';
            callback();
        }, 1500);
    }
    
    showVictory() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('victoryScreen').classList.remove('hidden');
    }
    
    updateUI() {
        // Update HP
        const hearts = document.querySelectorAll('.hp-heart');
        hearts.forEach((heart, index) => {
            if (index < this.hp) {
                heart.classList.remove('empty');
            } else {
                heart.classList.add('empty');
            }
        });
        
        // Update progress
        document.getElementById('enemyCounter').textContent = this.currentEnemy;
        document.getElementById('score').textContent = this.score;
    }
}

// Start the game
const game = new Game();
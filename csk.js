class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = null; // 'pvp' or 'pvc'
        this.difficulty = 'medium';
        this.humanPlayer = 'X';
        this.computerPlayer = 'O';
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Mode selection elements
        this.gameModeSelection = document.getElementById('gameModeSelection');
        this.gameContainer = document.getElementById('gameContainer');
        this.vsPlayerBtn = document.getElementById('vsPlayerBtn');
        this.vsComputerBtn = document.getElementById('vsComputerBtn');
        this.changeModeBtn = document.getElementById('changeModeBtn');
        this.gameModeText = document.getElementById('gameModeText');
        this.difficultySelection = document.getElementById('difficultySelection');
        this.difficultySelect = document.getElementById('difficultySelect');
        
        // Game elements
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerDisplay = document.getElementById('currentPlayer');
        this.gameMessage = document.getElementById('gameMessage');
        this.resetGameBtn = document.getElementById('resetGame');
        this.resetScoreBtn = document.getElementById('resetScore');
        this.scoreXDisplay = document.getElementById('scoreX');
        this.scoreODisplay = document.getElementById('scoreO');
        this.scoreDrawDisplay = document.getElementById('scoreDraw');
        
        this.addEventListeners();
        this.updateDisplay();
    }
    
    addEventListeners() {
        // Mode selection listeners
        this.vsPlayerBtn.addEventListener('click', () => this.selectGameMode('pvp'));
        this.vsComputerBtn.addEventListener('click', () => this.selectGameMode('pvc'));
        this.changeModeBtn.addEventListener('click', () => this.showModeSelection());
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
        
        // Game listeners
        this.cells.forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });
        
        this.resetGameBtn.addEventListener('click', this.resetGame.bind(this));
        this.resetScoreBtn.addEventListener('click', this.resetScore.bind(this));
    }
    
    selectGameMode(mode) {
        this.gameMode = mode;
        this.gameModeSelection.style.display = 'none';
        this.gameContainer.style.display = 'block';
        
        if (mode === 'pvp') {
            this.gameModeText.textContent = 'Player vs Player';
            this.difficultySelection.style.display = 'none';
        } else {
            this.gameModeText.textContent = 'Player vs Computer';
            this.difficultySelection.style.display = 'flex';
        }
        
        this.resetGame();
    }
    
    showModeSelection() {
        this.gameModeSelection.style.display = 'block';
        this.gameContainer.style.display = 'none';
        this.gameMode = null;
        this.resetScore();
    }
    
    handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.getAttribute('data-index'));
        
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }
        
        // In PvC mode, only allow human player to click
        if (this.gameMode === 'pvc' && this.currentPlayer === this.computerPlayer) {
            return;
        }
        
        this.makeMove(index, cell);
    }
    
    makeMove(index, cell) {
        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        if (this.checkWinner()) {
            this.handleGameEnd('win');
        } else if (this.checkDraw()) {
            this.handleGameEnd('draw');
        } else {
            this.switchPlayer();
            
            // If it's computer's turn, make computer move
            if (this.gameMode === 'pvc' && this.currentPlayer === this.computerPlayer) {
                setTimeout(() => {
                    this.makeComputerMove();
                }, 500); // Small delay for better UX
            }
        }
    }
    
    makeComputerMove() {
        if (!this.gameActive) return;
        
        let move;
        
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
            default:
                move = this.getRandomMove();
        }
        
        if (move !== -1) {
            const cell = this.cells[move];
            this.makeMove(move, cell);
        }
    }
    
    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        if (availableMoves.length === 0) return -1;
        
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    getMediumMove() {
        // 70% chance to play strategically, 30% random
        if (Math.random() < 0.7) {
            const strategicMove = this.getStrategicMove();
            return strategicMove !== -1 ? strategicMove : this.getRandomMove();
        }
        return this.getRandomMove();
    }
    
    getStrategicMove() {
        // First, try to win
        const winMove = this.findWinningMove(this.computerPlayer);
        if (winMove !== -1) return winMove;
        
        // Then, try to block opponent from winning
        const blockMove = this.findWinningMove(this.humanPlayer);
        if (blockMove !== -1) return blockMove;
        
        // Take center if available
        if (this.board[4] === '') return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => this.board[corner] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        return -1;
    }
    
    getBestMove() {
        return this.minimaxMove();
    }
    
    findWinningMove(player) {
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = player;
                const isWinning = this.checkWinnerForPlayer(player);
                this.board[i] = '';
                
                if (isWinning) return i;
            }
        }
        return -1;
    }
    
    minimaxMove() {
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = this.computerPlayer;
                const score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinnerForBoard(board);
        
        if (winner === this.computerPlayer) return 1;
        if (winner === this.humanPlayer) return -1;
        if (this.isBoardFull(board)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = this.computerPlayer;
                    const score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = this.humanPlayer;
                    const score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    checkWinnerForBoard(board) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
    
    checkWinnerForPlayer(player) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] === player && this.board[b] === player && this.board[c] === player) {
                return true;
            }
        }
        return false;
    }
    
    isBoardFull(board) {
        return board.every(cell => cell !== '');
    }
    
    checkWinner() {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningCells(condition);
                return true;
            }
        }
        return false;
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    highlightWinningCells(winningCondition) {
        winningCondition.forEach(index => {
            this.cells[index].classList.add('winning');
        });
    }
    
    handleGameEnd(result) {
        this.gameActive = false;
        
        if (result === 'win') {
            this.scores[this.currentPlayer]++;
            
            if (this.gameMode === 'pvc') {
                if (this.currentPlayer === this.humanPlayer) {
                    this.gameMessage.textContent = `You Win! 🎉`;
                } else {
                    this.gameMessage.textContent = `Computer Wins! 🤖`;
                }
            } else {
                this.gameMessage.textContent = `Player ${this.currentPlayer} Wins! 🎉`;
            }
            
            this.gameMessage.className = 'game-message winner';
        } else if (result === 'draw') {
            this.scores.draw++;
            this.gameMessage.textContent = "It's a Draw! 🤝";
            this.gameMessage.className = 'game-message draw';
        }
        
        this.updateScoreDisplay();
        
        // Auto-reset after 3 seconds
        setTimeout(() => {
            this.resetGame();
        }, 3000);
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.currentPlayer = 'X';
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.gameMessage.textContent = '';
        this.gameMessage.className = 'game-message';
        this.updateDisplay();
        
        // If computer goes first in PvC mode
        if (this.gameMode === 'pvc' && this.currentPlayer === this.computerPlayer) {
            setTimeout(() => {
                this.makeComputerMove();
            }, 500);
        }
    }
    
    resetScore() {
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };
        this.updateScoreDisplay();
    }
    
    updateDisplay() {
        this.currentPlayerDisplay.textContent = this.currentPlayer;
        this.currentPlayerDisplay.style.color = this.currentPlayer === 'X' ? '#e74c3c' : '#3498db';
        
        // Update display text for PvC mode
        if (this.gameMode === 'pvc') {
            if (this.currentPlayer === this.humanPlayer) {
                this.currentPlayerDisplay.textContent = 'Your Turn';
            } else {
                this.currentPlayerDisplay.textContent = 'Computer Turn';
            }
        }
    }
    
    updateScoreDisplay() {
        this.scoreXDisplay.textContent = this.scores.X;
        this.scoreODisplay.textContent = this.scores.O;
        this.scoreDrawDisplay.textContent = this.scores.draw;
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});


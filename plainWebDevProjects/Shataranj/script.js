/**
 * Satrang - Chess Platform Logic
 */

// --- Global DOM Elements ---
const preloader = document.getElementById('preloader');
const dashboardView = document.getElementById('dashboard-view');
const puzzlesView = document.getElementById('puzzles-view');
const learnView = document.getElementById('learn-view');
const watchView = document.getElementById('watch-view');
const chessAppContainer = document.getElementById('chess-app-container');
const heroPlayBtn = document.getElementById('hero-play-btn');
const navPlay = document.getElementById('nav-play');
const cancelGameBtn = document.getElementById('cancel-game-btn');

// Nav Items
const navDashboard = document.getElementById('nav-dashboard');
const navPuzzles = document.getElementById('nav-puzzles');
const navLearn = document.getElementById('nav-learn');
// const navWatch ... (if id added)

// --- Game/Modal DOM Elements ---
const startScreen = document.getElementById('start-screen');
const customRulesModal = document.getElementById('custom-rules-modal');
const gameArea = document.getElementById('game-area');
const chessboard = document.getElementById('chessboard');
const startGameBtn = document.getElementById('start-game-btn');
const customRulesBtn = document.getElementById('custom-rules-btn');
const closeRulesBtn = document.getElementById('close-rules-btn');
const themeOptions = document.querySelectorAll('.theme-preview');
const modeButtons = document.querySelectorAll('.toggle-options button');
const timeSelect = document.getElementById('time-select');
const handicapSelect = document.getElementById('handicap-select');
const playerNameInput = document.getElementById('player-name-input');
const playerNameDisplay = document.getElementById('player-name-display');
const opponentNameDisplay = document.getElementById('opponent-name');
const whiteTimer = document.getElementById('player-time');
const blackTimer = document.getElementById('opponent-time');
const gameOverModal = document.getElementById('game-over-modal');
const winnerText = document.getElementById('winner-text');
const playAgainBtn = document.getElementById('play-again-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const resetBtn = document.getElementById('reset-btn');
const menuBtn = document.getElementById('menu-btn');
const lastMoveDisplay = document.getElementById('last-move-display');
const playerScoreEl = document.getElementById('player-score');
const opponentScoreEl = document.getElementById('opponent-score');
const playerCapturedEl = document.getElementById('player-captured');
const opponentCapturedEl = document.getElementById('opponent-captured');
const moveHistoryList = document.getElementById('move-history-list');

// --- Puzzle Elements ---
const levelGrid = document.getElementById('level-grid');
const puzzleInterface = document.getElementById('puzzle-interface');
const puzzleBoardEl = document.getElementById('puzzle-board');
const exitPuzzleBtn = document.getElementById('exit-puzzle-btn');
const puzzleTitle = document.getElementById('puzzle-title');
const puzzleStatus = document.getElementById('puzzle-status');
// Feedback Modal
const puzzleFeedbackModal = document.getElementById('puzzle-feedback-modal');
const puzzleFeedbackTitle = document.getElementById('puzzle-feedback-title');
const puzzleFeedbackMessage = document.getElementById('puzzle-feedback-message');
const nextLevelBtn = document.getElementById('next-level-btn');
const retryLevelBtn = document.getElementById('retry-level-btn');
const puzzleMenuBtn = document.getElementById('puzzle-menu-btn');

// --- Auth DOM ---
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const authSection = document.getElementById('auth-section');
const userSection = document.getElementById('user-section');
const displayUsername = document.getElementById('display-username');

// --- Learn DOM ---
const learnInterface = document.getElementById('learn-interface');
const learnBoardEl = document.getElementById('learn-board');
const exitLearnBtn = document.getElementById('exit-learn-btn');
const learnTitle = document.getElementById('learn-title');
const learnInstruction = document.getElementById('learn-instruction');
const nextLessonBtn = document.getElementById('next-lesson-btn');
// Rule Carousel Elements
const currentRuleText = document.getElementById('current-rule-text');
const nextRuleBtn = document.getElementById('next-rule-btn');

// --- Learn State ---
let currentTutorial = null;
let currentStepIndex = 0;
let currentRuleIndex = 0;

// --- Tutorial Data with Rules ---
const TUTORIALS = {
    pawn: { 
        name: "The Pawn", 
        icon: "fa-chess-pawn",
        rules: [
            "Moves forward one square at a time.",
            "Can move two squares on its first move.",
            "Captures diagonally, not straight!",
            "Promotes to any piece when reaching the end."
        ],
        highlightRule: 2, // Index of important rule (0-based)
        steps: [
            { text: "Move the Pawn forward one square!", start: {r:6, c:4}, target: {r:5, c:4} },
            { text: "Now capture diagonally!", start: {r:5, c:4}, target: {r:4, c:5} }
        ]
    },
    knight: { 
        name: "The Knight", 
        icon: "fa-chess-knight",
        rules: [
            "Moves in an 'L' shape: 2 squares + 1 square.",
            "Can jump over other pieces!",
            "Controls up to 8 squares from the center.",
            "Great for surprise attacks."
        ],
        highlightRule: 1,
        steps: [
            { text: "Jump the Knight in an L-shape!", start: {r:7, c:1}, target: {r:5, c:2} }
        ]
    },
    bishop: { 
        name: "The Bishop", 
        icon: "fa-chess-bishop",
        rules: [
            "Moves diagonally any number of squares.",
            "Stays on the same color squares.",
            "Cannot jump over pieces.",
            "Two Bishops control both colors!"
        ],
        highlightRule: 1,
        steps: [
            { text: "Slide the Bishop diagonally!", start: {r:7, c:2}, target: {r:4, c:5} }
        ]
    },
    rook: { 
        name: "The Rook", 
        icon: "fa-chess-rook",
        rules: [
            "Moves horizontally or vertically.",
            "Can move any number of squares.",
            "Very powerful in open positions.",
            "Can castle with the King!"
        ],
        highlightRule: 3,
        steps: [
            { text: "Move the Rook straight across!", start: {r:7, c:0}, target: {r:0, c:0} }
        ]
    },
    queen: { 
        name: "The Queen", 
        icon: "fa-chess-queen",
        rules: [
            "Combines Rook + Bishop powers!",
            "Moves in any direction.",
            "Most powerful piece (9 points).",
            "Protect her - she's valuable!"
        ],
        highlightRule: 2,
        steps: [
            { text: "The Queen can go anywhere!", start: {r:7, c:3}, target: {r:3, c:7} }
        ]
    },
    king: { 
        name: "The King", 
        icon: "fa-chess-king",
        rules: [
            "Moves one square in any direction.",
            "Must never move into check.",
            "If checkmated, game is over!",
            "Can castle for safety."
        ],
        highlightRule: 2,
        steps: [
            { text: "Move the King one square.", start: {r:7, c:4}, target: {r:6, c:4} }
        ]
    }
};

// --- Puzzle State ---
let puzzleState = {
    selected: null,
    level: 1,
    solved: false
};

// --- State ---
let gameConfig = {
    mode: 'pvp', 
    time: 600, // Default 10 minutes (in seconds), 'unlimited' for no timer
    handicap: 'none',
    theme: 'wood',
    playerName: 'Nikhil',
    opponentName: 'Friend',
    botDifficulty: 'medium'
};

// --- Custom Fun Game Config ---
let funGameConfig = {
    enabled: false,
    pawnStartRow: 2, // 2 = standard, 3 = medium, 4 = aggressive
    pieceRules: {
        pawn: 'standard',    // standard, sideways, backward, diagonal
        knight: 'standard',  // standard, extended, super
        bishop: 'standard',  // standard, limited, jumping
        rook: 'standard',    // standard, limited, diagonal
        queen: 'standard',   // standard, limited, knight
        king: 'standard'     // standard, super, knight
    }
};

let gameState = {
    board: [], 
    turn: 'white', 
    selectedSquare: null,
    possibleMoves: [],
    history: [],
    whiteTime: 0,
    blackTime: 0,
    timerInterval: null,
    gameOver: false,
    check: false, 
    lastMove: null, 
    scores: { white: 0, black: 0 },
    captured: { white: [], black: [] }
};

const PIECES = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// --- Puzzle Data (Simulated 100 Levels) ---
// In a real app, this would be a huge database.
// We will algorithmically generate "Simulated" puzzles for demo purposes
// or hardcode a few distinct "Mate in 1" patterns and repeat them with difficulty labels.
// --- Real Puzzle Data ---
const REAL_PUZZLES = [
    {
        // 1. Scholar's Mate Finish
        fen: "r1bqkbnr/pppp1p1p/2n5/4p1p1/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4",
        solution: { from: {r:5, c:5}, to: {r:1, c:5} }, // Qf3 -> f7
        desc: "Find the Checkmate in 1!",
        type: "Mate in 1"
    },
    {
        // 2. Back Rank Mate
        fen: "6k1/5ppp/8/8/8/8/6PP/4R1K1 w - - 0 1",
        solution: { from: {r:7, c:4}, to: {r:0, c:4} }, // Re1 -> e8
        desc: "Classic Back Rank Mate",
        type: "Mate in 1"
    },
    {
        // 3. Anastasia's Mate Pattern (Simplified)
        fen: "5rk1/5ppp/8/8/8/8/5PPP/5RK1 w - - 0 1", // Wait, this is not mate.
        // Use: White R h3, Knight e7, Black King h8, Black Pawn g7, h7 gone.
        // FEN: 7k/4N1pp/8/8/8/7R/8/7K w - - 0 1
        // Move: Rh3 -> h7 Checkmate? No, KxH7.
        // Correct Anastasia: Ne7 checks, K moves, R mates.
        // Let's stick to Mate in 1 for simplicity first.
        
        // 3. Queen & King Mate
        fen: "k7/8/1Q6/8/8/8/8/4K3 w - - 0 1", // Stalemate if Black to move!
        // Move to make: Q b6 -> b7 # (supported by K?) No K at e1.
        // Let's use: K at c6, Q at c5. Black K at a8.
        // FEN: k7/8/2K5/2Q5/8/8/8/8 w - - 0 1
        // Move: Qc5 -> c8 or b6?
        // Qc8+ Ka7 ...
        // Move: Qb6#? No.
        // Move: Qc5-a5# ?
        // Correct setup: "8/k7/2K5/8/1Q6/8/8/8 w - - 0 1". (K c6, Q b4). Black Ka7.
        // Move: Qb4-b7#
        fen: "8/k7/2K5/8/1Q6/8/8/8 w - - 0 1",
        solution: { from: {r:4, c:1}, to: {r:1, c:1} }, // Qb4 -> b7 (Rank 4->Rank 7 is row 4->1)
        desc: "Queen & King Mate",
        type: "Mate in 1" 
    },
    {
        // 4. Smothered Mate (Corner)
        fen: "6rk/6pp/8/8/8/8/8/4N2K w - - 0 1",
        // Knight at e1? Needs to be closer.
        // Knight at f7 mate.
        // Setup: N at h6?
        fen: "6rk/7p/6N1/8/8/8/8/7K w - - 0 1", // N g6 Check. h7xg6. Not mate.
        // Smothered needs King trapped.
        // FEN: 6rk/6pp/8/5N2/8/8/8/7K w - - 0 1
        // Move: Nf5-h6+ Kh8 ...
        // Okay simplier:
        // FEN: 6rk/6pp/4N3/8/8/8/8/7K w - - 0 1
        // Move: N-f7# ?
        // e6 (Row 2, col 4). f7 (Row 1, col 5).
        solution: { from: {r:2, c:4}, to: {r:1, c:5} },
        desc: "Smothered Mate",
        type: "Mate in 1"
    },
    {
        // 5. Rook vs King (Box)
        fen: "3k4/3R4/3K4/8/8/8/8/8 w - - 0 1", // Already check?
        // Setup: K d6, R d7. Black K d8.
        // Black to move? No White to move.
        // Moves: Rd7-a7 (Threat mate), etc.
        // Let's do simple RMate.
        // FEN: 8/3k4/3R4/3K4/8/8/8/8 w - - 0 1
        // Mate pattern: Rook on h8.
        // FEN: k7/2R5/1K6/8/8/8/8/8 w - - 0 1
        // Move: Rc7-c8#
        fen: "k7/2R5/1K6/8/8/8/8/8 w - - 0 1",
        solution: { from: {r:1, c:2}, to: {r:0, c:2} }, // c7 -> c8
        desc: "Rook Mate",
        type: "Mate in 1"
    }
];

function fenToBoard(fen) {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const [position] = fen.split(' ');
    let row = 0, col = 0;
    
    for (const char of position) {
        if (char === '/') {
            row++;
            col = 0;
        } else if (/\d/.test(char)) {
            col += parseInt(char);
        } else {
            // Note: Map standard FEN chars to our internal logic
            // Our logic: 'p' is BLACK pawn, 'P' is WHITE pawn.
            board[row][col] = char;
            col++;
        }
    }
    return board;
}


// --- Initialization ---

window.onload = function() {
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 500);
    }, 1500); // 1.5s loader
    init();
};

// --- Dashboard UI Elements ---
const dashThemeOptions = document.querySelectorAll('#dash-theme-options .theme-preview');
const dashPieceOptions = document.querySelectorAll('#dash-piece-options .piece-preview');
const miniBoard = document.getElementById('mini-board');
const feedbackBtn = document.getElementById('feedback-btn');

function init() {
    setupNavigation();
    setupAuth();
    setupDashboardInteractions();
    setupGameListeners();
    generatePuzzleLevels();
    setupPuzzleLogic();
    setupFunChess();
}

// --- Dashboard Interactions ---
function setupDashboardInteractions() {
    // Time Options Selection
    const timeOptions = document.querySelectorAll('.time-option');
    const selectedTimeDisplay = document.getElementById('selected-time-display');
    
    timeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            timeOptions.forEach(t => t.classList.remove('active'));
            opt.classList.add('active');
            
            const time = opt.dataset.time;
            if (time === 'unlimited') {
                gameConfig.time = 'unlimited';
                selectedTimeDisplay.textContent = 'No Limit';
            } else {
                gameConfig.time = parseInt(time);
                selectedTimeDisplay.textContent = (parseInt(time) / 60) + ' min';
            }
        });
    });
    
    // Play with Friend Button
    const startFriendGame = document.getElementById('start-friend-game');
    const friendNameInput = document.getElementById('friend-name');
    const yourNameInput = document.getElementById('your-name');
    
    console.log('Setting up play buttons:', { startFriendGame, friendNameInput, yourNameInput });
    
    if (startFriendGame) {
        startFriendGame.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Play with Friend button clicked!');
            
            const friendName = friendNameInput ? friendNameInput.value.trim() || 'Friend' : 'Friend';
            const yourName = yourNameInput ? yourNameInput.value.trim() || 'Nikhil' : 'Nikhil';
            
            // Reset fun game config for normal play
            funGameConfig.enabled = false;
            
            // Set game configuration from dashboard
            gameConfig.mode = 'pvp';
            gameConfig.playerName = yourName;
            gameConfig.opponentName = friendName;
            // Time is already set by time option clicks
            
            console.log('Game config:', gameConfig);
            
            // Hide dashboard, show game container and start game directly
            if (dashboardView) dashboardView.classList.add('hidden');
            if (chessAppContainer) chessAppContainer.classList.remove('hidden');
            startGame(); // Start game directly without modal
        });
    } else {
        console.error('start-friend-game button not found!');
    }
    
    // Play with Bot Button
    const startBotGame = document.getElementById('start-bot-game');
    const botDifficulty = document.getElementById('bot-difficulty');
    
    if (startBotGame) {
        startBotGame.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Play with Bot button clicked!');
            
            const yourName = yourNameInput ? yourNameInput.value.trim() || 'Nikhil' : 'Nikhil';
            const difficulty = botDifficulty ? botDifficulty.value : 'medium';
            
            // Reset fun game config for normal play
            funGameConfig.enabled = false;
            
            // Set game configuration from dashboard
            gameConfig.mode = 'bot';
            gameConfig.playerName = yourName;
            gameConfig.opponentName = 'Bot (' + difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ')';
            gameConfig.botDifficulty = difficulty;
            // Time is already set by time option clicks
            
            console.log('Game config:', gameConfig);
            
            // Hide dashboard, show game container and start game directly
            if (dashboardView) dashboardView.classList.add('hidden');
            if (chessAppContainer) chessAppContainer.classList.remove('hidden');
            startGame(); // Start game directly without modal
        });
    } else {
        console.error('start-bot-game button not found!');
    }
    
    // Theme options on dashboard (if customization section exists)
    const dashThemeOptions = document.querySelectorAll('#dash-theme-options .theme-preview');
    dashThemeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            dashThemeOptions.forEach(t => t.classList.remove('active'));
            opt.classList.add('active');
            const theme = opt.dataset.theme;
            const light = getThemeColor(theme, 'light');
            const dark = getThemeColor(theme, 'dark');
            document.documentElement.style.setProperty('--board-light', light);
            document.documentElement.style.setProperty('--board-dark', dark);
        });
    });

    // Feedback Modal
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedbackBtn = document.getElementById('close-feedback-btn');
    const submitFeedbackBtn = document.getElementById('submit-feedback-btn');
    
    if (feedbackBtn && feedbackModal) {
        feedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.add('active');
        });
        
        closeFeedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
        });
        
        submitFeedbackBtn.addEventListener('click', () => {
            const name = document.getElementById('feedback-name').value.trim();
            const email = document.getElementById('feedback-email').value.trim();
            const type = document.getElementById('feedback-type').value;
            const message = document.getElementById('feedback-message').value.trim();
            
            if (!message) {
                alert('Please enter a message!');
                return;
            }
            
            // Here you would normally send this to a server
            console.log('Feedback submitted:', { name, email, type, message });
            
            // Show thank you toast
            showToast('📨 Thank You!', 'Your feedback has been received. We appreciate your input!', () => {
                feedbackModal.classList.remove('active');
                // Clear form
                document.getElementById('feedback-name').value = '';
                document.getElementById('feedback-email').value = '';
                document.getElementById('feedback-message').value = '';
            });
        });
    }

    
    // Learn Cards Click - Use event delegation for better reliability
    document.querySelectorAll('.learn-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const piece = card.dataset.piece;
            if (piece) {
                startTutorial(piece);
            }
        });
    });

    // Exit Learn Button
    exitLearnBtn.addEventListener('click', () => {
        learnInterface.classList.add('hidden');
        learnView.classList.remove('hidden');
    });

    // Next Lesson Button
    nextLessonBtn.addEventListener('click', () => {
        currentStepIndex++;
        const data = TUTORIALS[currentTutorial];
        if(currentStepIndex < data.steps.length) {
            loadTutorialStep();
        } else {
            showToast("🎉 Tutorial Complete!", "Great job! You've mastered the " + data.name + "!", () => {
                learnInterface.classList.add('hidden');
                learnView.classList.remove('hidden');
            });
        }
    });

    // Next Rule (Carousel)
    if(nextRuleBtn) {
        nextRuleBtn.addEventListener('click', () => {
            const data = TUTORIALS[currentTutorial];
            if(!data) return;
            
            if (currentRuleIndex < data.rules.length - 1) {
                currentRuleIndex++;
            } else {
                currentRuleIndex = 0;
            }
            updateRuleDisplay();
            
            // Sync Board Step with Rule
            if (data.steps && data.steps.length > 0) {
                currentStepIndex = currentRuleIndex % data.steps.length;
                loadTutorialStep();
            }
        });
    }
}

// Custom Toast/Alert Function
function showToast(title, message, callback) {
    const overlay = document.getElementById('toast-overlay');
    const toast = document.getElementById('custom-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    const toastBtn = document.getElementById('toast-btn');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    overlay.classList.add('show');
    toast.classList.add('show');
    
    toastBtn.onclick = () => {
        overlay.classList.remove('show');
        toast.classList.remove('show');
        if (callback) callback();
    };
}

function startTutorial(pieceType) {
    if(!TUTORIALS[pieceType]) { alert("Coming soon!"); return; }
    
    const data = TUTORIALS[pieceType];
    
    learnView.classList.add('hidden');
    learnInterface.classList.remove('hidden');
    
    currentTutorial = pieceType;
    currentStepIndex = 0;
    currentRuleIndex = 0;
    
    // Update Header
    document.getElementById('rules-icon').className = `fas ${data.icon}`;
    document.getElementById('rules-piece-name').textContent = data.name;
    
    // Update Rule Display
    updateRuleDisplay();
    
    loadTutorialStep();
}

function updateRuleDisplay() {
    const data = TUTORIALS[currentTutorial];
    if (!data) return;
    
    currentRuleText.textContent = data.rules[currentRuleIndex];
    
    // Update button text
    if (currentRuleIndex >= data.rules.length - 1) {
        nextRuleBtn.innerHTML = 'Next Rule (Loop) <i class="fas fa-undo"></i>';
    } else {
        nextRuleBtn.innerHTML = 'Next Rule <i class="fas fa-arrow-right"></i>';
    }
}

function loadTutorialStep() {
    const data = TUTORIALS[currentTutorial];
    const step = data.steps[currentStepIndex];
    
    learnTitle.textContent = `Learning: ${data.name}`;
    document.getElementById('learn-step').textContent = `Step ${currentStepIndex + 1}/${data.steps.length}`;
    learnInstruction.textContent = step.text;
    nextLessonBtn.classList.add('hidden');
    
    renderLearnBoard(step);
}

function renderLearnBoard(step) {
    learnBoardEl.innerHTML = '';
    
    // Calculate all valid move squares for this piece type
    const validMoves = getValidMovesForTutorial(currentTutorial, step.start);
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.r = row;
            square.dataset.c = col;
            
            // Check if this is a valid move square - add highlight
            const isValidMove = validMoves.some(m => m.r === row && m.c === col);
            if (isValidMove) {
                square.classList.add('square-highlight');
            }
            
            // Render the piece at start position with GLOW HIGHLIGHT
            if (row === step.start.r && col === step.start.c) {
                const pName = currentTutorial.toLowerCase() === 'knight' ? 'n' : currentTutorial.charAt(0);
                square.innerHTML = `<div class="piece piece-white piece-highlight" id="tutorial-piece">${PIECES[pName]}</div>`;
                square.style.zIndex = "50"; // Bring piece square forward
            }
            
            // Show move path indicators on valid squares (except target)
            if (isValidMove && !(row === step.target.r && col === step.target.c)) {
                const pathIndicator = document.createElement('div');
                pathIndicator.className = 'move-path';
                square.appendChild(pathIndicator);
            }
            
            // Render the target with star and arrow
            if (row === step.target.r && col === step.target.c) {
                const star = document.createElement('div');
                star.className = 'target-star';
                square.appendChild(star);
                
                // Add arrow pointing down
                const arrow = document.createElement('div');
                arrow.className = 'move-arrow';
                arrow.innerHTML = '<i class="fas fa-hand-point-down"></i>';
                square.appendChild(arrow);
                
                // Click handler for target
                square.addEventListener('click', () => {
                    // Animate piece "jumping" to target
                    const pieceEl = document.getElementById('tutorial-piece');
                    if (pieceEl) {
                        pieceEl.classList.add('piece-animate');
                        
                        // After animation, move piece visually
                        setTimeout(() => {
                            pieceEl.classList.remove('piece-animate');
                            const pName = currentTutorial.match(/knight/i) ? 'n' : currentTutorial.charAt(0);
                            square.innerHTML = `<div class="piece piece-white">${PIECES[pName]}</div>`;
                            
                            // Clear old position
                            const oldSquare = learnBoardEl.querySelector(`[data-r="${step.start.r}"][data-c="${step.start.c}"]`);
                            if (oldSquare) oldSquare.innerHTML = '';
                            
                            learnInstruction.textContent = "✓ Correct! Well done.";
                            nextLessonBtn.classList.remove('hidden');
                        }, 800);
                    }
                });
            }
            
            learnBoardEl.appendChild(square);
        }
    }
}

// Helper: Get valid moves for tutorial visualization
function getValidMovesForTutorial(pieceType, start) {
    const moves = [];
    const {r, c} = start;
    
    switch(pieceType) {
        case 'pawn':
            // Forward moves
            if (r > 0) moves.push({r: r-1, c});
            if (r === 6) moves.push({r: r-2, c});
            // Diagonal captures (show as potential)
            if (r > 0 && c > 0) moves.push({r: r-1, c: c-1});
            if (r > 0 && c < 7) moves.push({r: r-1, c: c+1});
            break;
        case 'knight':
            [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) moves.push({r: nr, c: nc});
            });
            break;
        case 'bishop':
            [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const nr = r + dr*i, nc = c + dc*i;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) moves.push({r: nr, c: nc});
                }
            });
            break;
        case 'rook':
            [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const nr = r + dr*i, nc = c + dc*i;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) moves.push({r: nr, c: nc});
                }
            });
            break;
        case 'queen':
            [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const nr = r + dr*i, nc = c + dc*i;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) moves.push({r: nr, c: nc});
                }
            });
            break;
        case 'king':
            [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) moves.push({r: nr, c: nc});
            });
            break;
    }
    return moves;
}

function generatePuzzleLevels() {
    levelGrid.innerHTML = '';
    const uniquePuzzleCount = REAL_PUZZLES.length; // Only 5 unique puzzles
    
    for(let i=1; i<=uniquePuzzleCount; i++) {
        const btn = document.createElement('div');
        btn.className = 'level-btn';
        btn.textContent = i;
        btn.style.borderColor = '#00C851'; 
        btn.addEventListener('click', () => startPuzzle(i));
        levelGrid.appendChild(btn);
    }
    
    // Add "Coming Soon" placeholder
    const comingSoonDiv = document.createElement('div');
    comingSoonDiv.className = 'coming-soon-box';
    comingSoonDiv.innerHTML = '<i class="fas fa-lock"></i><span>More Puzzles Coming Soon!</span>';
    levelGrid.appendChild(comingSoonDiv);
}

function startPuzzle(level) {
    puzzlesView.classList.add('hidden');
    puzzleInterface.classList.remove('hidden');
    
    // Select puzzle
    const puzzleIndex = (level - 1) % REAL_PUZZLES.length;
    const puzzleData = REAL_PUZZLES[puzzleIndex];
    
    puzzleState.level = level;
    puzzleState.selected = null;
    puzzleState.solved = false;
    puzzleState.data = puzzleData;
    puzzleState.board = fenToBoard(puzzleData.fen);
    puzzleState.possibleMoves = []; 

    puzzleTitle.textContent = `Level ${level}: ${puzzleData.type}`;
    puzzleStatus.textContent = puzzleData.desc;
    puzzleStatus.style.color = "#ccc"; 

    renderPuzzleBoardState();
}

function renderPuzzleBoardState() {
    puzzleBoardEl.innerHTML = '';
    const board = puzzleState.board;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.r = row;
            square.dataset.c = col;
            square.addEventListener('click', (e) => onPuzzleSquareClick(row, col, e));
            
            const piece = board[row][col];
            if (piece) {
                const isWhitePiece = piece === piece.toUpperCase();
                const pieceClass = isWhitePiece ? 'piece-white' : 'piece-black';
                const pieceSymbol = PIECES[piece.toLowerCase()]; 
                square.innerHTML = `<div class="piece ${pieceClass}">${pieceSymbol}</div>`;
            }
            
            // Highlight Selected
            if(puzzleState.selected && puzzleState.selected.r === row && puzzleState.selected.c === col) {
                square.classList.add('selected');
            }
            
            // Highlight Moves
            puzzleState.possibleMoves.forEach(move => {
                if (move.toRow === row && move.toCol === col) {
                    if (piece) square.classList.add('capture-move'); 
                    else square.classList.add('valid-move');
                }
            });
            
            puzzleBoardEl.appendChild(square);
        }
    }
}

function onPuzzleSquareClick(r, c, e) {
    if(puzzleState.solved) return;
    
    const board = puzzleState.board;
    const clickedPiece = board[r][c];
    const isWhitePiece = clickedPiece && clickedPiece === clickedPiece.toUpperCase();
    
    // 1. Select White Piece
    if (clickedPiece && isWhitePiece) {
        puzzleState.selected = {r, c};
        puzzleState.possibleMoves = getSafeMoves({row: r, col: c}, board);
        renderPuzzleBoardState();
        return;
    }
    
    // 2. Move to target
    if (puzzleState.selected) {
        const isValidMove = puzzleState.possibleMoves.some(m => m.toRow === r && m.toCol === c);
        
        if (isValidMove) {
            const sol = puzzleState.data.solution;
            const from = puzzleState.selected;
            
            // Check if solution
            const isSolution = (from.r === sol.from.r && from.c === sol.from.c && r === sol.to.r && c === sol.to.c);
            
            if (isSolution) {
                // Execute and Win
                board[r][c] = board[from.r][from.c];
                board[from.r][from.c] = null;
                puzzleState.selected = null;
                puzzleState.possibleMoves = [];
                renderPuzzleBoardState();
                showPuzzleFeedback(true);
            } else {
                // Wrong move (but valid)
                puzzleState.selected = null;
                puzzleState.possibleMoves = [];
                renderPuzzleBoardState();
                showPuzzleFeedback(false);
            }
        } 
        // If invalid move (clicked random square), just deselect or ignore
        else if (!clickedPiece) {
             puzzleState.selected = null;
             puzzleState.possibleMoves = [];
             renderPuzzleBoardState();
        }
    }
}

function showPuzzleFeedback(success) {
    puzzleFeedbackModal.classList.add('active');
    puzzleFeedbackModal.classList.remove('success', 'fail');
    
    if (success) {
        puzzleFeedbackModal.classList.add('success');
        puzzleFeedbackTitle.textContent = "Correct!";
        puzzleFeedbackMessage.textContent = "Outstanding Move! Level Complete.";
        nextLevelBtn.classList.remove('hidden');
        retryLevelBtn.classList.add('hidden');
        puzzleState.solved = true;
    } else {
        puzzleFeedbackModal.classList.add('fail');
        puzzleFeedbackTitle.textContent = "Incorrect";
        puzzleFeedbackMessage.textContent = "That move is valid, but not the solution.";
        nextLevelBtn.classList.add('hidden');
        retryLevelBtn.classList.remove('hidden');
    }
}

function setupPuzzleLogic() {
    exitPuzzleBtn.addEventListener('click', () => {
        puzzleInterface.classList.add('hidden');
        puzzlesView.classList.remove('hidden');
    });
    
    nextLevelBtn.addEventListener('click', () => {
        puzzleFeedbackModal.classList.remove('active');
        startPuzzle(puzzleState.level + 1);
    });
    
    retryLevelBtn.addEventListener('click', () => {
        puzzleFeedbackModal.classList.remove('active');
        // Reset board logic
        startPuzzle(puzzleState.level);
    });
    
    puzzleMenuBtn.addEventListener('click', () => {
        puzzleFeedbackModal.classList.remove('active');
        puzzleInterface.classList.add('hidden');
        puzzlesView.classList.remove('hidden');
    });
}


function setupNavigation() {
    const views = [dashboardView, puzzlesView, learnView, watchView, chessAppContainer, learnInterface, puzzleInterface];
    const navWatch = document.getElementById('nav-watch');

    const showView = (view, navEl) => {
        // Hide ALL views including interfaces
        views.forEach(v => v ? v.classList.add('hidden') : null);
        // Show target
        if(view) view.classList.remove('hidden');
        
        // Update Nav Active
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        if(navEl) navEl.classList.add('active');
        
        // Hide Game specific if open
        if(gameArea) gameArea.classList.add('hidden');
        if(startScreen) startScreen.classList.remove('active');
    };

    // Navigation event listeners with null checks
    if (navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); showView(dashboardView, navDashboard); });
    if (navPuzzles) navPuzzles.addEventListener('click', (e) => { e.preventDefault(); showView(puzzlesView, navPuzzles); });
    if (navLearn) navLearn.addEventListener('click', (e) => { e.preventDefault(); showView(learnView, navLearn); });
    if (navWatch) navWatch.addEventListener('click', (e) => { e.preventDefault(); showView(watchView, navWatch); });

    // Dashboard "Play" Buttons (heroPlayBtn may not exist)
    if (heroPlayBtn) {
        heroPlayBtn.addEventListener('click', () => {
            showView(chessAppContainer, null);
            if (startScreen) startScreen.classList.add('active');
        });
    }

    if (navPlay) {
        navPlay.addEventListener('click', (e) => {
            e.preventDefault();
            showView(chessAppContainer, null);
            if (startScreen) startScreen.classList.add('active');
        });
    }

    // Return to dashboard
    function closeGameSetup() {
        if (gameState.timerInterval) clearInterval(gameState.timerInterval);
        if (chessAppContainer) chessAppContainer.classList.add('hidden');
        if (dashboardView) dashboardView.classList.remove('hidden');
    }

    if (cancelGameBtn) cancelGameBtn.addEventListener('click', closeGameSetup);
    
    // Main Menu inside Game returns to Dashboard if game not active, or start screen
    if (mainMenuBtn) {
        mainMenuBtn.addEventListener('click', () => {
            if (gameOverModal) gameOverModal.classList.remove('active');
            closeGameSetup();
        });
    }
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            if(confirm('Quit to Dashboard?')) {
                if (gameOverModal) gameOverModal.classList.remove('active');
                closeGameSetup();
            }
        });
    }
    
    // Mobile Navigation
    const mobileNavDashboard = document.getElementById('mobile-nav-dashboard');
    const mobileNavPuzzles = document.getElementById('mobile-nav-puzzles');
    const mobileNavLearn = document.getElementById('mobile-nav-learn');
    const mobileNavWatch = document.getElementById('mobile-nav-watch');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    
    const updateMobileNav = (activeId) => {
        mobileNavLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.getElementById(activeId);
        if (activeLink) activeLink.classList.add('active');
    };
    
    if (mobileNavDashboard) {
        mobileNavDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            showView(dashboardView, navDashboard);
            updateMobileNav('mobile-nav-dashboard');
        });
    }
    
    if (mobileNavPuzzles) {
        mobileNavPuzzles.addEventListener('click', (e) => {
            e.preventDefault();
            showView(puzzlesView, navPuzzles);
            updateMobileNav('mobile-nav-puzzles');
        });
    }
    
    if (mobileNavLearn) {
        mobileNavLearn.addEventListener('click', (e) => {
            e.preventDefault();
            showView(learnView, navLearn);
            updateMobileNav('mobile-nav-learn');
        });
    }
    
    if (mobileNavWatch) {
        mobileNavWatch.addEventListener('click', (e) => {
            e.preventDefault();
            showView(watchView, navWatch);
            updateMobileNav('mobile-nav-watch');
        });
    }
}

function setupAuth() {
    // Mock Auth
    const toggleAuth = (loggedIn) => {
        if (loggedIn) {
            if (authSection) authSection.classList.add('hidden');
            if (userSection) userSection.classList.remove('hidden');
            if (displayUsername) displayUsername.textContent = "Grandmaster";
            if (playerNameInput) playerNameInput.value = "Grandmaster";
        } else {
            if (authSection) authSection.classList.remove('hidden');
            if (userSection) userSection.classList.add('hidden');
        }
    };

    if (loginBtn) loginBtn.addEventListener('click', () => toggleAuth(true));
    if (signupBtn) signupBtn.addEventListener('click', () => toggleAuth(true));
    if (logoutBtn) logoutBtn.addEventListener('click', () => toggleAuth(false));
}

function setupGameListeners() {
    // Theme
    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            themeOptions.forEach(t => t.classList.remove('active'));
            opt.classList.add('active');
            gameConfig.theme = opt.dataset.theme;
        });
    });

    // Mode
    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(e.target.closest('.toggle-options').dataset.setting === 'mode') {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameConfig.mode = btn.dataset.value;
            }
        });
    });

    // Modals
    customRulesBtn.addEventListener('click', () => customRulesModal.classList.add('active'));
    closeRulesBtn.addEventListener('click', () => {
        customRulesModal.classList.remove('active');
        gameConfig.handicap = handicapSelect.value;
    });

    // Start
    startGameBtn.addEventListener('click', () => {
        gameConfig.time = timeSelect.value;
        gameConfig.playerName = playerNameInput.value || 'Player 1';
        startGame();
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        if(confirm('Restart the game?')) startGame();
    });

    playAgainBtn.addEventListener('click', startGame);
}

// --- Game Logic (Re-used) ---

function startGame() {
    console.log('startGame called with config:', gameConfig);
    
    // Apply theme
    document.documentElement.style.setProperty('--board-light', getThemeColor(gameConfig.theme, 'light'));
    document.documentElement.style.setProperty('--board-dark', getThemeColor(gameConfig.theme, 'dark'));

    // Determine time (default to 600 if not set)
    const timeValue = gameConfig.time === 'unlimited' ? -1 : (parseInt(gameConfig.time) || 600);
    
    // Reset game state
    gameState = {
        board: createInitialBoard(),
        turn: 'white',
        gameOver: false,
        check: false,
        selectedSquare: null,
        possibleMoves: [],
        lastMove: null,
        scores: { white: 0, black: 0 },
        captured: { white: [], black: [] },
        whiteTime: timeValue,
        blackTime: timeValue,
        timerInterval: null
    };

    if(gameConfig.handicap !== 'none') applyHandicap(gameConfig.handicap);

    // UI State - hide modals and show game
    if (startScreen) startScreen.classList.remove('active');
    if (gameOverModal) gameOverModal.classList.remove('active');
    if (gameArea) gameArea.classList.remove('hidden');
    
    // Update player names
    if (playerNameDisplay) playerNameDisplay.textContent = gameConfig.playerName || 'Player 1';
    if (opponentNameDisplay) opponentNameDisplay.textContent = gameConfig.opponentName || 'Player 2';
    
    // Clear Labels
    updateScoreUI();
    if (lastMoveDisplay) lastMoveDisplay.textContent = "Last Move: -";
    if (moveHistoryList) moveHistoryList.innerHTML = ''; // Clear history
    updateTimerDisplay();

    createBoardUI();
    startTimer();
    
    console.log('Game started successfully');
}

function getThemeColor(theme, type) {
    const themes = {
        wood: { light: '#eecfa1', dark: '#8b4513' },
        ocean: { light: '#a8d0e6', dark: '#24305e' },
        midnight: { light: '#eee', dark: '#333' },
        forest: { light: '#f1f2f6', dark: '#7bed9f' }
    };
    return themes[theme][type];
}

function applyHandicap(type) {
    const remove = (r, c) => gameState.board[r][c] = null;
    if (type === 'w_a2') remove(6, 0);
    if (type === 'w_h2') remove(6, 7);
    if (type === 'w_q')  remove(7, 3);
    if (type === 'b_a7') remove(1, 0);
    if (type === 'b_h7') remove(1, 7);
    if (type === 'b_q')  remove(0, 3);
}

function createInitialBoard() {
    // Standard board layout with pawns in correct positions
    const board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    
    // Only modify pawn positions if funGameConfig is enabled
    if (funGameConfig.enabled && funGameConfig.pawnStartRow !== 2) {
        // Clear standard pawn rows
        for (let col = 0; col < 8; col++) {
            board[1][col] = null;
            board[6][col] = null;
        }
        
        // Place pawns at custom positions
        const startRow = funGameConfig.pawnStartRow;
        let blackPawnRow = 1;
        let whitePawnRow = 6;
        
        if (startRow === 3) {
            blackPawnRow = 2;
            whitePawnRow = 5;
        } else if (startRow === 4) {
            blackPawnRow = 3;
            whitePawnRow = 4;
        }
        
        for (let col = 0; col < 8; col++) {
            board[blackPawnRow][col] = 'p';
            board[whitePawnRow][col] = 'P';
        }
    }
    
    return board;
}


function createBoardUI() {
    chessboard.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', onSquareClick);
            
            const piece = gameState.board[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${isWhite(piece) ? 'piece-white' : 'piece-black'}`;
                pieceEl.textContent = PIECES[piece.toLowerCase()];
                square.appendChild(pieceEl);
            }
            chessboard.appendChild(square);
        }
    }
}

function updateBoardUI() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(sq => {
        const row = parseInt(sq.dataset.row);
        const col = parseInt(sq.dataset.col);
        const piece = gameState.board[row][col];
        
        sq.innerHTML = ''; 
        sq.classList.remove('selected', 'valid-move', 'capture-move', 'check', 'last-move');

        if (piece) {
            const pieceEl = document.createElement('div');
            pieceEl.className = `piece ${isWhite(piece) ? 'piece-white' : 'piece-black'}`;
            pieceEl.textContent = PIECES[piece.toLowerCase()];
            sq.appendChild(pieceEl);
        }

        if (gameState.selectedSquare && gameState.selectedSquare.row === row && gameState.selectedSquare.col === col) {
            sq.classList.add('selected');
        }
        if (gameState.lastMove && ((gameState.lastMove.fromRow === row && gameState.lastMove.fromCol === col) || (gameState.lastMove.toRow === row && gameState.lastMove.toCol === col))) {
            sq.classList.add('last-move');
        }
        if (piece && piece.toLowerCase() === 'k' && gameState.check) {
            if (isWhite(piece) === (gameState.turn === 'white')) sq.classList.add('check');
        }

        gameState.possibleMoves.forEach(move => {
            if (move.toRow === row && move.toCol === col) {
                if (piece) sq.classList.add('capture-move');
                else sq.classList.add('valid-move');
            }
        });
    });
    updateScoreUI();
}

function updateScoreUI() {
    playerScoreEl.textContent = `+${gameState.scores.white}`;
    opponentScoreEl.textContent = `+${gameState.scores.black}`;
    playerCapturedEl.textContent = gameState.captured.white.map(p => PIECES[p]).join('');
    opponentCapturedEl.textContent = gameState.captured.black.map(p => PIECES[p]).join('');
}

function onSquareClick(e) {
    if (gameState.gameOver) return;
    if (gameConfig.mode === 'bot' && gameState.turn === 'black') return;

    let target = e.target;
    while (!target.classList.contains('square') && target.parentElement) target = target.parentElement;
    
    const row = parseInt(target.dataset.row);
    const col = parseInt(target.dataset.col);
    const clickedPiece = gameState.board[row][col];

    if (gameState.selectedSquare) {
        const move = gameState.possibleMoves.find(m => m.toRow === row && m.toCol === col);
        if (move) { return executeMove(move); }
    }

    if (clickedPiece && isMyPiece(clickedPiece)) {
        gameState.selectedSquare = { row, col };
        gameState.possibleMoves = getSafeMoves({ row, col }, gameState.board);
        updateBoardUI();
    } else {
        gameState.selectedSquare = null;
        gameState.possibleMoves = [];
        updateBoardUI();
    }
}

function isWhite(piece) { return piece === piece.toUpperCase(); }
function isMyPiece(piece) {
    if (!piece) return false;
    return gameState.turn === 'white' ? isWhite(piece) : !isWhite(piece);
}

function executeMove(move) {
    const { fromRow, fromCol, toRow, toCol } = move;
    const piece = gameState.board[fromRow][fromCol];
    const targetPiece = gameState.board[toRow][toCol];

    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = null;
    
    if (piece.toLowerCase() === 'p') {
        if ((isWhite(piece) && toRow === 0) || (!isWhite(piece) && toRow === 7)) {
            gameState.board[toRow][toCol] = isWhite(piece) ? 'Q' : 'q';
        }
    }

    if (targetPiece) {
        const val = PIECE_VALUES[targetPiece.toLowerCase()];
        if (isWhite(piece)) {
            gameState.scores.white += val;
            gameState.captured.white.push(targetPiece.toLowerCase());
        } else {
            gameState.scores.black += val;
            gameState.captured.black.push(targetPiece.toLowerCase());
        }
    }

    gameState.lastMove = move;
    const notation = getAlgebraic(move);
    if(lastMoveDisplay) lastMoveDisplay.textContent = `Last Move: ${notation}`;
    
    // Add to history sidebar
    addMoveToHistory(notation, gameState.turn === 'white');

    gameState.selectedSquare = null;
    gameState.possibleMoves = [];
    gameState.turn = gameState.turn === 'white' ? 'black' : 'white';
    gameState.check = isCheck(gameState.turn, gameState.board);
    
    if (isCheckmate(gameState.turn, gameState.board)) {
        updateBoardUI();
        endGame(`${gameState.turn === 'white' ? 'Black' : 'White'} Wins by Checkmate!`);
        return;
    }
    
    if (isStalemate(gameState.turn, gameState.board)) {
        endGame('Draw by Stalemate!');
        return;
    }

    updateBoardUI();

    if (gameConfig.mode === 'bot' && gameState.turn === 'black') {
        setTimeout(makeBotMove, 500);
    }
}

function getSafeMoves(pos, board) {
    const moves = getPseudoLegalMoves(pos, board);
    return moves.filter(move => {
        const tempBoard = board.map(r => [...r]);
        tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = null;
        return !isCheck(isWhite(board[pos.row][pos.col]) ? 'white' : 'black', tempBoard);
    });
}

function getPseudoLegalMoves(pos, board) {
    const moves = [];
    const piece = board[pos.row][pos.col];
    if (!piece) return moves;

    const type = piece.toLowerCase();
    const white = isWhite(piece);
    
    // Get custom rule for this piece type (if fun game enabled)
    const pieceRule = funGameConfig.enabled ? funGameConfig.pieceRules[getPieceName(type)] : 'standard';
    
    // Standard directions
    const directions = {
        'r': [[0,1], [0,-1], [1,0], [-1,0]],
        'b': [[1,1], [1,-1], [-1,1], [-1,-1]],
        'n': [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],
        'q': [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]],
        'k': [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]]
    };

    // === PAWN MOVES ===
    if (type === 'p') {
        const dir = white ? -1 : 1;
        // Determine starting row based on funGameConfig
        let startRow = white ? 6 : 1;
        if (funGameConfig.enabled) {
            const pRow = funGameConfig.pawnStartRow;
            if (pRow === 3) startRow = white ? 5 : 2;
            else if (pRow === 4) startRow = white ? 4 : 3;
        }
        
        if (pieceRule === 'standard' || pieceRule === 'sideways' || pieceRule === 'backward') {
            // Forward moves
            if (pos.row + dir >= 0 && pos.row + dir < 8 && !board[pos.row + dir][pos.col]) {
                moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: pos.row + dir, toCol: pos.col });
                if (pos.row === startRow && !board[pos.row + dir * 2][pos.col]) {
                    moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: pos.row + dir * 2, toCol: pos.col });
                }
            }
            // Diagonal captures
            [[dir, 1], [dir, -1]].forEach(([dr, dc]) => {
                const nr = pos.row + dr, nc = pos.col + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    const target = board[nr][nc];
                    if (target && isWhite(target) !== white) {
                        moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: nr, toCol: nc });
                    }
                }
            });
        }
        
        // Sideways movement
        if (pieceRule === 'sideways') {
            [[0, 1], [0, -1]].forEach(([dr, dc]) => {
                const nr = pos.row + dr, nc = pos.col + dc;
                if (nc >= 0 && nc < 8) {
                    const target = board[nr][nc];
                    if (!target || isWhite(target) !== white) {
                        moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: nr, toCol: nc });
                    }
                }
            });
        }
        
        // Backward movement
        if (pieceRule === 'backward') {
            const backDir = white ? 1 : -1;
            if (pos.row + backDir >= 0 && pos.row + backDir < 8) {
                const target = board[pos.row + backDir][pos.col];
                if (!target) {
                    moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: pos.row + backDir, toCol: pos.col });
                }
            }
        }
        
        // Diagonal movement (like bishop, but 1 square)
        if (pieceRule === 'diagonal') {
            [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
                const nr = pos.row + dr, nc = pos.col + dc;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    const target = board[nr][nc];
                    if (!target || isWhite(target) !== white) {
                        moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: nr, toCol: nc });
                    }
                }
            });
        }
        
    // === KNIGHT MOVES ===
    } else if (type === 'n') {
        let knightDirs = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
        
        if (pieceRule === 'extended') {
            // Extended L: 3+1 instead of 2+1
            knightDirs = [[3,1],[3,-1],[-3,1],[-3,-1],[1,3],[1,-3],[-1,3],[-1,-3]];
        }
        
        knightDirs.forEach(([dr, dc]) => {
            const r = pos.row + dr, c = pos.col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const target = board[r][c];
                if (!target || isWhite(target) !== white) {
                    moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                }
            }
        });
        
        // Super knight: also moves like bishop
        if (pieceRule === 'super') {
            [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const r = pos.row + dr*i, c = pos.col + dc*i;
                    if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                    const target = board[r][c];
                    if (!target) {
                        moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                    } else {
                        if (isWhite(target) !== white) moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                        break;
                    }
                }
            });
        }
        
    // === BISHOP MOVES ===
    } else if (type === 'b') {
        const maxDist = pieceRule === 'limited' ? 3 : 7;
        const canJump = pieceRule === 'jumping';
        
        [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
            for (let i = 1; i <= maxDist; i++) {
                const r = pos.row + dr*i, c = pos.col + dc*i;
                if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                const target = board[r][c];
                if (!target) {
                    moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                } else {
                    if (isWhite(target) !== white) moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                    if (!canJump) break;
                }
            }
        });
        
    // === ROOK MOVES ===
    } else if (type === 'r') {
        const maxDist = pieceRule === 'limited' ? 5 : 7;
        
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr, dc]) => {
            for (let i = 1; i <= maxDist; i++) {
                const r = pos.row + dr*i, c = pos.col + dc*i;
                if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                const target = board[r][c];
                if (!target) {
                    moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                } else {
                    if (isWhite(target) !== white) moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                    break;
                }
            }
        });
        
        // Diagonal move (1 square only)
        if (pieceRule === 'diagonal') {
            [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
                const r = pos.row + dr, c = pos.col + dc;
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    const target = board[r][c];
                    if (!target || isWhite(target) !== white) {
                        moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                    }
                }
            });
        }
        
    // === QUEEN MOVES ===
    } else if (type === 'q') {
        const maxDist = pieceRule === 'limited' ? 4 : 7;
        
        [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
            for (let i = 1; i <= maxDist; i++) {
                const r = pos.row + dr*i, c = pos.col + dc*i;
                if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                const target = board[r][c];
                if (!target) {
                    moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                } else {
                    if (isWhite(target) !== white) moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                    break;
                }
            }
        });
        
        // Knight moves
        if (pieceRule === 'knight') {
            [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr, dc]) => {
                const r = pos.row + dr, c = pos.col + dc;
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    const target = board[r][c];
                    if (!target || isWhite(target) !== white) {
                        moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                    }
                }
            });
        }
        
    // === KING MOVES ===
    } else if (type === 'k') {
        const maxDist = pieceRule === 'super' ? 2 : 1;
        
        [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr, dc]) => {
            for (let i = 1; i <= maxDist; i++) {
                const r = pos.row + dr*i, c = pos.col + dc*i;
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    const target = board[r][c];
                    if (!target || isWhite(target) !== white) {
                        moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                    }
                    if (target) break; // Can't pass through pieces
                }
            }
        });
        
        // Knight moves
        if (pieceRule === 'knight') {
            [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr, dc]) => {
                const r = pos.row + dr, c = pos.col + dc;
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    const target = board[r][c];
                    if (!target || isWhite(target) !== white) {
                        moves.push({ fromRow: pos.row, fromCol: pos.col, toRow: r, toCol: c });
                    }
                }
            });
        }
    }
    
    return moves;
}

// Helper to get piece name from type
function getPieceName(type) {
    const names = { 'p': 'pawn', 'n': 'knight', 'b': 'bishop', 'r': 'rook', 'q': 'queen', 'k': 'king' };
    return names[type] || 'pawn';
}

function isCheck(color, board) {
    let kingPos = null;
    const isWhiteKing = color === 'white';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.toLowerCase() === 'k' && isWhite(p) === isWhiteKing) {
                kingPos = { row: r, col: c };
                break;
            }
        }
    }
    if (!kingPos) return true;
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && isWhite(p) !== isWhiteKing) {
               const moves = getPseudoLegalMoves({row: r, col: c}, board);
               if (moves.some(m => m.toRow === kingPos.row && m.toCol === kingPos.col)) return true;
            }
        }
    }
    return false;
}

function isCheckmate(color, board) {
    if (!isCheck(color, board)) return false;
    return hasNoMoves(color, board);
}

function isStalemate(color, board) {
    if (isCheck(color, board)) return false;
    return hasNoMoves(color, board);
}

function hasNoMoves(color, board) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && isWhite(p) === (color === 'white')) {
                const moves = getSafeMoves({row: r, col: c}, board);
                if (moves.length > 0) return false;
            }
        }
    }
    return true;
}

function makeBotMove() {
    if (gameState.gameOver) return;
    let allMoves = [];
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            const p = gameState.board[r][c];
            if(p && !isWhite(p)) {
                const moves = getSafeMoves({row: r, col: c}, gameState.board);
                allMoves.push(...moves);
            }
        }
    }

    if(allMoves.length === 0) return;
    let bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    for(let move of allMoves) {
        if(gameState.board[move.toRow][move.toCol]) {
            bestMove = move;
            break; 
        }
    }
    executeMove(bestMove);
}

function getAlgebraic(move) {
    const files = 'abcdefgh';
    return `${files[move.fromCol]}${8-move.fromRow}-${files[move.toCol]}${8-move.toRow}`;
}

function startTimer() {
    // Safety check
    if (!whiteTimer || !blackTimer) return;

    if (gameState.whiteTime === -1) {
        whiteTimer.textContent = '∞';
        blackTimer.textContent = '∞';
        return;
    }
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        if (gameState.turn === 'white') {
            gameState.whiteTime--;
            if (gameState.whiteTime <= 0) endGame('Black Wins (Time)!');
        } else {
            gameState.blackTime--;
            if (gameState.blackTime <= 0) endGame('White Wins (Time)!');
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    if (!whiteTimer || !blackTimer) return;
    if (gameState.whiteTime === -1) return;
    
    const fmt = (t) => {
        if (t < 0) return '00:00';
        const m = Math.floor(t / 60).toString().padStart(2, '0');
        const s = (t % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    whiteTimer.textContent = fmt(gameState.whiteTime);
    blackTimer.textContent = fmt(gameState.blackTime);
}

function endGame(message) {
    gameState.gameOver = true;
    clearInterval(gameState.timerInterval);
    winnerText.textContent = message;
    gameOverModal.classList.add('active');
}

function addMoveToHistory(notation, isWhiteMove) {
    if (!moveHistoryList) return;
    
    if (isWhiteMove) {
        const li = document.createElement('li');
        li.className = 'history-move-row';
        const num = moveHistoryList.children.length + 1;
        li.innerHTML = `<span class="move-number">${num}.</span> <span class="move-white">${notation}</span> <span class="move-black"></span>`;
        moveHistoryList.appendChild(li);
        // Scroll to bottom
        moveHistoryList.scrollTop = moveHistoryList.scrollHeight;
    } else {
        const lastLi = moveHistoryList.lastElementChild;
        if (lastLi) {
            const blackSpan = lastLi.querySelector('.move-black');
            if (blackSpan) blackSpan.textContent = notation;
        }
    }
}

// ==========================================
// SETUP FUN CHESS - Custom Rules Game
// ==========================================
function setupFunChess() {
    // Pawn starting position buttons
    const positionBtns = document.querySelectorAll('.position-btn');
    positionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            positionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            funGameConfig.pawnStartRow = parseInt(btn.dataset.row);
            console.log('Pawn start row set to:', funGameConfig.pawnStartRow);
        });
    });
    
    // Piece rule dropdowns
    const ruleSelects = document.querySelectorAll('.custom-rule-select');
    ruleSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const piece = select.dataset.piece;
            const rule = e.target.value;
            funGameConfig.pieceRules[piece] = rule;
            console.log(`${piece} rule set to:`, rule);
        });
    });
    
    // Start Fun Game button
    const startFunGameBtn = document.getElementById('start-fun-game');
    if (startFunGameBtn) {
        startFunGameBtn.addEventListener('click', () => {
            console.log('Starting custom fun game with config:', funGameConfig);
            
            // Enable fun game mode
            funGameConfig.enabled = true;
            
            // Set game configuration
            gameConfig.mode = 'pvp';
            gameConfig.playerName = 'Player 1';
            gameConfig.opponentName = 'Player 2';
            // Use the selected time from the time controls (if any)
            
            // Hide dashboard, show game container and start game
            if (dashboardView) dashboardView.classList.add('hidden');
            if (chessAppContainer) chessAppContainer.classList.remove('hidden');
            
            startGame();
            
            // Show a toast notification about custom rules
            const activeRules = [];
            for (const [piece, rule] of Object.entries(funGameConfig.pieceRules)) {
                if (rule !== 'standard') {
                    activeRules.push(`${piece.charAt(0).toUpperCase() + piece.slice(1)}: ${rule}`);
                }
            }
            if (funGameConfig.pawnStartRow !== 2) {
                activeRules.push(`Pawns start at row ${funGameConfig.pawnStartRow}`);
            }
            
            if (activeRules.length > 0) {
                setTimeout(() => {
                    showToast('🎮 Custom Rules Active!', activeRules.join(', '), null);
                }, 500);
            }
        });
    }
}


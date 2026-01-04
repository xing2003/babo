// 游戏常量
const BOARD_SIZE = 9;
const CELL_SIZE = 60;
const INITIAL_MOVES = 25; // 改为变量，可在设置中修改
const PLAYER_BLACK = 1; // 黑方（红方）
const PLAYER_WHITE = 2; // 白方（绿方）
const FLOOR_NEUTRAL = 0;
const FLOOR_BLACK = 1;
const FLOOR_WHITE = 2;
const PIECE_NONE = 0;
const PIECE_BLACK = 1;
const PIECE_WHITE = 2;

// 游戏状态
let gameState = {
    board: [], // 棋盘状态（棋子）
    floors: [], // 地板颜色
    currentPlayer: PLAYER_BLACK,
    movesLeft: {
        [PLAYER_BLACK]: INITIAL_MOVES,
        [PLAYER_WHITE]: INITIAL_MOVES
    },
    gameOver: false,
    winner: null,
    history: [], // 用于悔棋
    cursorPos: {
        [PLAYER_BLACK]: {
            row: 2,
            col: 2
        }, // 黑方光标位置
        [PLAYER_WHITE]: {
            row: 6,
            col: 6
        } // 白方光标位置
    },
    firstPlayer: PLAYER_BLACK // 记录先手玩家
};

// 选先手状态
let firstPlayerSelection = {
    selected: PLAYER_BLACK, // 默认红方先手
    isChoosing: true // 是否正在选择先手
};

// 初始化游戏
function initGame() {
    // 初始化棋盘
    gameState.board = [];
    gameState.floors = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        gameState.board[row] = [];
        gameState.floors[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            gameState.board[row][col] = PIECE_NONE;
            gameState.floors[row][col] = FLOOR_NEUTRAL;
        }
    }

    // 根据选择设置先手玩家
    const firstPlayerSelect = document.getElementById('firstPlayerSelect');
    let selectedFirstPlayer = firstPlayerSelect.value;
    
    if (selectedFirstPlayer === 'random') {
        // 随机选择先手
        gameState.firstPlayer = Math.random() < 0.5 ? PLAYER_BLACK : PLAYER_WHITE;
    } else {
        gameState.firstPlayer = parseInt(selectedFirstPlayer);
    }
    
    // 设置当前玩家为先手玩家
    gameState.currentPlayer = gameState.firstPlayer;

    // 重置游戏状态
    gameState.movesLeft[PLAYER_BLACK] = INITIAL_MOVES;
    gameState.movesLeft[PLAYER_WHITE] = INITIAL_MOVES;
    gameState.gameOver = false;
    gameState.winner = null;
    gameState.history = [];
    gameState.cursorPos[PLAYER_BLACK] = {
        row: 2,
        col: 2
    }; // 黑方光标位置
    gameState.cursorPos[PLAYER_WHITE] = {
        row: 6,
        col: 6
    }; // 白方光标位置

    updateStatus();
    updateUI();
    drawBoard();
    
    // 显示谁先手的信息
    if (gameState.firstPlayer === PLAYER_BLACK) {
        showMessage("红方先手！", 1500);
    } else {
        showMessage("绿方先手！", 1500);
    }
}

// 绘制棋盘
function drawBoard() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制棋盘背景
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制地板
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;

            // 设置地板颜色
            switch (gameState.floors[row][col]) {
                case FLOOR_BLACK:
                    ctx.fillStyle = '#ff9999'; // 淡红色
                    break;
                case FLOOR_WHITE:
                    ctx.fillStyle = '#99ffcc'; // 淡绿色
                    break;
                default:
                    ctx.fillStyle = '#666666';
            }

            // 绘制地板
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

            // 绘制地板边框
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }

    // 绘制棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameState.board[row][col] !== PIECE_NONE) {
                const x = col * CELL_SIZE + CELL_SIZE / 2;
                const y = row * CELL_SIZE + CELL_SIZE / 2;
                const radius = CELL_SIZE / 2 - 5;

                // 绘制棋子
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);

                // 设置棋子颜色
                if (gameState.board[row][col] === PLAYER_BLACK) {
                    ctx.fillStyle = '#ff416c'; // 红色代表黑方棋子
                    ctx.shadowColor = 'rgba(255, 65, 108, 0.7)';
                } else {
                    ctx.fillStyle = '#33cc33'; // 绿色代表白方棋子
                    ctx.shadowColor = 'rgba(51, 204, 51, 0.7)';
                }

                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;

                // 绘制棋子边框
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    // 绘制光标（两个光标总是显示）
    if (!gameState.gameOver) {
        // 绘制黑方光标（红色）
        const blackCursor = gameState.cursorPos[PLAYER_BLACK];
        const blackX = blackCursor.col * CELL_SIZE;
        const blackY = blackCursor.row * CELL_SIZE;

        ctx.strokeStyle = '#ff416c'; // 红色光标
        ctx.shadowColor = 'rgba(255, 65, 108, 0.7)';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3;
        ctx.strokeRect(blackX + 2, blackY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        ctx.shadowBlur = 0;

        // 如果当前是黑方回合，绘制更明显的黑方光标
        if (gameState.currentPlayer === PLAYER_BLACK) {
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(blackX + 6, blackY + 6, CELL_SIZE - 12, CELL_SIZE - 12);
            ctx.setLineDash([]);
        }

        // 绘制白方光标（绿色）
        const whiteCursor = gameState.cursorPos[PLAYER_WHITE];
        const whiteX = whiteCursor.col * CELL_SIZE;
        const whiteY = whiteCursor.row * CELL_SIZE;

        ctx.strokeStyle = '#33cc33'; // 绿色光标
        ctx.shadowColor = 'rgba(51, 204, 51, 0.7)';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3;
        ctx.strokeRect(whiteX + 2, whiteY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        ctx.shadowBlur = 0;

        // 如果当前是白方回合，绘制更明显的白方光标
        if (gameState.currentPlayer === PLAYER_WHITE) {
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(whiteX + 6, whiteY + 6, CELL_SIZE - 12, CELL_SIZE - 12);
            ctx.setLineDash([]);
        }
    }

    // 绘制网格线
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;

    // 垂直线
    for (let col = 0; col <= BOARD_SIZE; col++) {
        const x = col * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, BOARD_SIZE * CELL_SIZE);
        ctx.stroke();
    }

    // 水平线
    for (let row = 0; row <= BOARD_SIZE; row++) {
        const y = row * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(BOARD_SIZE * CELL_SIZE, y);
        ctx.stroke();
    }

    // 绘制坐标
    ctx.font = '12px Arial';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 列坐标（A-I）
    for (let col = 0; col < BOARD_SIZE; col++) {
        const x = col * CELL_SIZE + CELL_SIZE / 2;
        const y = BOARD_SIZE * CELL_SIZE + 15;
        ctx.fillText(String.fromCharCode(65 + col), x, y);
    }

    // 行坐标（1-9）
    for (let row = 0; row < BOARD_SIZE; row++) {
        const x = -15;
        const y = row * CELL_SIZE + CELL_SIZE / 2;
        ctx.fillText(row + 1, x, y);
    }
}

// 更新游戏状态显示
function updateStatus() {
    const statusElement = document.getElementById('status');

    if (gameState.gameOver) {
        if (gameState.winner === PLAYER_BLACK) {
            statusElement.textContent = "游戏结束！红方获胜！";
            statusElement.className = "status status-black";
        } else if (gameState.winner === PLAYER_WHITE) {
            statusElement.textContent = "游戏结束！绿方获胜！";
            statusElement.className = "status status-white";
        } else {
            statusElement.textContent = "游戏结束！平局！";
            statusElement.className = "status";
        }
    } else {
        if (gameState.currentPlayer === PLAYER_BLACK) {
            statusElement.textContent = "红方，请落子";
            statusElement.className = "status status-black";
        } else {
            statusElement.textContent = "绿方，请落子";
            statusElement.className = "status status-white";
        }
    }
}

// 更新UI显示
function updateUI() {
    // 更新剩余步数
    document.getElementById('blackMoves').textContent = gameState.movesLeft[PLAYER_BLACK];
    document.getElementById('whiteMoves').textContent = gameState.movesLeft[PLAYER_WHITE];

    // 计算并更新涂色地板数量
    let blackFloors = 0;
    let whiteFloors = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameState.floors[row][col] === FLOOR_BLACK) {
                blackFloors++;
            } else if (gameState.floors[row][col] === FLOOR_WHITE) {
                whiteFloors++;
            }
        }
    }

    document.getElementById('blackFloors').textContent = blackFloors;
    document.getElementById('whiteFloors').textContent = whiteFloors;
    
    // 更新先手选择下拉框
    const firstPlayerSelect = document.getElementById('firstPlayerSelect');
    firstPlayerSelect.value = gameState.firstPlayer.toString();
}

// 显示消息
function showMessage(text, duration = 2000) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.classList.add('show');

    setTimeout(() => {
        messageElement.classList.remove('show');
    }, duration);
}

// 检查落子是否合法
function isValidMove(row, col) {
    // 检查是否在棋盘范围内
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
        return false;
    }

    // 检查是否有棋子
    if (gameState.board[row][col] !== PIECE_NONE) {
        return false;
    }

    // 检查地板颜色是否匹配
    const floorColor = gameState.floors[row][col];
    const player = gameState.currentPlayer;

    // 如果地板是未涂色的，可以落子
    if (floorColor === FLOOR_NEUTRAL) {
        return true;
    }

    // 如果地板颜色与玩家颜色匹配，可以落子
    if ((player === PLAYER_BLACK && floorColor === FLOOR_BLACK) ||
        (player === PLAYER_WHITE && floorColor === FLOOR_WHITE)) {
        return true;
    }

    return false;
}

// 获取所有合法落子位置
function getAllValidMoves() {
    const moves = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (isValidMove(row, col)) {
                moves.push({
                    row,
                    col
                });
            }
        }
    }

    return moves;
}

// 检查是否有三消
function checkMatches(row, col, player) {
    const directions = [{
            dr: 0,
            dc: 1
        }, // 水平
        {
            dr: 1,
            dc: 0
        }, // 垂直
        {
            dr: 1,
            dc: 1
        }, // 对角线（右下）
        {
            dr: 1,
            dc: -1
        } // 对角线（左下）
    ];

    const matches = [];

    // 检查每个方向
    for (const dir of directions) {
        const cells = [];

        // 向两个方向查找连续的同色棋子
        for (let step = -2; step <= 2; step++) {
            const r = row + dir.dr * step;
            const c = col + dir.dc * step;

            // 检查是否在棋盘内且是当前玩家的棋子
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE &&
                gameState.board[r][c] === player) {
                cells.push({
                    row: r,
                    col: c
                });
            } else {
                // 如果遇到空位或对方棋子，且已有至少3个连续棋子，则记录匹配
                if (cells.length >= 3) {
                    matches.push([...cells]);
                }
                cells.length = 0; // 重置
            }
        }

        // 检查循环结束后的连续棋子
        if (cells.length >= 3) {
            matches.push([...cells]);
        }
    }

    return matches;
}

// 涂色地板
function paintFloors(row, col, player, matches) {
    const floorColor = player === PLAYER_BLACK ? FLOOR_BLACK : FLOOR_WHITE;
    const opponent = player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;

    // 为每个匹配的连线涂色
    for (const match of matches) {
        // 确定连线的方向
        let dr = 0,
            dc = 0;
        if (match.length > 1) {
            dr = match[1].row - match[0].row;
            dc = match[1].col - match[0].col;

            // 标准化方向（-1, 0, 1）
            if (dr !== 0) dr = dr > 0 ? 1 : -1;
            if (dc !== 0) dc = dc > 0 ? 1 : -1;
        }

        // 从连线的两端向外扩展涂色
        const startCell = match[0];
        const endCell = match[match.length - 1];

        // 向前涂色
        let r = startCell.row;
        let c = startCell.col;
        while (true) {
            // 涂色当前单元格
            gameState.floors[r][c] = floorColor;

            // 检查下一个单元格
            const nextR = r - dr;
            const nextC = c - dc;

            // 如果超出棋盘范围或遇到对方棋子，停止涂色
            if (nextR < 0 || nextR >= BOARD_SIZE || nextC < 0 || nextC >= BOARD_SIZE ||
                gameState.board[nextR][nextC] === opponent) {
                break;
            }

            r = nextR;
            c = nextC;
        }

        // 向后涂色
        r = endCell.row;
        c = endCell.col;
        while (true) {
            // 涂色当前单元格
            gameState.floors[r][c] = floorColor;

            // 检查下一个单元格
            const nextR = r + dr;
            const nextC = c + dc;

            // 如果超出棋盘范围或遇到对方棋子，停止涂色
            if (nextR < 0 || nextR >= BOARD_SIZE || nextC < 0 || nextC >= BOARD_SIZE ||
                gameState.board[nextR][nextC] === opponent) {
                break;
            }

            r = nextR;
            c = nextC;
        }
    }

    // 为消除的棋子下方的地板涂色
    for (const match of matches) {
        for (const cell of match) {
            gameState.floors[cell.row][cell.col] = floorColor;
        }
    }
}

// 执行落子
function makeMove(row, col) {
    // 检查游戏是否结束
    if (gameState.gameOver) {
        showMessage("游戏已结束，请重新开始！");
        return false;
    }

    // 检查落子是否合法
    if (!isValidMove(row, col)) {
        showMessage("无效的落子位置！");
        return false;
    }

    // 保存历史状态用于悔棋
    const historyState = {
        board: JSON.parse(JSON.stringify(gameState.board)),
        floors: JSON.parse(JSON.stringify(gameState.floors)),
        currentPlayer: gameState.currentPlayer,
        movesLeft: {
            ...gameState.movesLeft
        },
        cursorPos: {
            [PLAYER_BLACK]: {
                ...gameState.cursorPos[PLAYER_BLACK]
            },
            [PLAYER_WHITE]: {
                ...gameState.cursorPos[PLAYER_WHITE]
            }
        }
    };
    gameState.history.push(historyState);

    // 落子
    const player = gameState.currentPlayer;
    gameState.board[row][col] = player;
    gameState.movesLeft[player]--;

    // 检查是否触发三消
    const matches = checkMatches(row, col, player);

    if (matches.length > 0) {
        // 消除棋子
        const eliminatedCells = new Set();
        for (const match of matches) {
            for (const cell of match) {
                const key = `${cell.row},${cell.col}`;
                eliminatedCells.add(key);
                gameState.board[cell.row][cell.col] = PIECE_NONE;
            }
        }

        // 涂色地板
        paintFloors(row, col, player, matches);

        showMessage(`三消触发！消除了${eliminatedCells.size}个棋子`);
    }

    // 检查游戏是否结束
    checkGameEnd();

    // 切换玩家
    if (!gameState.gameOver) {
        gameState.currentPlayer = (player === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK;

        // 检查当前玩家是否有合法落子
        const validMoves = getAllValidMoves();
        if (validMoves.length === 0) {
            // 当前玩家无法落子，直接判负
            gameState.gameOver = true;
            gameState.winner = (gameState.currentPlayer === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK;
            showMessage(`${gameState.currentPlayer === PLAYER_BLACK ? "红方" : "绿方"}无法落子，游戏结束！`);
        }
    }

    // 更新UI
    updateStatus();
    updateUI();
    drawBoard();

    return true;
}

// 检查游戏是否结束
function checkGameEnd() {
    // 检查步数是否用尽
    if (gameState.movesLeft[PLAYER_BLACK] === 0 && gameState.movesLeft[PLAYER_WHITE] === 0) {
        gameState.gameOver = true;

        // 计算双方涂色地板数量
        let blackFloors = 0;
        let whiteFloors = 0;

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (gameState.floors[row][col] === FLOOR_BLACK) {
                    blackFloors++;
                } else if (gameState.floors[row][col] === FLOOR_WHITE) {
                    whiteFloors++;
                }
            }
        }

        // 判断胜负
        if (blackFloors > whiteFloors) {
            gameState.winner = PLAYER_BLACK;
        } else if (whiteFloors > blackFloors) {
            gameState.winner = PLAYER_WHITE;
        } else {
            gameState.winner = null; // 平局
        }

        return true;
    }

    return false;
}

// 移动光标
function moveCursor(player, deltaRow, deltaCol) {
    const newRow = gameState.cursorPos[player].row + deltaRow;
    const newCol = gameState.cursorPos[player].col + deltaCol;

    // 检查是否在棋盘范围内
    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        gameState.cursorPos[player].row = newRow;
        gameState.cursorPos[player].col = newCol;
        drawBoard();
    }
}

// 在光标位置落子
function placePieceAtCursor(player) {
    // 检查是否为当前玩家的回合
    if (player !== gameState.currentPlayer) {
        showMessage(`现在是${gameState.currentPlayer === PLAYER_BLACK ? "红方" : "绿方"}的回合！`);
        return;
    }

    const {
        row,
        col
    } = gameState.cursorPos[player];
    makeMove(row, col);
}

// 悔棋
function undoMove() {
    if (gameState.history.length === 0) {
        showMessage("没有可以悔棋的步骤！");
        return;
    }

    if (gameState.gameOver) {
        showMessage("游戏已结束，无法悔棋！");
        return;
    }

    // 恢复上一状态
    const prevState = gameState.history.pop();
    gameState.board = prevState.board;
    gameState.floors = prevState.floors;
    gameState.currentPlayer = prevState.currentPlayer;
    gameState.movesLeft = prevState.movesLeft;
    gameState.cursorPos[PLAYER_BLACK] = prevState.cursorPos[PLAYER_BLACK];
    gameState.cursorPos[PLAYER_WHITE] = prevState.cursorPos[PLAYER_WHITE];
    gameState.gameOver = false;
    gameState.winner = null;

    // 更新UI
    updateStatus();
    updateUI();
    drawBoard();

    showMessage("已悔棋一步");
}

// 选择先手玩家
function selectFirstPlayer(player) {
    // 移除所有选项的选中状态
    document.querySelectorAll('.player-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 添加当前选项的选中状态
    if (player === PLAYER_BLACK) {
        document.getElementById('selectBlackFirst').classList.add('selected');
        document.getElementById('firstPlayerSelect').value = '1';
    } else if (player === PLAYER_WHITE) {
        document.getElementById('selectWhiteFirst').classList.add('selected');
        document.getElementById('firstPlayerSelect').value = '2';
    } else {
        document.getElementById('selectRandomFirst').classList.add('selected');
        document.getElementById('firstPlayerSelect').value = 'random';
    }
    
    firstPlayerSelection.selected = player;
}

// 应用游戏设置
function applyGameSettings() {
    const firstPlayerSelect = document.getElementById('firstPlayerSelect');
      
    // 更新先手选择
    let selectedFirstPlayer = firstPlayerSelect.value;
    if (selectedFirstPlayer === 'random') {
        selectFirstPlayer('random');
    } else {
        selectFirstPlayer(parseInt(selectedFirstPlayer));
    }
    
    // 重新开始游戏
    initGame();
    showMessage("游戏设置已应用并重新开始！");
}

// 显示选先手弹窗
function showFirstPlayerModal() {
    const modal = document.getElementById('firstPlayerModal');
    modal.classList.remove('hidden');
    
    // 根据当前设置初始化选择
    const firstPlayerSelect = document.getElementById('firstPlayerSelect');
    const selectedValue = firstPlayerSelect.value;
    
    if (selectedValue === '1') {
        selectFirstPlayer(PLAYER_BLACK);
    } else if (selectedValue === '2') {
        selectFirstPlayer(PLAYER_WHITE);
    } else {
        selectFirstPlayer('random');
    }
}

// 隐藏选先手弹窗
function hideFirstPlayerModal() {
    const modal = document.getElementById('firstPlayerModal');
    modal.classList.add('hidden');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 显示选先手弹窗
    showFirstPlayerModal();
    
    // 初始化游戏（但先不开始，等用户确认先手）
    initGame();
    
    // 获取Canvas元素
    const canvas = document.getElementById('gameCanvas');
    
    // 添加点击事件监听
    canvas.addEventListener('click', (event) => {
        // 如果正在选择先手，不响应棋盘点击
        if (firstPlayerSelection.isChoosing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 计算点击的格子
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(y / CELL_SIZE);

        // 更新当前玩家的光标位置
        gameState.cursorPos[gameState.currentPlayer].row = row;
        gameState.cursorPos[gameState.currentPlayer].col = col;

        // 落子
        makeMove(row, col);
    });

    // 重新开始按钮
    document.getElementById('restartBtn').addEventListener('click', () => {
        initGame();
        showMessage("游戏已重新开始！");
    });

    // 悔棋按钮
    document.getElementById('undoBtn').addEventListener('click', () => {
        undoMove();
    });
    
    // 换先手按钮
    document.getElementById('changeFirstBtn').addEventListener('click', () => {
        showFirstPlayerModal();
    });
    
    // 应用设置按钮
    document.getElementById('applySettingsBtn').addEventListener('click', () => {
        initGame();
        showMessage("游戏已开始！");
    });
    
    // 选先手选项点击事件
    document.getElementById('selectBlackFirst').addEventListener('click', () => {
        selectFirstPlayer(PLAYER_BLACK);
    });
    
    document.getElementById('selectWhiteFirst').addEventListener('click', () => {
        selectFirstPlayer(PLAYER_WHITE);
    });
    
    document.getElementById('selectRandomFirst').addEventListener('click', () => {
        selectFirstPlayer('random');
    });
    
    // 确认先手按钮
    document.getElementById('confirmFirstPlayer').addEventListener('click', () => {
        firstPlayerSelection.isChoosing = false;
        hideFirstPlayerModal();
        applyGameSettings();
    });

    // 添加键盘事件监听
    document.addEventListener('keydown', (event) => {
        // 如果正在选择先手，不响应键盘事件
        if (firstPlayerSelection.isChoosing) return;
        
        // 如果游戏结束，不响应键盘事件
        if (gameState.gameOver) return;

        const key = event.key.toLowerCase();

        // 检查是否是需要阻止默认行为的游戏控制键
        const isGameControlKey =
            // 玩家1控制键
            key === 'w' || key === 'a' || key === 's' || key === 'd' || key === 'f' ||
            // 玩家2控制键
            key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright' ||
            key === 'up' || key === 'down' || key === 'left' || key === 'right' || key === '1' ||
            // 通用控制键
            key === 'r' || key === 'u' || key === 'c';

        // 如果是游戏控制键，阻止默认行为
        if (isGameControlKey) {
            event.preventDefault();
        }

        // 玩家1控制：WASD移动黑方光标，F落子（黑方）
        switch (key) {
            case 'w':
                moveCursor(PLAYER_BLACK, -1, 0);
                break;
            case 's':
                moveCursor(PLAYER_BLACK, 1, 0);
                break;
            case 'a':
                moveCursor(PLAYER_BLACK, 0, -1);
                break;
            case 'd':
                moveCursor(PLAYER_BLACK, 0, 1);
                break;
            case 'f':
                placePieceAtCursor(PLAYER_BLACK);
                break;
        }

        // 玩家2控制：方向键移动白方光标，1落子（白方）
        switch (key) {
            case 'arrowup':
            case 'up':
                moveCursor(PLAYER_WHITE, -1, 0);
                break;
            case 'arrowdown':
            case 'down':
                moveCursor(PLAYER_WHITE, 1, 0);
                break;
            case 'arrowleft':
            case 'left':
                moveCursor(PLAYER_WHITE, 0, -1);
                break;
            case 'arrowright':
            case 'right':
                moveCursor(PLAYER_WHITE, 0, 1);
                break;
            case '1':
                placePieceAtCursor(PLAYER_WHITE);
                break;
        }

        // 通用快捷键
        switch (key) {
            case 'r':
                initGame();
                showMessage("游戏已重新开始！");
                break;
            case 'u':
                undoMove();
                break;
            case 'c':
                showFirstPlayerModal();
                break;
        }
    });
});
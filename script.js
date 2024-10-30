const gridSize = 12;
let grid = [];
let score = 0;
let scr = 0;
let highScore = localStorage.getItem("highScore") || 0;
let nowScore = localStorage.getItem("score") || 0;
let autoPlayInterval;
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const gridElement = document.getElementById("grid");

function initGrid() {
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    score = 0;
    scr = 0;
    updateDisplay();
    spawnNewTile();
    spawnNewTile();
    spawnNewTile();
    spawnNewTile();
    updateDisplay();
    updateScore();
}

function updateScore() {
    score += scr

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreDisplay.textContent = highScore;
        if (scr > 0) {
            const addDiv = document.createElement("div");
            addDiv.className = "best-add";
            addDiv.textContent = `+${scr}`;
            highScoreDisplay.appendChild(addDiv);
        }
    }

    if (scr > 0) {
        scoreDisplay.textContent = score;
        const addDiv = document.createElement("div");
        addDiv.className = "score-add";
        addDiv.textContent = `+${scr}`;
        scoreDisplay.appendChild(addDiv);
        localStorage.setItem("score", score);
        scr = 0;
    }
}

function updateDisplay() {
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridElement.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    grid.forEach((row) => row.forEach((value) => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.value = value;
        cell.textContent = value === 0 ? '' : value;
        gridElement.appendChild(cell);
    }));
    applyHighValueClass();
}

function spawnNewTile() {
    const emptyCells = [];
    grid.forEach((row, rowIndex) => row.forEach((cell, colIndex) => {
        if (cell === 0) emptyCells.push({ row: rowIndex, col: colIndex });
    }));
    if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        let h = Math.random()
        if (h < 0.5) grid[row][col] = 2
        else if (h >= 0.5 && h < 0.9) grid[row][col] = 4
        else if (h >= 0.9) grid[row][col] = 8
    }
}

function slide(row) {
    let arr = row.filter(val => val);

    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            scr += arr[i];
            arr[i + 1] = 0;
        }
    }

    arr = arr.filter(val => val);
    while (arr.length < gridSize) arr.push(0);

    return arr;
}

function slideLeft() {
    grid = grid.map(row => slide(row));
}

function slideRight() {
    grid = grid.map(row => slide(row.reverse()).reverse());
}

function rotateLeft(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function rotateRight(matrix) {
    return rotateLeft(rotateLeft(rotateLeft(matrix)));
}

function slideUp() {
    grid = rotateLeft(grid);
    grid = grid.map(row => slide(row));
    grid = rotateRight(grid);
}

function slideDown() {
    grid = rotateRight(grid);
    grid = grid.map(row => slide(row));
    grid = rotateLeft(grid);
}

function animateMerge(index) {
    const cell = gridElement.children[index];
    cell.classList.add("merge");
    setTimeout(() => cell.classList.remove("merge"), 200);
}

function move(direction) {
    const previousGrid = JSON.stringify(grid);
    if (direction === "left") {
        slideLeft();
    } else if (direction === "right") {
        slideRight();
    } else if (direction === "up") {
        slideUp();
    } else if (direction === "down") {
        slideDown();
    }

    if (JSON.stringify(grid) !== previousGrid) {
        spawnNewTile();
        updateDisplay();
        updateScore();
        saveGame();
        if (checkGameOver()) {
            alert("ゲームオーバー!");
            clearGameData();
        }
    }
}

function checkGameOver() {
    return !grid.some((row, rowIndex) => row.some((cell, colIndex) => {
        return cell === 0 ||
            (rowIndex < gridSize - 1 && cell === grid[rowIndex + 1][colIndex]) ||
            (colIndex < gridSize - 1 && cell === grid[rowIndex][colIndex + 1]);
    }));
}

document.addEventListener("keydown", e => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === "ArrowLeft") move("left");
    else if (e.key === "ArrowRight") move("right");
    else if (e.key === "ArrowUp") move("up");
    else if (e.key === "ArrowDown") move("down");
})

function startAutoPlay() {
    const interval = parseInt(document.getElementById("interval").value);
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(() => {
        const moves = ["left", "right", "up", "down"];
        move(moves[Math.floor(Math.random() * moves.length)]);
    }, interval);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

function startNewGame() {
    initGrid();
    localStorage.setItem("score", 0)
    scoreDisplay.textContent = 0
    updateScore();
    saveGame()
}

document.getElementById("autoPlay").addEventListener("click", startAutoPlay);
document.getElementById("stopAutoPlay").addEventListener("click", stopAutoPlay);
document.getElementById("newGame").addEventListener("click", startNewGame);
const log = document.getElementById("log")

function saveGame() {
    const gameData = {
        grid,
        score
    };
    localStorage.setItem("2048GameData", JSON.stringify(gameData));
}

function loadGame() {
    const savedData = JSON.parse(localStorage.getItem("2048GameData"));
    if (savedData) {
        grid = savedData.grid;
        score = savedData.score;

        scoreDisplay.textContent = nowScore;


        highScoreDisplay.textContent = highScore;
        updateDisplay();
    } else {
        startNewGame();
    }
}

function applyHighValueClass() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        const value = parseInt(cell.dataset.value, 10);
        if (value >= 16384) {
            cell.classList.add("v16384");
        } else {
            cell.classList.remove("v16384");
        }
    });
}

initGrid();
loadGame();

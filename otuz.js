const array_size = 23;
var toguzFields = new Array(array_size);
var gameMoves = Array();
var finished, gameResult;

function start()
{
	set_position();
	show_board();
	show_moves();
    setTimeout(aiMoveLoop, 500); // Запускаем следующий ход с задержкой
}

function set_position() {
    toguzFields = [
        1, 2, 20, 7, 19, 255, 1, 2, 0,  // Нижние лунки
        255, 0, 6, 18, 6, 7, 5, 1, 1,  // Верхние лунки
        42, // Казан белых
        24, // Казан черных
        0,  // Туздыки белых
        0,  // Туздыки черных
        0   // Ходящий игрок (0 = белые, 1 = черные)  
    ];
    show_board();
    show_moves();
}

function init_board()
{
	finished = false;
	gameResult = -2;
	gameMoves = [];

	for (var i = 0; i < array_size; i++)
		if (i < 18)
			toguzFields[i] = 9;
		else
			toguzFields[i] = 0;
}

function show_board() {  
    var html = "<table border='1' cellspacing='3' height='300'>";  

    // Казаны над доской  
    html += "<tr class='kazan-row'>";  
    html += "<td colspan='5' class='kazan'>Казан белых: " + toguzFields[18] + "</td>"; // Сокращено  
    html += "<td colspan='5' class='kazan'>Казан черных: " + toguzFields[19] + "</td>"; // Сокращено  
    html += "</tr>";  

    // Верхняя нумерация  
    html += "<tr class='numbering'>";  
    for (var i = 9; i > 0; i--) html += "<td>" + i + "</td>"; // Нумерация верхней стороны  
    html += "</tr>";  

    // Верхние лунки  
    html += "<tr class='otau'>";  
    for (var i = 17; i > 8; i--) {  
        html += "<td onclick='click_otau(" + i + ");'>";  
        html += generateBalls(toguzFields[i]);  
        html += "</td>";  
    }  
    html += "</tr>";  

    // Нижние лунки  
    html += "<tr class='otau'>";  
    for (var i = 0; i < 9; i++) {  
        html += "<td onclick='click_otau(" + i + ");'>";  
        html += generateBalls(toguzFields[i]);  
        html += "</td>";  
    }  
    html += "</tr>";  

    // Нижняя нумерация  
    html += "<tr class='numbering'>";  
    for (var i = 1; i < 10; i++) html += "<td>" + i + "</td>"; // Нумерация нижней стороны  
    html += "</tr>";  

    html += "</table>";  
    document.getElementById("board").innerHTML = html;  
}

function generateBalls(count) {
    if (count === 255) return "X"; // для туздыков

    let ballsHTML = "";
    let layerHTML = "";
    for (let i = 0; i < count; i++) {
        layerHTML += "<div class='ball'></div>";

        if (i % 10 == 9 || i == count - 1) {
            ballsHTML += "<div class='layer'>" + layerHTML + "</div>";
            layerHTML = "";
        }
    }

    // Добавляем скрытые числа, которые появляются при наведении
    ballsHTML += `<span class='ball-count'>${count}</span>`;
    return ballsHTML;
}

// Функция для выполнения хода игрока или ИИ
function make_move(num) {
    if (finished) return;

    var color = toguzFields[22];
    if ((color === 0 && num > 8) || (color === 1 && num < 9)) return;

    var sow;
    var numotau = num;
    var numkum = toguzFields[numotau];

    if ((numkum === 0) || (numkum === 255)) return;

    if (numkum === 1) {
        toguzFields[numotau] = 0;
        sow = 1;
    } else {
        toguzFields[numotau] = 1;
        sow = numkum - 1;
    }

    for (var i = 0; i < sow; i++) {
        numotau++;
        if (numotau > 17) numotau = 0;
        if (toguzFields[numotau] === 255) {
            if (numotau > 8) toguzFields[18]++;
            else toguzFields[19]++;
        } else toguzFields[numotau]++;
    }

    // Убираем весь код, который ставит туздыки
    // Если есть какой-то старый код для создания туздыков, его можно просто удалить

    if (toguzFields[numotau] % 2 === 0) {
        if ((color === 0) && (numotau > 8)) {
            toguzFields[18] += toguzFields[numotau];
            toguzFields[numotau] = 0;
        } else if ((color === 1) && (numotau < 9)) {
            toguzFields[19] += toguzFields[numotau];
            toguzFields[numotau] = 0;
        }
    }

    var finished_otau;
    if (numotau > 8)
        finished_otau = numotau - 9 + 1;
    else
        finished_otau = numotau + 1;

    if (num > 8)
        num = num - 9 + 1;
    else
        num = num + 1;

    var moveStr = num + "" + finished_otau;
    gameMoves.push(moveStr);

    toguzFields[22] = (toguzFields[22] === 0 ? 1 : 0);

    check_position();
}

function check_position() {
    var whiteKum = 0, blackKum;
    var color = toguzFields[22];

    for (var i = 0; i < 9; i++)
        if (toguzFields[i] < 255)
            whiteKum += toguzFields[i];
    blackKum = 162 - whiteKum - toguzFields[18] - toguzFields[19];

    if ((color === 0) && (whiteKum === 0))
        toguzFields[19] += blackKum;
    else if ((color === 1) && (blackKum === 0))
        toguzFields[18] += whiteKum;

    if (toguzFields[18] >= 82) {
        finished = true;
        gameResult = 1;  // Победа белых
    } else if (toguzFields[19] >= 82) {
        finished = true;
        gameResult = -1;  // Победа черных
    } else if ((toguzFields[18] === 81) && (toguzFields[19] === 81)) {
        finished = true;
        gameResult = 0;  // Ничья
    }

    show_board();
    show_moves();
    
    if (finished) {
        setTimeout(start, 10000);  // Автоматически запускаем новую игру через 1 секунду
    }
}

let gameScreenshots = []; // Массив для хранения скриншотов

function takeScreenshot() {
    const boardElement = document.getElementById("board");
    html2canvas(boardElement, { scale: 0.5 }).then((canvas) => {
        const screenshotData = canvas.toDataURL("image/png");
        gameScreenshots.push(screenshotData); // Сохраняем скриншот
        show_moves(); // Обновляем записи игры, включая новый скриншот
    });
}

function show_moves() {
    let html = '';
    let blockSize = 20; // 20 записей (10 ходов обоих игроков)
    let screenshotIndex = 0;

    for (let i = 0; i < gameMoves.length; i++) {
        if (i % 2 === 0)
            html += (i / 2 + 1) + '. ' + gameMoves[i];
        else
            html += " " + gameMoves[i] + '<br />';

        // Вставляем скриншот после каждых 10 ходов
        if ((i + 1) % blockSize === 0 && screenshotIndex < gameScreenshots.length) {
            html += `<img src="${gameScreenshots[screenshotIndex]}" alt="Скриншот после ${((i + 1) / 2)} хода" 
            style="width: 150px; margin: 5px;"><br />`;
            screenshotIndex++;
        }
    }

    // Если игра завершена, добавляем результат и последний скриншот
    if (finished) {
        let resultText = '';
        if (gameResult === 1) {
            resultText = '<br /><strong>Результат: Победа белых (1-0)</strong>';
        } else if (gameResult === -1) {
            resultText = '<br /><strong>Результат: Победа черных (0-1)</strong>';
        } else if (gameResult === 0) {
            resultText = '<br /><strong>Результат: Ничья (0.5-0.5)</strong>';
        }
        html += resultText;

        // Добавляем финальный скриншот, если есть
        if (gameScreenshots[gameScreenshots.length - 1]) {
            html += `<img src="${gameScreenshots[gameScreenshots.length - 1]}" alt="Финальный скриншот" 
            style="width: 150px; margin: 5px;"><br />`;
        }
    }

    document.getElementById("moves").innerHTML = html;
}

// Автоматический вызов takeScreenshot каждые 10 ходов
    setInterval(() => {
      takeScreenshot();
    }, 10000); // Интервал 2 секунды

function onMoveMade() {
    // Добавляем запись о ходе
    // ... (логика добавления хода в gameMoves)

    // Делаем скриншот после каждого 10-го хода
    if (gameMoves.length % 20 === 0) {
        takeScreenshot(); // Скриншот добавляется автоматически
    }

    // Обновляем доску и записи
    show_board();
    show_moves();
}

//////////////////////////////////////////////////////////////////

function startAIvsAI() {
    init_board();
    show_board();
    show_moves();

    setTimeout(aiMoveLoop, 500); // AI vs AI ойынын бастаймыз
}

function aiMoveLoop() {
    if (finished) return; // Ойын аяқталса, тоқтайды

    let currentPlayer = toguzFields[22]; // Кезектегі ойыншы (0 - ақ, 1 - қара)
    let move = getBestMove(currentPlayer); // Ең жақсы жүрісті есептеу

    make_move(move); // Жүрісті жасау

    setTimeout(aiMoveLoop, 500); // Келесі жүрісті жасауға аз кідіру
}

// AI жүрісін таңдайтын қарапайым алгоритм (рандомдық таңдау)
function getBestMove(player) {
    let start = player === 0 ? 0 : 9; // Ақ ойыншы 0-8, қара 9-17
    let end = player === 0 ? 8 : 17;
    let possibleMoves = [];

    for (let i = start; i <= end; i++) {
        if (toguzFields[i] > 0 && toguzFields[i] !== 255) { // Жүріс жасауға болады
            possibleMoves.push(i);
        }
    }

    if (possibleMoves.length === 0) return null; // Жүріс болмаса, қайтару
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)]; // Рандом таңдау
}

// AI-ды қосу үшін click_otau функциясын өзгертеміз
function click_otau(num) {
    if (finished) return; // Егер ойын аяқталса, жүріс жасауға рұқсат жоқ
    make_move(num);
    if (!finished) setTimeout(aiMoveLoop, 500); // Адамның жүрісінен кейін AI-ға кезек беру
}

// Transposition Table için
const transpositionTable = new Map();

function ai_move() {
    if (finished) return;

    let bestMove = -1;
    let bestScore = -Infinity;
    const maxDepth = 6; // Derinliği artırdık

    // Iterative Deepening
    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        for (let i = 9; i < 18; i++) {
            if (toguzFields[i] > 0 && toguzFields[i] !== 255) {
                let clonedFields = toguzFields.slice();
                simulate_move(clonedFields, i, 1);

                let score = minimax(clonedFields, currentDepth - 1, false, -Infinity, Infinity);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
    }

    if (bestMove !== -1) {
        make_move(bestMove);
    }
}

function minimax(fields, depth, isMaximizingPlayer, alpha, beta) {

    const boardHash = calculateZobristHash(fields);
    if (transpositionTable.has(boardHash)) {
        return transpositionTable.get(boardHash);
    }

    if (depth === 0 || is_game_over(fields)) {
        return evaluate_position(fields);
    }

    if (depth === 0 || is_game_over(fields)) {
        return quiescence_search(fields, isMaximizingPlayer, alpha, beta);
    }

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let i = 9; i < 18; i++) {
            if (fields[i] > 0 && fields[i] !== 255) {
                let clonedFields = fields.slice();
                simulate_move(clonedFields, i, 1);
                let eval1 = minimax(clonedFields, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, eval1);
                alpha = Math.max(alpha, eval1);
                if (beta <= alpha) break;
            }
        }
        transpositionTable.set(boardHash, maxEval);
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < 9; i++) {
            if (fields[i] > 0 && fields[i] !== 255) {
                let clonedFields = fields.slice();
                simulate_move(clonedFields, i, 0);
                let eval2 = minimax(clonedFields, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, eval2);
                beta = Math.min(beta, eval2);
                if (beta <= alpha) break;
            }
        }
        transpositionTable.set(boardHash, minEval);
        return minEval;
    }
}

function quiescence_search(fields, isMaximizingPlayer, alpha, beta) {
    let standPat = evaluate_position(fields);
    if (isMaximizingPlayer) {
        if (standPat >= beta) return beta;
        if (alpha < standPat) alpha = standPat;
    } else {
        if (standPat <= alpha) return alpha;
        if (beta > standPat) beta = standPat;
    }

    // Sadece kazanma potansiyeli olan hamleleri değerlendir
    const relevantMoves = get_relevant_moves(fields, isMaximizingPlayer);
    for (let move of relevantMoves) {
        let clonedFields = fields.slice();
        simulate_move(clonedFields, move, isMaximizingPlayer ? 1 : 0);
        let score;
        if (isMaximizingPlayer) {
            score = quiescence_search(clonedFields, false, alpha, beta);
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        } else {
            score = quiescence_search(clonedFields, true, alpha, beta);
            if (score <= alpha) return alpha;
            if (score < beta) beta = score;
        }
    }

    return isMaximizingPlayer ? alpha : beta;
}

function get_relevant_moves(fields, isMaximizingPlayer) {
    const relevantMoves = [];
    const start = isMaximizingPlayer ? 9 : 0;
    const end = isMaximizingPlayer ? 18 : 9;

    for (let i = start; i < end; i++) {
        if (fields[i] > 1 && fields[i] !== 255) {
            relevantMoves.push(i);
        }
    }

    return relevantMoves;
}

function evaluate_position(fields) {
    let aiScore = fields[19];
    let playerScore = fields[18];
    let aiStones = 0;
    let playerStones = 0;

    for (let i = 9; i < 18; i++) {
        if (fields[i] !== 255) aiStones += fields[i];
    }
    for (let i = 0; i < 9; i++) {
        if (fields[i] !== 255) playerStones += fields[i];
    }

    let score = (aiScore - playerScore) * 15 + (aiStones - playerStones) * 2;

    // Bonus for tuzdyks
    if (fields[21] !== 0) score += 50; // AI's tuzdyk
    if (fields[20] !== 0) score -= 50; // Player's tuzdyk

    // Bonus for controlling more holes
    let aiControlledHoles = fields.slice(9, 18).filter(v => v > 0 && v !== 255).length;
    let playerControlledHoles = fields.slice(0, 9).filter(v => v > 0 && v !== 255).length;
    score += (aiControlledHoles - playerControlledHoles) * 5;

    return score;
}

// ... (diğer fonksiyonlar aynı kalabilir)
function simulate_move(fields, num, color) {
    let sow, numotau;
    let numkum = fields[num];

    if (numkum == 1) {
        fields[num] = 0;
        sow = 1;
    } else {
        fields[num] = 1;
        sow = numkum - 1;
    }

    numotau = num;
    for (let i = 0; i < sow; i++) {
        numotau++;
        if (numotau > 17) numotau = 0;
        if (fields[numotau] == 255) {
            if (numotau > 8) fields[18]++;
            else fields[19]++;
        } else fields[numotau]++;
    }

    // Tuzdyk ve çift sayılı kumalak yakalama kurallarını uygula
    if (fields[numotau] == 3) {
        if ((color == 0) && (fields[20] == 0) && (numotau > 8) &&
            (numotau < 17) && (fields[21] != numotau - 8)) {
            fields[18] += 3;
            fields[numotau] = 255;
            fields[20] = numotau - 8;
        } else if ((color == 1) && (fields[21] == 0) && (numotau < 8)
            && (fields[20] != numotau + 1)) {
            fields[19] += 3;
            fields[numotau] = 255;
            fields[21] = numotau + 1;
        }
    }

    if (fields[numotau] % 2 == 0) {
        if ((color == 0) && (numotau > 8)) {
            fields[18] += fields[numotau];
            fields[numotau] = 0;
        } else if ((color == 1) && (numotau < 9)) {
            fields[19] += fields[numotau];
            fields[numotau] = 0;
        }
    }

    // Sırayı değiştir
    fields[22] = 1 - color;
}

function is_game_over(fields) {
    let whiteKum = 0, blackKum = 0;

    for (let i = 0; i < 9; i++)
        if (fields[i] < 255)
            whiteKum += fields[i];
    for (let i = 9; i < 18; i++)
        if (fields[i] < 255)
            blackKum += fields[i];

    if (fields[18] >= 82 || fields[19] >= 82 || (whiteKum == 0 && blackKum == 0))
        return true;

    return false;
}


function drawBoard(field, kazan1, kazan2, player) {
    const canvas = document.createElement("canvas");
    canvas.width = 400; // Ширина изображения
    canvas.height = 200; // Высота изображения
    const ctx = canvas.getContext("2d");
  
    // Рисуем доску
    ctx.fillStyle = "#f5f5dc"; // Цвет доски
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Рисуем клетки и камни
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = "#000";
      ctx.fillText(field[i], 50 + i * 40, 50); // Верхний ряд (Игрок 1)
      ctx.fillText(field[9 + i], 50 + i * 40, 150); // Нижний ряд (Игрок 2)
    }
  
    // Рисуем казаны
    ctx.fillStyle = "#000";
    ctx.fillText(`Казан 1: ${kazan1}`, 10, 20);
    ctx.fillText(`Казан 2: ${kazan2}`, 10, 180);
  
    return canvas.toDataURL(); // Возвращает данные изображения в Base64
  }

  
  let moveCounter = 0; // Счётчик ходов
  let gameHistory = []; // История ходов с записями и скриншотами
  
  function recordMove(field, kazan1, kazan2, move, player) {
    moveCounter++;
  
    // Сохраняем запись хода
    const snapshot = drawBoard(field, kazan1, kazan2, player);
    const moveRecord = {
      moveNumber: moveCounter,
      player,
      move,
      field: [...field],
      kazan1,
      kazan2,
      snapshot: moveCounter % 10 === 0 ? snapshot : null, // Скриншот только для 10-го хода
    };
  
    gameHistory.push(moveRecord);
  
    // Логирование
    console.log(`Ход ${moveCounter}: Игрок ${player} сделал ход ${move}`);
    if (moveRecord.snapshot) {
      console.log("Скриншот создан:", moveRecord.snapshot);
    }
  }

  function updateHistoryUI() {
    const historyDiv = document.getElementById("history");
    historyDiv.innerHTML = ""; // Очищаем
  
    gameHistory.forEach((record) => {
      const recordDiv = document.createElement("div");
      recordDiv.innerHTML = `
        <p>Ход ${record.moveNumber}: Игрок ${record.player}, Ход: ${record.move}</p>
        ${record.snapshot ? `<img src="${record.snapshot}" alt="Скриншот">` : ""}
      `;
      historyDiv.appendChild(recordDiv);
    });
  }

  function saveGameHistory() {
    const data = JSON.stringify(gameHistory, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_history.json";
    a.click();
  
    URL.revokeObjectURL(url);
  }
  

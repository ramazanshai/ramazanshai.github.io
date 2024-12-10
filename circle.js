const array_size = 23;
var toguzFields = new Array(array_size);
var gameMoves = Array();
var finished, gameResult;

function start()
{
	init_board();
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
    html += "<tr class='numbering'>";
    html += "<td class='kazan' rowspan='4'>" + toguzFields[19] + "</td>";
    for (var i = 9; i > 0; i--)
        html += "<td>" + i + "</td>";
    html += "<td class='kazan' rowspan='4'>" + toguzFields[18] + "</td>";
    html += "</tr>";

    html += "<tr class='otau'>";
    for (var i = 17; i > 8; i--) {
        html += "<td onclick='click_otau(" + i + "); '>";
        html += generateBalls(toguzFields[i]);
        html += "</td>";
    }
    html += "</tr>";

    html += "<tr class='otau'>";
    for (var i = 0; i < 9; i++) {
        html += "<td onclick='click_otau(" + i + "); '>";
        html += generateBalls(toguzFields[i]);
        html += "</td>";
    }
    html += "</tr>";

    html += "<tr class='numbering'>";
    for (var i = 1; i < 10; i++)
        html += "<td>" + i + "</td>";
    html += "</tr>";
    html += "</table>";
    document.getElementById("board").innerHTML = html;
}

// Функция для создания шариков в зависимости от количества
function generateBalls(count) {
    if (count === 255) return "X"; // для туздыков
    let ballsHTML = "";
    for (let i = 0; i < count; i++) {
        ballsHTML += "<div class='ball'></div>";
    }
    return ballsHTML;
}

function click_otau(num) {
    make_move(num);
    setTimeout(ai_move, 500); // ИИ делает ход с небольшой задержкой
}

function make_move(num)
{
	if (finished) return;

	var color = toguzFields[22];
    if (color == 0 && num > 8) return;
    if (color == 1 && num < 9) return;

    var sow, finished_otau;
    var capturedTuzdyk = false;
    var numotau = num;
    var numkum = toguzFields[numotau];

    if ((numkum == 0) || (numkum == 255)) return;

    if (numkum == 1) {
        toguzFields[numotau] = 0;
        sow = 1;
    } else {
        toguzFields[numotau] = 1;
        sow = numkum - 1;
    }

    for (var i = 0; i < sow; i++) {
        numotau++;
        if (numotau > 17) numotau = 0;
        if (toguzFields[numotau] == 255) {
            if (numotau > 8) toguzFields[18]++;
            else toguzFields[19]++;
        } else toguzFields[numotau]++;
    }

    if (toguzFields[numotau] == 3) {
        if ((color == 0) && (toguzFields[20] == 0) && (numotau > 8) &&
                (numotau < 17) && (toguzFields[21] != numotau - 8)) {
            toguzFields[18] += 3;
            toguzFields[numotau] = 255;
            toguzFields[20] = numotau - 8;
            capturedTuzdyk = true;
        } else if ((color == 1) && (toguzFields[21] == 0) && (numotau < 8)
                && (toguzFields[20] != numotau + 1)) {
            toguzFields[19] += 3;
            toguzFields[numotau] = 255;
            toguzFields[21] = numotau + 1;
            capturedTuzdyk = true;
        }
    }

    if (toguzFields[numotau] % 2 == 0) {
        if ((color == 0) && (numotau > 8)) {
            toguzFields[18] += toguzFields[numotau];
            toguzFields[numotau] = 0;
        } else if ((color == 1) && (numotau < 9)) {
            toguzFields[19] += toguzFields[numotau];
            toguzFields[numotau] = 0;
        }
    }

    if (numotau > 8)
        finished_otau = numotau - 9 + 1;
    else
        finished_otau = numotau + 1;

    if (num > 8)
        num = num - 9 + 1;
    else
        num = num + 1;

    var moveStr = num + "" + finished_otau;
    if (capturedTuzdyk)
        moveStr += "x";
    gameMoves.push(moveStr);

    toguzFields[22] = (toguzFields[22] == 0 ? 1 : 0);

	check_position();
}

function check_position()
{
    var whiteKum = 0, blackKum;
    var color = toguzFields[22];

    for (var i = 0; i < 9; i++)
        if (toguzFields[i] < 255)
            whiteKum += toguzFields[i];
    blackKum = 162 - whiteKum - toguzFields[18] - toguzFields[19];

    if ((color == 0) && (whiteKum == 0))
        toguzFields[19] += blackKum;

    else if ((color == 1) && (blackKum == 0))
        toguzFields[18] += whiteKum;

    if (toguzFields[18] >= 82) {
        finished = true;
        gameResult = 1;
    } else if (toguzFields[19] >= 82) {
        finished = true;
        gameResult = -1;
    } else if ((toguzFields[18] == 81) & (toguzFields[19] == 81)) {
        finished = true;
        gameResult = 0;
    }

	show_board();
	show_moves();
}

function show_moves()
{
	var html = '';
	for (var i = 0; i < gameMoves.length; i++)
	{
		if (i % 2 == 0)
			html += (i/2 + 1) + '. ' + gameMoves[i];
		else
			html += " " + gameMoves[i] + '<br />';
	}
	document.getElementById("moves").innerHTML = html;
} 

////////////////////////////////////////////////////////////
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
    const boardHash = fields.join(',');
    if (transpositionTable.has(boardHash)) {
        return transpositionTable.get(boardHash);
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
                let eval = minimax(clonedFields, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
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
                let eval = minimax(clonedFields, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
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
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

function ai_move() {
    if (finished) return;

    var bestMove = -1;
    var bestScore = -Infinity;

    for (var i = 0; i < 9; i++) {
        if (toguzFields[22] === 0 && toguzFields[i] > 0 && toguzFields[i] !== 255) {
            let clonedFields = toguzFields.slice();
            let score = simulate_move(clonedFields, i, toguzFields[22]);
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        } else if (toguzFields[22] === 1 && toguzFields[i + 9] > 0 && toguzFields[i + 9] !== 255) {
            let clonedFields = toguzFields.slice();
            let score = simulate_move(clonedFields, i + 9, toguzFields[22]);
            if (score > bestScore) {
                bestScore = score;
                bestMove = i + 9;
            }
        }
    }

    if (bestMove !== -1) {
        make_move(bestMove);
    }
}

function simulate_move(fields, num, color) {
    var numotau = num;
    var numkum = fields[numotau];

    if (numkum === 0 || numkum === 255) return -Infinity;

    if (numkum === 1) {
        fields[numotau] = 0;
        var sow = 1;
    } else {
        fields[numotau] = 1;
        var sow = numkum - 1;
    }

    for (var i = 0; i < sow; i++) {
        numotau++;
        if (numotau > 17) numotau = 0;
        fields[numotau]++;
    }

    if (fields[numotau] % 2 === 0) {
        if (color === 0 && numotau > 8) {
            fields[18] += fields[numotau];
            fields[numotau] = 0;
        } else if (color === 1 && numotau < 9) {
            fields[19] += fields[numotau];
            fields[numotau] = 0;
        }
    }

    return evaluate_position(fields, color);
}

function evaluate_position(fields, color) {
    if (color === 0) {
        return fields[18] - fields[19];
    } else {
        return fields[19] - fields[18];
    }
}


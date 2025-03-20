        const array_size = 23;
        let toguzFields = new Array(array_size);
        let gameMoves = [];
        let finished, gameResult;
        let currentOtau = null;
        let hoverStartTime = 0;

        function start() {
            if (localStorage.getItem('toguzGameState')) {
                if (confirm("Вы хотите продолжить игру?")) {
                    load_game();
                } else {
                    init_board();
                }
            } else {
                init_board();
            }
            show_board();
            show_moves();
            setupCamera();
        }

        function click_otau(num) {
            make_move(num);
            setTimeout(500); // ИИ делает ход с небольшой задержкой
        }

        function init_board() {
            finished = false;
            gameResult = -2;
            gameMoves = [];

            for (let i = 0; i < array_size; i++)
                if (i < 18)
                    toguzFields[i] = 9;
                else
                    toguzFields[i] = 0;

            save_game();  // Save initial game state to LocalStorage
        }

        function show_board() {
            let html = "<table border='1' cellspacing='3' height='300' width='100%'>";

            // Казаны над доской
            html += "<tr class='kazan-row'>";
            html += "<td colspan='5' class='kazan'>Казан белых: " + toguzFields[18] + "</td>"; // Сокращено
            html += "<td colspan='5' class='kazan'>Казан черных: " + toguzFields[19] + "</td>"; // Сокращено
            html += "</tr>";

            // Верхняя нумерация
            html += "<tr class='numbering'>";
            for (let i = 9; i > 0; i--) html += "<td>" + i + "</td>"; // Нумерация верхней стороны
            html += "</tr>";

            // Верхние лунки
            html += "<tr class='otau'>";
            for (let i = 17; i > 8; i--) {
                html += "<td onclick='click_otau(" + i + ");' id='otau-" + i + "'>";
                html += generateBalls(toguzFields[i]);
                html += "</td>";
            }
            html += "</tr>";

            // Нижние лунки
            html += "<tr class='otau'>";
            for (let i = 0; i < 9; i++) {
                html += "<td onclick='click_otau(" + i + ");' id='otau-" + i + "'>";
                html += generateBalls(toguzFields[i]);
                html += "</td>";
            }
            html += "</tr>";

            // Нижняя нумерация
            html += "<tr class='numbering'>";
            for (let i = 1; i < 10; i++) html += "<td>" + i + "</td>"; // Нумерация нижней стороны
            html += "</tr>";

            html += "</table>";
            document.getElementById("board").innerHTML = html;
        }

        function generateBalls(count) {
            if (count === 255) return "<span style='color: red; font-weight: bold;'>X</span>"; // для туздыков

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

            let color = toguzFields[22];
            if ((color === 0 && num > 8) || (color === 1 && num < 9)) return;

            let sow, finished_otau;
            let capturedTuzdyk = false;
            let numotau = num;
            let numkum = toguzFields[numotau];

            if ((numkum === 0) || (numkum === 255)) return;

            if (numkum === 1) {
                toguzFields[numotau] = 0;
                sow = 1;
            } else {
                toguzFields[numotau] = 1;
                sow = numkum - 1;
            }

            for (let i = 0; i < sow; i++) {
                numotau++;
                if (numotau > 17) numotau = 0;
                if (toguzFields[numotau] === 255) {
                    if (numotau > 8) toguzFields[18]++;
                    else toguzFields[19]++;
                } else toguzFields[numotau]++;
            }

            if (toguzFields[numotau] === 3) {
                if ((color === 0) && (toguzFields[20] === 0) && (numotau > 8) &&
                        (numotau < 17) && (toguzFields[21] !== numotau - 8)) {
                    toguzFields[18] += 3;
                    toguzFields[numotau] = 255;
                    toguzFields[20] = numotau - 8;
                    capturedTuzdyk = true;
                } else if ((color === 1) && (toguzFields[21] === 0) && (numotau < 8)
                        && (toguzFields[20] !== numotau + 1)) {
                    toguzFields[19] += 3;
                    toguzFields[numotau] = 255;
                    toguzFields[21] = numotau + 1;
                    capturedTuzdyk = true;
                }
            }

            if (toguzFields[numotau] % 2 === 0) {
                if ((color === 0) && (numotau > 8)) {
                    toguzFields[18] += toguzFields[numotau];
                    toguzFields[numotau] = 0;
                } else if ((color === 1) && (numotau < 9)) {
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

            let moveStr = num + "" + finished_otau;
            if (capturedTuzdyk)
                moveStr += "x";
            gameMoves.push(moveStr);

            toguzFields[22] = (toguzFields[22] === 0 ? 1 : 0);

            check_position();
        }

        function check_position() {
            let whiteKum = 0, blackKum;
            let color = toguzFields[22];

            for (let i = 0; i < 9; i++)
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

            save_game();  // Save game state to LocalStorage

            if (finished) {
                setTimeout(start, 10000);  // Автоматически запускаем новую игру через 10 секунд
            }
        }

        function save_game() {
            const gameState = {
                toguzFields: toguzFields,
                gameMoves: gameMoves,
                finished: finished,
                gameResult: gameResult
            };
            localStorage.setItem('toguzGameState', JSON.stringify(gameState));
        }

        function load_game() {
            const savedState = localStorage.getItem('toguzGameState');
            if (savedState) {
                const gameState = JSON.parse(savedState);
                toguzFields = gameState.toguzFields;
                gameMoves = gameState.gameMoves;
                finished = gameState.finished;
                gameResult = gameState.gameResult;
                show_board();
                show_moves();
                return true;
            }
            return false;
        }

        function confirmNewGame() {
            if (confirm("Начать новую игру?")) {
                init_board();
                show_board();
                show_moves();
            }
        }

        function show_moves() {
            let html = '';

            for (let i = 0; i < gameMoves.length; i++) {
                if (i % 2 === 0)
                    html += (i / 2 + 1) + '. ' + gameMoves[i];
                else
                    html += " " + gameMoves[i] + '<br />';
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
            }

            document.getElementById("moves").innerHTML = html;
        }

        function setupCamera() {
            const videoElement = document.getElementById('inputVideo');
            const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            hands.onResults(onResults);

            const camera = new Camera(videoElement, {
                onFrame: async () => {
                    await hands.send({image: videoElement});
                },
                width: 1280,
                height: 720
            });
            camera.start();
        }

        function onResults(results) {
            if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
                currentOtau = null;
                hoverStartTime = null;
                return;
            }

            const landmarks = results.multiHandLandmarks[0];

            // Calculate the bounding box of the detected hand
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (let landmark of landmarks) {
                minX = Math.min(minX, landmark.x);
                minY = Math.min(minY, landmark.y);
                maxX = Math.max(maxX, landmark.x);
                maxY = Math.max(maxY, landmark.y);
            }

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            // Map the center of the hand to the game board
            const boardElement = document.getElementById('board');
            const boardRect = boardElement.getBoundingClientRect();

            const x = centerX * boardRect.width + boardRect.left;
            const y = centerY * boardRect.height + boardRect.top;

            const elements = document.elementsFromPoint(x, y);
            let selectedElement = null;
            for (let element of elements) {
                if (element.tagName === 'TD' && element.onclick) {
                    selectedElement = element;
                    highlightOtau(element.id);
                    break;
                }
            }

            if (selectedElement) {
                if (currentOtau !== selectedElement.id) {
                    currentOtau = selectedElement.id;
                    hoverStartTime = new Date().getTime();
                } else {
                    const hoverDuration = new Date().getTime() - hoverStartTime;
                    if (hoverDuration >= 500) {  // 2 seconds
                        selectedElement.onclick();
                        currentOtau = null;
                        hoverStartTime = 0;
                    }
                }
            } else {
                currentOtau = null;
                hoverStartTime = 0;
            }
        }

        function highlightOtau(id) {
            const otauElements = document.querySelectorAll('td');
            otauElements.forEach(el => el.classList.remove('selected'));
            const selectedElement = document.getElementById(id);
            if (selectedElement) {
                selectedElement.classList.add('selected');
            }
        }



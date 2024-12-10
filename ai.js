class DogBoard {
    constructor() {
        this.TUZD = -1;
        this.fields = Array(23).fill(0);
        this.finished = false;
        this.gameResult = -2;
        this.moves = [];
        for (let i = 0; i < 18; i++) {
            this.fields[i] = 9;  // Начальные камни
        }
    }

    printPosition(show = false) {
        let position = `${this.fields[21]}  `;
        for (let i = 17; i >= 9; i--) {
            position += this.fields[i] === this.TUZD ? "X  " : `${this.fields[i]}  `;
        }
        position += "\n      ";
        for (let i = 0; i < 9; i++) {
            position += this.fields[i] === this.TUZD ? "X  " : `${this.fields[i]}  `;
        }
        position += ` ${this.fields[20]}`;
        
        if (show) {
            console.log(position);
        }
        return position;
    }

    checkPosition() {
        let color = this.fields[22];
        let numWhite = 0;
        for (let i = 0; i < 9; i++) {
            if (this.fields[i] > 0) {
                numWhite += this.fields[i];
            }
        }

        let numBlack = 162 - numWhite - this.fields[20] - this.fields[21];

        if (color === 0 && numWhite === 0) {
            this.fields[21] += numBlack;
        } else if (color === 1 && numBlack === 0) {
            this.fields[20] += numWhite;
        }

        if (this.fields[20] > 81) {
            this.finished = true;
            this.gameResult = 1;
        } else if (this.fields[21] > 81) {
            this.finished = true;
            this.gameResult = -1;
        } else if (this.fields[20] === 81 && this.fields[21] === 81) {
            this.finished = true;
            this.gameResult = 0;
        }
    }

    makeMove(move) {
        let color = this.fields[22];
        let moveIndex = move + color * 9 - 1;
        let num = this.fields[moveIndex];
        let sow = 0;

        if (num === 0 || num === this.TUZD) {
            console.log("Incorrect move!");
            return;
        }

        this.fields[moveIndex] = 0;
        sow = num - 1;
        let nextIndex = moveIndex;

        for (let i = 0; i < sow; i++) {
            nextIndex = (nextIndex + 1) % 18;
            if (this.fields[nextIndex] === this.TUZD) {
                if (nextIndex < 9) {
                    this.fields[21] += 1;
                } else {
                    this.fields[20] += 1;
                }
            } else {
                this.fields[nextIndex] += 1;
            }
        }

        if (this.fields[nextIndex] === 3) {
            if (color === 0 && nextIndex > 8 && nextIndex < 17 && this.fields[18] === 0) {
                this.fields[18] = nextIndex - 8;
                this.fields[nextIndex] = this.TUZD;
                this.fields[20] += 3;
            } else if (color === 1 && nextIndex < 8 && this.fields[19] === 0) {
                this.fields[19] = nextIndex + 1;
                this.fields[nextIndex] = this.TUZD;
                this.fields[21] += 3;
            }
        }

        this.fields[22] = 1 - color;
        this.checkPosition();
        return move;
    }

    makeRandomMove() {
        let possible = [];
        let color = this.fields[22];

        for (let i = 1; i <= 9; i++) {
            let moveIndex = i + color * 9 - 1;
            if (this.fields[moveIndex] > 0) {
                possible.push(i);
            }
        }

        if (possible.length === 0) {
            console.log("No possible moves!");
            return;
        }

        let randMove = possible[Math.floor(Math.random() * possible.length)];
        return this.makeMove(randMove);
    }

    minimax(depth, color, alpha, beta) {
        if (depth === 0 || this.finished) {
            return this.evaluatePosition(color);
        }

        let possibleMoves = [];
        for (let i = 1; i <= 9; i++) {
            let moveIndex = i + color * 9 - 1;
            if (this.fields[moveIndex] > 0) {
                possibleMoves.push(i);
            }
        }

        if (possibleMoves.length === 0) {
            return 0;
        }

        let bestScore = color === 0 ? -Infinity : Infinity;
        let bestMove = null;

        for (let move of possibleMoves) {
            this.makeMove(move);
            let score = this.minimax(depth - 1, 1 - color, alpha, beta);
            this.undoMove(move);

            if (color === 0) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, bestScore);
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                beta = Math.min(beta, bestScore);
            }

            if (beta <= alpha) {
                break;
            }
        }

        return bestMove;
    }

    evaluatePosition(color) {
        let score = 0;

        for (let i = 0; i < 9; i++) {
            if (this.fields[i] > 0) {
                score += this.fields[i] * (color === 0 ? 1 : -1);
            }
        }

        score += color === 0 ? this.fields[20] : -this.fields[21];
        return score;
    }

    undoMove(move) {
        // Эта функция должна отменить сделанный ход. Пока оставим как заглушку.
    }
}

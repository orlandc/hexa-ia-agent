const Agent = require('ai-agents').Agent;

class HexAgent extends Agent {
    constructor(value) {
        super(value);
    };

    send() {
        var tablero = this.perception.map(function (arr) { return arr.slice(); })
        let tamano = tablero.length;
        let movdisponibles = getEmptyHex(tablero);
        let turno = size * size - available.length;
        
        if (turno == 0) {
            return mejorprimermovimiento(movdisponibles, tamano)
        } else if (turno == 1){
            return mejorprimermovimiento(movdisponibles, tamano)
        }

        let profundidad = 7;
        let max_jugador = true;

        let mejorvalor = new podaAlphaBetadMiniMax(tablero, max_jugador, profundidad, max_player);

        return [Math.floor(mejorvalor / tablero.length), mejorvalor % tablero.length];
    }
    
}

function mejorprimermovimiento(movdisponibles, tamano) {
    if(tamano % 2 != 0) {
        var mejor_mov_disponibles = [
            Math.floor(Math.pow(tamano,2) / 2) + 1,
            Math.floor(Math.pow(tamano,2) / 2) - 1,
            Math.floor(Math.pow(tamano,2) / 2) - tamano,
            Math.floor(Math.pow(tamano,2) / 2) + tamano,
            Math.floor(Math.pow(tamano,2) / 2) - (tamano - 1),
            Math.floor(Math.pow(tamano,2) / 2) + (tamano + 1),
            Math.floor(Math.pow(tamano,2) / 2) - (tamano + 1),
            Math.floor(Math.pow(tamano,2) / 2) + (tamano - 1)
        ];   
    } else {
        var mejor_mov_disponibles = [
            (Math.pow(tamano,2) / 2) + (tamano / 2),
            (Math.pow(tamano,2) / 2) + ((tamano / 2)-1),
            (Math.pow(tamano,2) / 2) - (tamano / 2),
            (Math.pow(tamano,2) / 2) - ((tamano / 2)+1)
        ];
    }

    for (x = 0; x < mejor_mov_disponibles.length; x++){
        if (movdisponibles.indexOf(mejor_mov_disponibles[x]) > 0) {
            return [Math.floor(mejor_mov_disponibles[x] / Math.pow(tamano,2)), mejor_mov_disponibles[x] % Math.pow(tamano,2)];
        }
    }
}

module.exports = HexAgent;

// tomado de la pagina web https://bit.ly/2G2Mg3C
class podaAlphaBetadMiniMax {

    constructor(tablero, max_jugador, profundidad, alpha, beta){
        this.tablero     = tablero
        this.max_jugador = max_jugador
        this.profundidad = profundidad
        this.alpha       = alpha
        this.beta        = beta
    }

    Obtenerheuristica(){
        let retrievedScore = transpose(this.tablero);
        
        if (retrievedScore) {
            return retrievedScore;
        } else {
            let puntuacion = this.Obtenerheuristica();
            transpositionTable[board] = score
            return score;
        }
    }
    
    getPossibleMovesFromActiveRegion() {
        let actualCoordinate = currentNodeDijkstraIn.coordinate;
        let row = Math.floor(currentNodeDijkstraIn.coordinate / size);
        let col = currentNodeDijkstraIn.coordinate % size;
        let result = [];
        
        if (row > 0) {
            result.push(actualCoordinate-size);
        }
        if (row > 0 && col + 1 < size) {
            result.push(actualCoordinate-size+1);
        }
        if (col > 0) {
            result.push(actualCoordinate-1);
        }
        if (col + 1 < size) {
            result.push(actualCoordinate+1);
        }
        if (row + 1 < size && col > 0) {
            result.push(actualCoordinate+size-1);
        }
        if (row + 1 < size) {
            result.push(actualCoordinate+size);
        }
        return result;
    }
    
    actualizarTableroMovimiento(board, moves, id, oponentID) {
        const newBoard = []
        board.forEach((row) => {
            const r = []
            for (let i = 0; i < row.length; i++) {
                r.push(row[i])
            }
            newBoard.push(r)
        })
    
        let currentID = id
    
        moves.forEach((move) => {
            newBoard[move[0]][move[1]] = currentID
    
            if (currentID === id) {
                currentID = oponentID
                return
            }
    
            currentID = id
        })
    
        return newBoard
    }


    cuerpo() {
        if (this.profundidad == 0 || getIsBoardFull()) {
            return this.Obtenerheuristica()
        }

        let moves = board.getPossibleMovesFromActiveRegion();

        if  (!moves.isEmpty) {
            if (this.max_jugador) {
                var mejorvalor = -Double.infinity
                for (let move in moves) {
                    let actualizarTablero = actualizarTableroMovimiento(board, move: Hex(move, value: .player))
                    mejorvalor = max(mejorvalor, alphaBetaPrunedMiniMax(actualizarTablero, false, this.profundidad-1, alpha, beta))
                    alpha = max(alpha, mejorvalor)
                    if (beta <= alpha) {
                        break
                    }
                }
                return mejorvalor
            } else {
                var mejorvalor = Double.infinity
                for (let move in moves) {
                    let actualizarTablero = updateBoardWithMove(board, Hex(move, value: .computer));
                    mejorvalor = min(mejorvalor, alphaBetaPrunedMiniMax(actualizarTablero, true, this.profundidad-1, alpha, beta));
                    beta = min(beta, mejorvalor)
                    if (beta <= alpha) {
                        break
                    }
                }
                return mejorvalor
            }
        } else {
            return getHeuristicScore()
        }
    }
}


/**
 * Return an array containing the id of the empty hex in the board
 * id = row * size + col;
 * @param {Matrix} board 
 */
function getEmptyHex(board) {
    let result = [];
    let size = board.length;
    for (let k = 0; k < size; k++) {
        for (let j = 0; j < size; j++) {
            if (board[k][j] === 0) {
                result.push(k * size + j);
            }
        }
    }
    return result;
}
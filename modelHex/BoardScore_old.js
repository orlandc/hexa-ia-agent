const Graph = require('node-dijkstra');

function boardScore(board, player) {
    if(player === '1')
        return boardPath(transpose(board)).length - boardPath(board).length;
    else
        return boardPath(board).length - boardPath(transpose(board)).length;
}


function boardPath(board) {
    let player = '1';
    let size = board.length;

    const route = new Graph();

    // Build the graph out of the hex board
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let key = i * size + j;
            let list = getNeighborhood(key, player, board);
            let neighbors = {};
            list.forEach(x => {
                neighbors[x + ''] = 1;
            });
            if (j === 0) { //Add edge to T
                neighbors[player + 'T'] = 1;
            }
            if (j === size - 1) { //Add edge to R
                neighbors[player + 'X'] = 1;
            }
            route.addNode(key + '', neighbors);
        }
    }

    let neighborsT = {};
    let neighborsX = {};

    for (let i = 0; i < size; i++) {
        if (board[i][0] === 0) {
            neighborsT[(i * size) + ''] = 1;
        }
        if (board[i][size - 1] === 0) {
            neighborsX[(i * size + size - 1) + ''] = 1;
        }
    }

    route.addNode(player + 'T', neighborsT);
    route.addNode(player + 'X', neighborsX);

    return route.path(player + 'T', player + 'X');
}

/**
 * Return an array of the neighbors of the currentHex that belongs to the same player. The 
 * array contains the id of the hex. id = row * size + col
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Matrix} board 
 */
function getNeighborhood(currentHex, player, board) {
    let size = board.length;
    let row = Math.floor(currentHex / size);
    let col = currentHex % size;
    let result = [];
    let currentValue = board[row][col];
    board[row][col] = 'x';
    // Check the six neighbours of the current hex
    pushIfAny(result, board, player, row - 1, col);
    pushIfAny(result, board, player, row - 1, col + 1);
    pushIfAny(result, board, player, row, col + 1);
    pushIfAny(result, board, player, row, col - 1);
    pushIfAny(result, board, player, row + 1, col);
    pushIfAny(result, board, player, row + 1, col - 1);

    board[row][col] = currentValue;

    return result;
}

function pushIfAny(result, board, player, row, col) {
    let size = board.length;
    if (row >= 0 && row < size && col >= 0 && col < size) {
        if (board[row][col] === player) {
            result.push(...getNeighborhood(col + row * size, player, board));
        } else if (board[row][col] === 0) {
            result.push(col + row * size);
        }
    }
}

/**
 * Transpose and convert the board game to a player 1 logic
 * @param {Array} board 
 */
function transpose(board) {
    let size = board.length;
    let boardT = new Array(size);
    for (let j = 0; j < size; j++) {
        boardT[j] = new Array(size);
        for (let i = 0; i < size; i++) {
            boardT[j][i] = board[i][j];
            if (boardT[j][i] === '1') {
                boardT[j][i] = '2';
            } else if (boardT[j][i] === '2') {
                boardT[j][i] = '1';
            }
        }
    }
    return boardT;
}

module.exports = boardScore;
//let board = [[0, 0, 0], [0, '1', 0], [0, 0, 0]];
//console.log(boardScore(board, '2'));

const Agent = require('ai-agents').Agent;

class HexAgent extends Agent {
    constructor(value) {
        super(value);
        this.minimax = this.minimax.bind(this)
        this.send = this.send.bind(this)
    };
    
    send() {
        var tablero = this.perception.map(function (arr) { return arr.slice(); })
        let tamano  = tablero.length;

        let movdisponibles = getEmptyHex(tablero);

        let turno = size * size - movdisponibles.length;
        
        if (turno == 0) {
            return mejorprimermovimiento(movdisponibles, tamano, turno);
        } else if (turno == 1){
            return mejorprimermovimiento(movdisponibles, tamano, turno);
        }

        let profundidad = 7;
        let max_jugador = true;

        let mejorvalor = podaAlphaBetadMiniMax(tablero, profundidad, max_jugador);

        return [Math.floor(mejorvalor / tablero.length), mejorvalor % tablero.length];
    }
    
}

function mejorprimermovimiento(movdisponibles, tamano, turno) {
    var mejor_mov_disponibles;
    if(tamano % 2 == 1) {
        if (turno == 0) {
            mejor_mov_disponibles = [
                Math.floor(Math.pow(tamano,2) / 2) + 1,
                Math.floor(Math.pow(tamano,2) / 2) - 1,
                Math.floor(Math.pow(tamano,2) / 2) - tamano,
                Math.floor(Math.pow(tamano,2) / 2) + tamano,
                Math.floor(Math.pow(tamano,2) / 2) - (tamano - 1),
                Math.floor(Math.pow(tamano,2) / 2) + (tamano + 1),
                Math.floor(Math.pow(tamano,2) / 2) - (tamano + 1),
                Math.floor(Math.pow(tamano,2) / 2) + (tamano - 1)
            ];
        } else if (turno == 1) {
            mejor_mov_disponibles = [
                Math.floor(Math.pow(tamano,2) / 2)
            ]
        } 
    } else {
        mejor_mov_disponibles = [
            (Math.pow(tamano,2) / 2) + (tamano / 2),
            (Math.pow(tamano,2) / 2) + ((tamano / 2)-1),
            (Math.pow(tamano,2) / 2) - (tamano / 2),
            (Math.pow(tamano,2) / 2) - ((tamano / 2)+1)
        ];
    }

    var x;
    for (x = 0; x < mejor_mov_disponibles.length; x++){
        if (movdisponibles.indexOf(mejor_mov_disponibles[x]) > 0) {
            return [Math.floor(mejor_mov_disponibles[x] / tamano), mejor_mov_disponibles[x] % tamano];
        }
    }
}

module.exports = HexAgent;

function podaAlphaBetadMiniMax(tablero, profundidad, max_jugador, idAgente) {
    var opciones = [];
    var infinito = 1.7976931348623157E+10308
    
    let dummyNode = new Node(tablero, idAgente, undefined, -infinito);
    var dummyBoard = dummyNode.board.map(function (arr) { return arr.slice(); })
    
    var movimientosDisponibles = getEmptyHex(dummyBoard);
    let primerNivel = 1;
    
    for (let movimiento of movimientosDisponibles) {
        let childboard = dummyBoard.map(function (arr) { return arr.slice(); });
        childboard[Math.floor(move / dummyBoard.length)][move % dummyBoard.length] = dummyNode.idAgent;//yo id

        let betaOne = new Node(childboard, dummyNode.idAgent, dummyNode, 99);//yo id

        if (betaOne.dijkstra(dummyNode.idAgent, childboard) === 0) {
            return move
        }

        let idOponent = "2";
        if (betaOne.idAgent !== "1") {
            idOponent = "1";
        }

        let movesBeta = getEmptyHex(childboard);
        for (let moveBeta of movesBeta) {
            let childboardBetaOne = betaOne.board.map(function (arr) { return arr.slice(); }); 

            childboardBetaOne[Math.floor(moveBeta / childboard.length)][moveBeta % childboard.length] = idOponent;
            let childNodeBetaOne = new Node(childboardBetaOne, idOponent, betaOne, -99);//oponente

            let movesChild = getEmptyHex(childboardBetaOne);
            for (let moveChild of movesChild) {

                var babyboardAlphaOne = childboardBetaOne.map(function (arr) { return arr.slice(); });
                babyboardAlphaOne[Math.floor(moveChild / childboardBetaOne.length)][moveChild % childboardBetaOne.length] = dummyNode.idAgent;
                var babyNodeAlphaOne = new Node(babyboardAlphaOne, dummyNode.idAgent, childNodeBetaOne, 99);//yo

                babyNodeAlphaOne.calculateHeuristic(babyNodeAlphaOne.idAgent,babyNodeAlphaOne.board);

                if (babyNodeAlphaOne.heuristic > childNodeBetaOne.heuristic) {
                    childNodeBetaOne.heuristic = babyNodeAlphaOne.heuristic;
                }
                if (babyNodeAlphaOne.heuristic >= betaOne.heuristic) {

                    break;
                }
                
            }
            
            primerNivel = primerNivel + 1;
            
            if (childNodeBetaOne.heuristic < betaOne.heuristic) {
                betaOne.heuristic = childNodeBetaOne.heuristic;
            }
            if (childNodeBetaOne.heuristic <= dummyNode.heuristic) {
                break;
            }
        }

        if (betaOne.heuristic > dummyNode.heuristic) {
            dummyNode.heuristic = betaOne.heuristic;
            choice = move;
        }
    }
    
    return opciones;
}
class Node {
    constructor(board, idAgent, parent, heuristic) {
        this.parent    = parent;
        this.board     = board
        this.idAgent   = idAgent;
        this.heuristic = heuristic;
    }

    calculateHeuristic(idIn, boardIn){
        let oponent = "1";
        if(idIn === "1"){
            oponent = "2";
        }
        //if (this.dijkstra(oponent))
        let heu = this.dijkstra(oponent, boardIn) - this.dijkstra(idIn, boardIn);
        //console.log("heu id:",idIn,"oponente: id:",oponent," ",this.dijkstra(oponent, boardIn)," propia:",this.dijkstra(idIn, boardIn));   
        this.heuristic = heu;
    }

    dijkstra(idIn, boardIn){
        let queueDijkstra = [];
        let size = boardIn.length;

        //A matrix of costs to save the min values found
        let costMatrix = new Array(size*size);
        costMatrix.fill(99);
        
        //A set to save the coordinates that i already check
        let visited = new Set();
        //A dictionary to asociate a symbol on board to the cost of arrive
        let initCosts={"1": 0, "2": 99, 0: 1}
        
        //Fill the first column if is '1'
        if(idIn === "1"){
            for(let i=0; i<size; i++){
                queueDijkstra.push(new nodeDijkstra(i*size, initCosts[boardIn[i][0]]));
                costMatrix[i*size]=initCosts[boardIn[i][0]];
                
            }
        }
        //Fill the first row if is '2'
        else{
            if(idIn === "2"){
                //If i want to check costs for idIn = '2' the symbol on board asociate to the cost is exchanged
                initCosts={"1": 99, "2": 0, 0: 1} 
                for(let i=0; i<size; i++){
                    queueDijkstra.push(new nodeDijkstra(i, initCosts[boardIn[0][i]]));
                    costMatrix[i]=initCosts[boardIn[0][i]];
                    
                }
            }
        }
        queueDijkstra.sort((a, b) => (a.weigth > b.weigth) ? 1 : -1);
        
        while(queueDijkstra.length){
            
            let currentNodeDijkstra = queueDijkstra.shift();
            
            //If we have visited this node has a min of the queue at some time, this cost is superior that that one
            //It is not necesary to check then
            if (visited.has(currentNodeDijkstra.coordinate)){
                continue;
            }
            visited.add(currentNodeDijkstra.coordinate);

            //check if is a win condiction depending on the player in
            if(idIn === "1"){
                if (((currentNodeDijkstra.coordinate + 1)% size) === 0){
                    
                    return currentNodeDijkstra.weigth;
                }
            }
            else{
                if(idIn=== "2"){
                    if(currentNodeDijkstra.coordinate >= ( size*size - size )){
                        return currentNodeDijkstra.weigth;
                    }
                }
            }
            //Get coordinates adyacent to a node. There are a list of numbers
            let childsCoordintes = this.getNeighborhoodCoordinate(currentNodeDijkstra, size)

            for (let childCoordinte of childsCoordintes){
                let rowChild = Math.floor(childCoordinte / size);
                let colChild = childCoordinte % size;
                //The cost of child is the weight of the current node plus the cost asociate to the symbol of board
                let costChild = currentNodeDijkstra.weigth + initCosts[boardIn[rowChild][colChild]];
                if( costChild < costMatrix[childCoordinte]){
                    costMatrix[childCoordinte] = costChild
                    queueDijkstra.push(new nodeDijkstra(childCoordinte, costChild));
                }
            }
            queueDijkstra.sort((a, b) => (a.weigth > b.weigth) ? 1 : -1);
        }
        return 99;
        
    }

    
    getNeighborhoodCoordinate(currentNodeDijkstraIn, size) {
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

}

class nodeDijkstra {
    constructor(coordinate, weigth) {
        this.coordinate = coordinate;
        this.weigth = weigth;
        
    }
}

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
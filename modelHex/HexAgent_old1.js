const Agent = require('ai-agents').Agent;
const horizontalAgent = "1"
const verticalAgent = "2"

class HexAgent extends Agent {
	constructor(value) {
		super(value)
		this.haveIDoneMyFirstMove = false
		this.adversaryMoves = []
	} 

	send() {
		try {
			let nextMove = move(this)

			if (nextMove == null || !isCellAvailable(nextMove, this.perception)) {
				// go to the nearest free cell in your direction				
				let freeCell = getNearestFreeCell(this)

				if (freeCell != null) {					
					return freeCell
				} 

				// else pick a random free cell								
				let available = getEmptyHex(this.perception)

				return available[Math.round(Math.random() * (available.length - 1))]
			}

			return nextMove

		} catch (e) {
			// if something went wrong, choose randomly			
			let available = getEmptyHex(this.perception)

			return available[Math.round(Math.random() * (available.length - 1))]
		}
	}
}

module.exports = HexAgent

/**
 * Returns the nearest available cell that connects with another agents cell
 */
function getNearestFreeCell(agent) {
	let board = fillBorders(agent)

	for (let i = 1; i < board.length - 1; i++) {
		for (let j = 1; j < board.length - 1; j++) {
			if (board[i][j] != 0) {
				continue
			}

			// if its an horizontal agent move in x direction
			if (agent.id == horizontalAgent) {
				if (board[i][j - 1] == agent.id || board[i][j + 1] == agent.id) {
					return [i - 1, j - 1]
				}
				continue
			}

			// if its a vertical agent move in y direction
			if (board[i - 1][j] == agent.id || board[i + 1][j] == agent.id) {
				return [i - 1, j - 1]
			}
		}
	}

	return null
}


/**
 * Returns which cell did the other agent played in its first turn
 * if the other player hasnt moved, a null is returned  
 */
function getAdversaryFirstMove(board) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board.length; j++) {
			if (board[i][j] != 0) {
				return [i, j]
			}
		}
	}
	return null
}

/**
 * Handles the agents first move
 */
function doFirstMove(agent) {
	let adversaryMove = getAdversaryFirstMove(agent.perception)

	if (adversaryMove == null) {
		return getBestFirstCell(agent.perception)
	}

	agent.adversaryMoves.push(adversaryMove)

	return getBestSecondCell(agent.perception, adversaryMove, agent.id)
}

/**
 * Specifies an agent move
 */
function move(agent) {
	if (!agent.haveIDoneMyFirstMove) {
		// set first move state
		agent.haveIDoneMyFirstMove = true
		// move
		return doFirstMove(agent)
	}

	let defensiveMove = checkBridgesAndDefend(agent)
	if (defensiveMove != null) {
		return defensiveMove
	}

	return getBestMove(agent)
}

/**
 * Checks if a cell is empty
 */
function isCellAvailable(cell, board) {
	try {
		return board[cell[0]][cell[1]] == 0
	} catch (e) {
		return false
	}
}

/**
 * Checks if an item is contained in an array
 */
function contains(items, item) {
	for (let i = 0; i < items.length; i++) {
		if (JSON.stringify(items[i]) == JSON.stringify(item)) {
			return true
		}
	}
	return false
}

/**
 * Builds the best possible first cells to play and returns one of them
 */
function getBestFirstCell(board) {
	let generatedCells = []

	for (let i = 0; i < board.length - 2; i++) {
		if (i + 1 == board.length - 2 - i) {
			continue // ignore center
		}

		generatedCells.push([i + 1, board.length - 2 - i])
	}

	return generatedCells[Math.floor(Math.random() * generatedCells.length)]
}

/**
 * Tries to go to the center, unless the first agent played there
 */
function getBestSecondCell(board, adversaryMove, agentID) {
	let boardCenter = getCenterCell(board)

	// if the center is free, choose it
	if (!(adversaryMove[0] == boardCenter[0] && adversaryMove[1] == boardCenter[1])) {
		return boardCenter
	}

	// if the first agent chose the center, try to block it
	if (agentID == horizontalAgent) {
		return [boardCenter[0] - 1, boardCenter[0]] //block in y
	}

	return [boardCenter[0], boardCenter[0] - 1] // block in x     
}

/**
 * Returns the cell of the center of the board
 */
function getCenterCell(board) {
	return [(board.length - 1) / 2, (board.length - 1) / 2]
}

/**
 * Fills the borders of the board with its corresponding agent id
 */
function fillBorders(agent) {
	let board = []

	for (let i = 0; i < agent.perception.length + 2; i++) {
		// fill vertical borders with the agent who wins going vertical
		if (i == 0 || i == agent.perception.length + 1) {
			board[i] = Array(agent.perception.length + 3).join(verticalAgent).split('')
			continue
		}

		// init row
		board[i] = Array(agent.perception.length + 3).join(0).split('')

		// fill horizontal borders with the agent who wins going horizontal
		for (let j = 0; j < agent.perception.length + 2; j++) {
			if (j == 0 || j == agent.perception.length + 1) {
				board[i][j] = horizontalAgent
				continue
			}

			board[i][j] = agent.perception[i - 1][j - 1]
		}
	}

	return board
}

/**
 * Checks if a bridge was affected by the adversary, if so, defends the bridge
 */
function checkBridgesAndDefend(agent) {
	let adversaryMove = getAdversaryLastMove(agent)

	if (adversaryMove == null) {
		return null
	}

	let board = fillBorders(agent)

	// there are 6 possible bridges to check in every direction
	// bridge 1
	if (adversaryMove[0] + 1 < board.length && adversaryMove[1] + 2 < board.length) {
		if (board[adversaryMove[0]][adversaryMove[1] + 1] == agent.id && board[adversaryMove[0] + 1][adversaryMove[1] + 2] == agent.id) {
			let cellToDefend = [adversaryMove[0] - 1, adversaryMove[1] + 1]

			if (isCellAvailable(cellToDefend, agent.perception)) {
				return cellToDefend
			}
		}
	}

	// bridge 2
	if (adversaryMove[0] + 2 < board.length && adversaryMove[1] + 1 < board.length) {
		if (board[adversaryMove[0]][adversaryMove[1] + 1] == agent.id && board[adversaryMove[0] + 2][adversaryMove[1]] == agent.id) {
			let cellToDefend = [adversaryMove[0], adversaryMove[1] - 1]

			if (isCellAvailable(cellToDefend, agent.perception)) {
				return cellToDefend
			}
		}
	}

	// bridge 3
	if (adversaryMove[0] + 1 < board.length && adversaryMove[1] + 2 < board.length) {
		if (board[adversaryMove[0]][adversaryMove[1] + 2] == agent.id && board[adversaryMove[0] + 1][adversaryMove[1]] == agent.id) {
			let cellToDefend = [adversaryMove[0] - 1, adversaryMove[1]]

			if (isCellAvailable(cellToDefend, agent.perception)) {
				return cellToDefend
			}
		}
	}

	// bridge 4
	if (adversaryMove[0] + 2 < board.length && adversaryMove[1] + 2 < board.length) {
		if (board[adversaryMove[0]][adversaryMove[1] + 2] == agent.id && board[adversaryMove[0] + 2][adversaryMove[1] + 1] == agent.id) {
			let cellToDefend = [adversaryMove[0], adversaryMove[1] + 1]

			if (isCellAvailable(cellToDefend, agent.perception)) {
				return cellToDefend
			}
		}
	}

	// bridge 5
	if (adversaryMove[0] + 2 < board.length && adversaryMove[1] + 2 < board.length) {
		if (board[adversaryMove[0] + 1][adversaryMove[1] + 2] == agent.id && board[adversaryMove[0] + 2][adversaryMove[1]] == agent.id) {
			let cellToDefend = [adversaryMove[0] + 1, adversaryMove[1]]

			if (isCellAvailable(cellToDefend, agent.perception)) {
				return cellToDefend
			}
		}
	}

	// bridge 6
	if (adversaryMove[0] + 2 < board.length && adversaryMove[1] + 1 < board.length) {
		if (board[adversaryMove[0] + 1][adversaryMove[1]] == agent.id && board[adversaryMove[0] + 2][adversaryMove[1] + 1] == agent.id) {
			let cellToDefend = [adversaryMove[0] + 1, adversaryMove[1] - 1]

			if (isCellAvailable(cellToDefend, agent.perception)) {
				return cellToDefend
			}
		}
	}

	return null
}

/**
 * Gets the adversary last move and updates the adversaryMoves list
 */
function getAdversaryLastMove(agent) {
	for (let i = 0; i < agent.perception.length; i++) {
		for (let j = 0; j < agent.perception.length; j++) {
			if (agent.perception[i][j] == 0 || agent.perception[i][j] == agent.id) {
				continue
			}

			if (contains(agent.adversaryMoves, [i, j])) {
				continue
			}

			agent.adversaryMoves.push([i, j])

			return [i, j]
		}
	}
	return null
}

function min(a, b) {
	if (b < a) {
		return b
	}

	return a
}

function max(a, b) {
	if (b > a) {
		return b
	}

	return a
}

function applyMoves(board, moves, id, oponentID) {
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

function minmax(board, moves, id, oponentID, depth, alpha, beta, shouldMaximize) {
	if (depth === 0) {
		return Number.MAX_SAFE_INTEGER - shortestPath(applyMoves(board, moves, id, oponentID), id).cost
	}

	if (shouldMaximize) {
		let score = -Number.MAX_SAFE_INTEGER

		let tempBoard = applyMoves(board, moves, id, oponentID)
		const newMoves = shortestPath(tempBoard, id).path
		tempBoard = null

		for (let i = 0; i < newMoves.length; i++) {
			let tempMoves = moves.slice()
			tempMoves.push(newMoves[i])

			score = max(score, minmax(board, tempMoves, id, oponentID, depth - 1, alpha, beta, false))
			alpha = max(alpha, score)

			if (alpha >= beta) {
				break
			}
		}

		return score
	}

	let score = Number.MAX_SAFE_INTEGER

	let tempBoard = applyMoves(board, moves, id, oponentID)
	const newMoves = shortestPath(tempBoard, oponentID).path
	tempBoard = null

	for (let i = 0; i < newMoves.length; i++) {
		let tempMoves = moves.slice()
		tempMoves.push(newMoves[i])

		score = min(score, minmax(board, tempMoves, id, oponentID, depth - 1, alpha, beta, true))
		beta = min(beta, score)

		if (alpha >= beta) {
			break
		}
	}

	return score
}

function getBestMove(agent) {
	let oponentID = '1'
	if (agent.id === '1') {
		oponentID = '2'
	}

	let score = -Number.MAX_SAFE_INTEGER
	const moves = shortestPath(agent.perception, agent.id).path
	if (moves == null) {
		return null
	}
	let move = []

	for (let i = 0; i < moves.length; i++) {
		let tempScore = minmax(agent.perception, [moves[i]], agent.id, oponentID, 4, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, false)

		if (tempScore > score) {
			score = tempScore
			move = moves[i]
		}
	}

	return move
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
				result.push([k, j]);
			}
		}
	}

	let r = []

	for (let i = 0; i < 2; i++) {
		if (i >= result.length) {
			break
		}

		r.push(result[Math.round(Math.random() * (result.length - 1))])
	}

	return r;
}

class PriorityQueue {
	constructor() {
		this.queue = []
	}

	insert(payload, order) {
		for (let i = 0; i < this.queue.length; i++) {
			if (order < this.queue[i].order) {
				this.queue.splice(i, 0, { payload: payload, order: order })
				return
			}
		}
		this.queue.push({ payload: payload, order: order })
	}

	// returns null if empty queue
	takeOutFirst() {
		let element = this.queue.shift()
		if (element == undefined) {
			return null
		}
		return element
	}

	// returns null if empty queue
	takeOutLast() {
		let element = this.queue.pop()
		if (element == undefined) {
			return null
		}
		return element
	}

	// selector is a function to evaluate the payload
	// returns null if no element is selected
	seekFirst(selector) {
		for (let i = 0; i < this.queue.length; i++) {
			if (selector(this.queue[i].payload)) {
				return this.queue[i]
			}
		}

		return null
	}

	// selector is a function to evaluate the payload
	deleteElement(selector) {
		for (let i = 0; i < this.queue.length; i++) {
			if (selector(this.queue[i].payload)) {
				this.queue.splice(i, 1)
			}
		}
	}
}

class Graph {
	constructor() {
		this.adjList = {}
	}

	addNode(node) {
		this.adjList[node] = []
	}

	addEdge(node1, node2, cost) {
		this.adjList[node1].push({ node: node2, cost: cost })
		this.adjList[node2].push({ node: node1, cost: cost })
	}

	// Checks that the nodes exists
	// and returns a bool depending on the result
	addEdgeSafelyOneDirection(node1, node2, cost) {
		if ((this.adjList[node1] == undefined) || (this.adjList[node2] == undefined)) {
			return false
		}

		this.adjList[node1].push({ node: node2, cost: cost })

		return true
	}

	addEdgeSafely(node1, node2, cost) {
		if ((this.adjList[node1] == undefined) || (this.adjList[node2] == undefined)) {
			return false
		}

		this.adjList[node1].push({ node: node2, cost: cost })
		this.adjList[node2].push({ node: node1, cost: cost })

		return true
	}

	shortestPath(origin, destination) {
		let tempQueue = new PriorityQueue()
		let finalQueue = new PriorityQueue()
		let done = []

		let nonConnected = false

		tempQueue.insert({ node: origin, from: origin }, 0)
		let current
		let currentInTempQueue
		while (true) {
			current = tempQueue.takeOutFirst()

			if (current == null) {
				nonConnected = true
				break
			}

			finalQueue.insert(current.payload, current.order)
			done.push(current.payload.node)

			if (current.payload.node == destination) {
				break
			}

			let adjNodes = this.adjList[current.payload.node]
			for (let i = 0; i < adjNodes.length; i++) {
				if (done.indexOf(adjNodes[i].node) >= 0) {
					continue
				}

				currentInTempQueue = tempQueue.seekFirst(function (payload) {
					return payload.node == adjNodes[i].node
				})

				if (currentInTempQueue == null) {
					tempQueue.insert({ node: adjNodes[i].node, from: current.payload.node }, current.order + adjNodes[i].cost)
					continue
				}

				if ((current.order + adjNodes[i].cost) < currentInTempQueue.order) {
					tempQueue.deleteElement(function (payload) {
						return payload.node == adjNodes[i].node
					})
					tempQueue.insert({ node: adjNodes[i].node, from: current.payload.node }, current.order + adjNodes[i].cost)
				}
			}
		}

		if (nonConnected) {
			return []
		}

		let path = []
		let nextNode
		current = finalQueue.takeOutLast()
		while (true) {
			if (current == null) {
				break
			}

			if (path.length == 0 || (current.payload.node == nextNode)) {
				path.splice(0, 0, current.payload.node)
				nextNode = current.payload.from
				current = finalQueue.takeOutLast()
				continue
			}

			current = finalQueue.takeOutLast()
		}

		return path
	}

	getEdgeCost(node1, node2) {
		for (let i = 0; i < this.adjList[node1].length; i++) {
			if (this.adjList[node1][i].node == node2) {
				return this.adjList[node1][i].cost
			}
		}

		return null
	}
}

function getCellAdjacents(board, i, j, myToken) {
	let size = board.length
	i = parseInt(i)
	j = parseInt(j)

	let cells = []

	if (i < size - 1 && j < size - 1 && board[i][j + 1] === 0 && board[i + 1][j] === 0) {
		cells.push({
			node: (i + 1).toString() + "," + (j + 1).toString(),
			cost: 3
		})
	}

	if (j < size - 1) {
		let cost = 4
		if (myToken == horizontalAgent) {
			cost = 2
		}

		cells.push({
			node: i.toString() + "," + (j + 1).toString(),
			cost: cost
		})
	}

	if (i < size - 1) {
		let cost = 4
		if (myToken == verticalAgent) {
			cost = 0
		}

		cells.push({
			node: (i + 1).toString() + "," + j.toString(),
			cost: cost
		})
	}

	if (i > 0 && j > 0 && board[i][j - 1] === 0 && board[i - 1][j] === 0) {
		cells.push({
			node: (i - 1).toString() + "," + (j - 1).toString(),
			cost: 3
		})
	}

	if (j > 0) {
		let cost = 4
		if (myToken == horizontalAgent) {
			cost = 0
		}

		cells.push({
			node: i.toString() + "," + (j - 1).toString(),
			cost: cost
		})
	}

	if (i > 0) {
		let cost = 4
		if (myToken == verticalAgent) {
			cost = 0
		}

		cells.push({
			node: (i - 1).toString() + "," + j.toString(),
			cost: cost
		})
	}

	if (i > 0 && j < size - 2 && board[i][j + 1] === 0 && board[i - 1][j + 1] === 0) {
		cells.push({
			node: (i - 1).toString() + "," + (j + 2).toString(),
			cost: 3
		})
	}

	if (i > 0 && j < size - 1) {
		cells.push({
			node: (i - 1).toString() + "," + (j + 1).toString(),
			cost: 4
		})
	}

	if (i > 1 && j < size - 1 && board[i - 1][j] === 0 && board[i - 1][j + 1] === 0) {
		let cost = 3
		if (myToken == verticalAgent) {
			cost = 1
		}

		cells.push({
			node: (i - 2).toString() + "," + (j + 1).toString(),
			cost: cost
		})
	}

	if (i < size - 1 && j > 1 && board[i][j - 1] === 0 && board[i + 1][j - 1] === 0) {
		let cost = 3
		if (myToken == verticalAgent) {
			cost = 1
		}

		cells.push({
			node: (i + 1).toString() + "," + (j - 2).toString(),
			cost: cost
		})
	}

	if (i < size - 1 && j > 0) {
		cells.push({
			node: (i + 1).toString() + "," + (j - 1).toString(),
			cost: 4
		})
	}

	if (i < size - 2 && j > 0 && board[i + 1][j] === 0 && board[i + 1][j - 1] === 0) {
		let cost = 3
		if (myToken == verticalAgent) {
			cost = 1
		}

		cells.push({
			node: (i + 2).toString() + "," + (j - 1).toString(),
			cost: cost
		})
	}

	return cells
}


function canConnect(cell, anotherCell, blockedCells) {
	const pos = cell.split(',')
	const i = parseInt(pos[0])
	const j = parseInt(pos[1])

	if (anotherCell === (i + "," + (j + 1))) {
		return true
	}

	if (anotherCell === ((i + 1) + "," + j)) {
		return true
	}

	if (anotherCell === (i + "," + (j - 1))) {
		return true
	}

	if (anotherCell === ((i - 1) + "," + j)) {
		return true
	}

	if (anotherCell === ((i - 1) + "," + (j + 1))) {
		return true
	}

	if (anotherCell === ((i + 1) + "," + (j - 1))) {
		return true
	}

	if (anotherCell === ((i + 1) + "," + (j + 1)) && !blockedCells.includes(i + "," + (j + 1)) && !blockedCells.includes((i + 1) + "," + j)) {
		return true
	}

	if (anotherCell === ((i - 1) + "," + (j - 1)) && !blockedCells.includes(i + "," + (j - 1)) && !blockedCells.includes((i - 1) + "," + j)) {
		return true
	}

	if (anotherCell === ((i - 1) + "," + (j + 2)) && !blockedCells.includes(i + "," + (j + 1)) && !blockedCells.includes((i - 1) + "," + (j + 1))) {
		return true
	}

	if (anotherCell === ((i - 2) + "," + (j + 1)) && !blockedCells.includes((i - 1) + "," + (j)) && !blockedCells.includes((i - 1) + "," + (j + 1))) {
		return true
	}

	if (anotherCell === ((i + 1) + "," + (j - 2)) && !blockedCells.includes(i + "," + (j - 1)) && !blockedCells.includes((i + 1) + "," + (j - 1))) {
		return true
	}

	if (anotherCell === ((i + 2) + "," + (j - 1)) && !blockedCells.includes((i + 1) + "," + j) && !blockedCells.includes((i + 1) + "," + (j - 1))) {
		return true
	}

	return false
}

function addToGroup(groups, cell, blockedCells) {
	for (let i = 0; i < groups.length; i++) {
		for (let j = 0; j < groups[i].length; j++) {
			if (canConnect(cell, groups[i][j], blockedCells)) {
				groups[i].push(cell)
				return
			}
		}
	}

	groups.push([cell])
}

function filterGroups(group, filteredGroups, blockedCells) {
	for (let i = 0; i < filteredGroups; i++) {
		for (let j = 0; j < filteredGroups[i]; j++) {
			for (let k = 0; k < group; k++) {
				if (canConnect(group[k], filteredGroups[i][j], blockedCells)) {
					filteredGroups[i].push(...group)
					return
				}
			}
		}
	}

	filteredGroups.push(group)
	return
}

function groupCells(claimedCells, blockedCells, board, id) {
	let groups = []

	while (claimedCells.length != 0) {
		let currentCell = claimedCells.pop()

		addToGroup(groups, currentCell, blockedCells)
	}

	let filteredGroups = groups
	let l = groups.length
	let shouldFilter = true

	while (shouldFilter) {
		let tempGroups = filteredGroups.slice()
		filteredGroups = []

		while (tempGroups.length > 0) {
			let group = tempGroups.pop()

			filterGroups(group, filteredGroups, blockedCells)
		}

		shouldFilter = l != filteredGroups.length
		l = filteredGroups.length
	}

	let filteredGroups2 = []
	let rest = []
	while (filteredGroups.length > 0) {
		let group = filteredGroups.pop()

		if (group.length <= 1) {
			rest.push(...group)
			continue
		}

		filteredGroups2.push(group)
	}

	return { groups: filteredGroups2, rest: rest }
}

function shortestPath(board, myToken) {
	// Select free tiles, oponentCells and my tiles
	let freeCells = []
	let myCells = []
	let oponentCells = []

	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board.length; j++) {
			if (board[i][j] == 0) {
				freeCells.push(i.toString() + "," + j.toString())
				continue
			}

			if (board[i][j] == myToken) {
				myCells.push(i.toString() + "," + j.toString())
				continue
			}

			oponentCells.push(i.toString() + "," + j.toString())
		}
	}

	// Find groups
	let groupsAndRest = groupCells(myCells, oponentCells, board, myToken)
	let groups = groupsAndRest.groups
	freeCells.push(...groupsAndRest.rest)

	// Create graph and nodes for free cells
	let graph = new Graph()
	for (let i = 0; i < freeCells.length; i++) {
		graph.addNode(freeCells[i])
	}

	// Create edges
	let adjCells
	let edgeCreated
	for (let i = 0; i < freeCells.length; i++) {
		adjCells = getCellAdjacents(board, ...freeCells[i].split(","), myToken)
		for (let j = 0; j < adjCells.length; j++) {
			edgeCreated = graph.addEdgeSafelyOneDirection(freeCells[i], adjCells[j].node, adjCells[j].cost)
			if (edgeCreated) continue

			for (let k = 0; k < groups.length; k++) {
				for (let l = 0; l < groups[k].length; l++) {
					if (groups[k][l] == adjCells[j].node) {
						edgeCreated = graph.addEdgeSafely(freeCells[i], "g" + k, adjCells[j].cost)
						if (edgeCreated) {
							k = groups.length
							break
						}

						graph.addNode("g" + k)
						graph.addEdgeSafely(freeCells[i], "g" + k, adjCells[j].cost)
					}
				}
			}
		}
	}

	if (myToken === horizontalAgent) {
		graph.addNode("left")
		graph.addNode("right")

		for (let i = 0; i < board.length; i++) {
			graph.addEdgeSafely("left", i + ",0", 100)
			graph.addEdgeSafely("right", i + "," + (board.length - 1), 100)
		}

		let theShortestPath = graph.shortestPath("left", "right")
		let theShortestPathCost = 0
		for (let i = 0; i < theShortestPath.length - 1; i++) {
			theShortestPathCost += graph.getEdgeCost(theShortestPath[i], theShortestPath[i + 1])
		}

		return { path: filterPath(theShortestPath, groupsAndRest.rest), cost: theShortestPathCost }
	}

	graph.addNode("up")
	graph.addNode("down")

	for (let i = 0; i < board.length; i++) {
		graph.addEdgeSafely("up", "0," + i, 100)
		graph.addEdgeSafely("down", (board.length - 1) + "," + i, 100)
	}

	let theShortestPath = graph.shortestPath("up", "down")
	let theShortestPathCost = 0
	for (let i = 0; i < theShortestPath.length - 1; i++) {
		theShortestPathCost += graph.getEdgeCost(theShortestPath[i], theShortestPath[i + 1])
	}

	return { path: filterPath(theShortestPath, groupsAndRest.rest), cost: theShortestPathCost }
}

function filterPath(path, rest) {
	let newPath = []

	path.forEach((node) => {
		if (rest.includes(node) || node === 'up' || node === 'down' || node === 'left' || node === 'right' || node.includes('g')) {
			return
		}

		let cell = node.split(',')
		newPath.push([parseInt(cell[0]), parseInt(cell[1])])
	})

	return newPath
}
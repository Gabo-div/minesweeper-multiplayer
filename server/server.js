const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Store game rooms
const gameRooms = new Map()

// Generate random room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Initialize game board
function initializeBoard(config) {
  const { boardSize, minesCount } = config
  const newBoard = []

  // Create empty board
  for (let i = 0; i < boardSize; i++) {
    newBoard[i] = []
    for (let j = 0; j < boardSize; j++) {
      newBoard[i][j] = {
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }
    }
  }

  // Place mines randomly
  let minesPlaced = 0
  while (minesPlaced < minesCount) {
    const row = Math.floor(Math.random() * boardSize)
    const col = Math.floor(Math.random() * boardSize)

    if (!newBoard[row][col].isMine) {
      newBoard[row][col].isMine = true
      minesPlaced++
    }
  }

  // Calculate neighbor mines
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (!newBoard[i][j].isMine) {
        newBoard[i][j].neighborMines = countNeighborMines(newBoard, i, j, boardSize)
      }
    }
  }

  return newBoard
}

function countNeighborMines(board, row, col, boardSize) {
  let count = 0
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i
      const newCol = col + j
      if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && board[newRow][newCol].isMine) {
        count++
      }
    }
  }
  return count
}

function revealEmptyNeighbors(board, row, col, boardSize) {
  let revealedCount = 0

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i
      const newCol = col + j
      if (
        newRow >= 0 &&
        newRow < boardSize &&
        newCol >= 0 &&
        newCol < boardSize &&
        !board[newRow][newCol].isRevealed &&
        !board[newRow][newCol].isMine &&
        !board[newRow][newCol].isFlagged
      ) {
        board[newRow][newCol].isRevealed = true
        revealedCount++
        if (board[newRow][newCol].neighborMines === 0) {
          revealedCount += revealEmptyNeighbors(board, newRow, newCol, boardSize)
        }
      }
    }
  }
  return revealedCount
}

function checkWinCondition(board, boardSize, minesCount) {
  let revealedCount = 0
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j].isRevealed && !board[i][j].isMine) {
        revealedCount++
      }
    }
  }
  return revealedCount === boardSize * boardSize - minesCount
}

function countFlags(board) {
  let flagCount = 0
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j].isFlagged) {
        flagCount++
      }
    }
  }
  return flagCount
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Create room
  socket.on("create-room", (data) => {
    const roomCode = generateRoomCode()
    const room = {
      code: roomCode,
      players: [{ id: socket.id, name: data.playerName, ready: false }],
      gameState: null,
      currentTurn: 0,
      config: data.config,
      gameStatus: "waiting",
      hostId: socket.id, // Track who is the host
    }

    gameRooms.set(roomCode, room)
    socket.join(roomCode)

    console.log(`Room ${roomCode} created by ${data.playerName}`)
    console.log(`Room now has ${room.players.length} players`)

    socket.emit("room-created", { roomCode, room })
  })

  // Join room
  socket.on("join-room", (data) => {
    console.log(`Attempting to join room: ${data.roomCode}`)
    const room = gameRooms.get(data.roomCode)

    if (!room) {
      console.log(`Room ${data.roomCode} not found`)
      socket.emit("error", { message: "Sala no encontrada. Verifica el código." })
      return
    }

    if (room.players.length >= 2) {
      console.log(`Room ${data.roomCode} is full`)
      socket.emit("error", { message: "La sala está llena" })
      return
    }

    // Check if player is already in the room (reconnection)
    const existingPlayer = room.players.find((p) => p.id === socket.id)
    if (!existingPlayer) {
      room.players.push({ id: socket.id, name: data.playerName, ready: false })
    }

    socket.join(data.roomCode)

    console.log(`${data.playerName} joined room ${data.roomCode}`)
    console.log(`Room now has ${room.players.length} players`)

    io.to(data.roomCode).emit("player-joined", { room })
  })

  // Player ready
  socket.on("player-ready", (data) => {
    const room = gameRooms.get(data.roomCode)
    if (!room) return

    const player = room.players.find((p) => p.id === socket.id)
    if (player) {
      player.ready = true
      console.log(`Player ${player.name} is ready in room ${data.roomCode}`)
    }

    // Check if both players are ready
    if (room.players.length === 2 && room.players.every((p) => p.ready)) {
      // Start game
      room.gameState = {
        board: initializeBoard(room.config),
        gameStatus: "playing",
        scores: [0, 0],
        flagsUsed: 0,
        timeElapsed: 0,
        startTime: Date.now(),
      }
      room.gameStatus = "playing"

      console.log(`Game started in room ${data.roomCode}`)
      io.to(data.roomCode).emit("game-started", { room })
    } else {
      io.to(data.roomCode).emit("player-ready-update", { room })
    }
  })

  // Make move
  socket.on("make-move", (data) => {
    const room = gameRooms.get(data.roomCode)
    if (!room || !room.gameState) return

    const playerIndex = room.players.findIndex((p) => p.id === socket.id)

    // Check if it's player's turn
    if (playerIndex !== room.currentTurn) {
      socket.emit("error", { message: "No es tu turno" })
      return
    }

    const { row, col, action } = data // action: 'reveal' or 'flag'
    const board = room.gameState.board
    const cell = board[row][col]

    if (cell.isRevealed) return

    let moveValid = false
    let additionalScore = 0

    if (action === "flag") {
      if (!cell.isFlagged && room.gameState.flagsUsed < room.config.minesCount) {
        cell.isFlagged = true
        room.gameState.flagsUsed++
        moveValid = true
      } else if (cell.isFlagged) {
        cell.isFlagged = false
        room.gameState.flagsUsed--
        moveValid = true
      }
    } else if (action === "reveal" && !cell.isFlagged) {
      cell.isRevealed = true
      additionalScore = 1
      moveValid = true

      if (cell.isMine) {
        // Game over - reveal all mines
        for (let i = 0; i < board.length; i++) {
          for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
              board[i][j].isRevealed = true
            }
          }
        }
        room.gameState.gameStatus = "lost"
        room.gameStatus = "finished"
      } else {
        // Reveal empty neighbors if no adjacent mines
        if (cell.neighborMines === 0) {
          additionalScore += revealEmptyNeighbors(board, row, col, room.config.boardSize)
        }

        // Check win condition
        if (checkWinCondition(board, room.config.boardSize, room.config.minesCount)) {
          room.gameState.gameStatus = "won"
          room.gameStatus = "finished"
        }
      }
    }

    if (moveValid) {
      room.gameState.scores[playerIndex] += additionalScore
      room.gameState.timeElapsed = Math.floor((Date.now() - room.gameState.startTime) / 1000)

      // Switch turns only if game is still playing
      if (room.gameState.gameStatus === "playing") {
        room.currentTurn = (room.currentTurn + 1) % 2
      }

      io.to(data.roomCode).emit("game-updated", { room })
    }
  })

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    // Remove player from rooms, but don't delete room if host leaves temporarily
    for (const [roomCode, room] of gameRooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id)
      if (playerIndex !== -1) {
        const playerName = room.players[playerIndex].name

        // If game hasn't started and it's not the host, remove player
        if (room.gameStatus === "waiting" && room.hostId !== socket.id) {
          room.players.splice(playerIndex, 1)
          console.log(`${playerName} left room ${roomCode}`)
          console.log(`Room now has ${room.players.length} players`)

          if (room.players.length === 0) {
            gameRooms.delete(roomCode)
            console.log(`Room ${roomCode} deleted`)
          } else {
            io.to(roomCode).emit("player-left", { room })
          }
        } else if (room.gameStatus === "playing") {
          // During game, notify other player but keep room alive for potential reconnection
          console.log(`${playerName} disconnected from active game in room ${roomCode}`)
          io.to(roomCode).emit("player-left", { room })
        } else if (room.hostId === socket.id && room.gameStatus === "waiting") {
          // If host leaves before game starts, keep room alive for a short time
          console.log(`Host ${playerName} left room ${roomCode} - keeping room alive temporarily`)
          setTimeout(() => {
            const currentRoom = gameRooms.get(roomCode)
            if (currentRoom && currentRoom.gameStatus === "waiting" && currentRoom.players.length <= 1) {
              gameRooms.delete(roomCode)
              console.log(`Room ${roomCode} deleted after host timeout`)
            }
          }, 30000) // Keep room alive for 30 seconds
        }
        break
      }
    }
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Minesweeper server running on port ${PORT}`)
})

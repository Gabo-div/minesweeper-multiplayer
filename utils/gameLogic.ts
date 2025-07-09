import type { Cell, GameConfig } from "../types/game"

export const initializeBoard = (config: GameConfig): Cell[][] => {
  const { boardSize, minesCount } = config
  const newBoard: Cell[][] = []

  // Crear tablero vacío
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

  // Colocar minas aleatoriamente
  let minesPlaced = 0
  while (minesPlaced < minesCount) {
    const row = Math.floor(Math.random() * boardSize)
    const col = Math.floor(Math.random() * boardSize)

    if (!newBoard[row][col].isMine) {
      newBoard[row][col].isMine = true
      minesPlaced++
    }
  }

  // Calcular números de minas vecinas
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (!newBoard[i][j].isMine) {
        newBoard[i][j].neighborMines = countNeighborMines(newBoard, i, j, boardSize)
      }
    }
  }

  return newBoard
}

export const countNeighborMines = (board: Cell[][], row: number, col: number, boardSize: number): number => {
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

export const revealEmptyNeighbors = (
  board: Cell[][],
  row: number,
  col: number,
  boardSize: number): number => {
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

export const checkWinCondition = (board: Cell[][], boardSize: number, minesCount: number): boolean => {
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

export const countFlags = (board: Cell[][]): number => {
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

export interface Cell {
    isMine: boolean; // Indicates if the cell is a mine
    isRevealed: boolean; // Indicates if the cell has been revealed
    isFlagged: boolean; // Indicates if the cell has been flagged
    neighborMines: number; // Number of mines in adjacent cells
    }

export interface GameState {
    board: Cell[][]; // 2D array representing the game boardd
    gameStatus: "playing" | "won" | "lost";
    score: number; // Current score of the game
    flagsUsed: number; // Number of flags used
    timeElapsed: number; // Time elapsed since the game started
}

export type Difficulty = "easy" | "medium" | "hard";

export interface GameConfig {
    boardSize: number; // Size of the game board
    minesCount: number; // Number of mines on the board
    cellSize: number; // Size of each cell in pixels
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, GameConfig> = {
  easy: {
    boardSize: 8,
    minesCount: 10,
    cellSize: 40,
  },
  medium: {
    boardSize: 12,
    minesCount: 25,
    cellSize: 30,
  },
  hard: {
    boardSize: 16,
    minesCount: 50,
    cellSize: 25,
  },
}

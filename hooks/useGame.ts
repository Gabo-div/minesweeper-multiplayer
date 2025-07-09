"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import type { GameConfig, GameState } from "../types/game";
import {
    checkWinCondition,
    countFlags,
    initializeBoard,
    revealEmptyNeighbors,
} from "../utils/gameLogic";

export const useGame = (config: GameConfig) => {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    gameStatus: "playing",
    score: 0,
    flagsUsed: 0,
    timeElapsed: 0,
  });

  const timeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const timeRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startNewGame = useCallback(() => {
    const newBoard = initializeBoard(config);
    setGameState({
      board: newBoard,
      gameStatus: "playing",
      score: 0,
      flagsUsed: 0,
      timeElapsed: 0,
    });

    // Reiniciar temporizador
    if (timeRef.current) {
      clearInterval(timeRef.current);
    }
    startTimeRef.current = Date.now();

    timeRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setGameState((prev) => ({
          ...prev,
          timeElapsed: Math.floor((Date.now() - startTimeRef.current!) / 1000),
        }));
      }
    }, 1000);
  }, [config]);

  const stopTimer = useCallback(() => {
    if (timeRef.current) {
      clearInterval(timeRef.current);
      timeRef.current = null;
    }
  }, []);

  const revealCell = useCallback(
    (row: number, col: number) => {
      if (
        gameState.gameStatus !== "playing" ||
        gameState.board[row][col].isRevealed ||
        gameState.board[row][col].isFlagged
      ) {
        return;
      }

      setGameState((prevState) => {
        const newBoard = [...prevState.board.map((row) => [...row])];
        newBoard[row][col].isRevealed = true;

        let newGameStatus = prevState.gameStatus;
        let newScore = prevState.score + 1;

        if (newBoard[row][col].isMine) {
          newGameStatus = "lost";
          stopTimer();

          // Reveal todas las minas
          for (let i = 0; i < newBoard.length; i++) {
            for (let j = 0; j < newBoard[i].length; j++) {
              if (newBoard[i][j].isMine) {
                newBoard[i][j].isRevealed = true;
              }
            }
          }

          Alert.alert(
            "¡Boom! 💣",
            `Tocaste una mina!\n\nPuntaje Final: ${newScore}\nTiempo: ${prevState.timeElapsed}s`
          );
        } else {
          // Si la celda no tiene minas vecinas, revelar automáticamente las vecinas
          if (newBoard[row][col].neighborMines === 0) {
            const additionalRevealed = revealEmptyNeighbors(
              newBoard,
              row,
              col,
              config.boardSize
            );
            newScore += additionalRevealed;
          }

          // Verificar condición de victoria
          if (
            checkWinCondition(newBoard, config.boardSize, config.minesCount)
          ) {
            newGameStatus = "won";
            stopTimer();
            Alert.alert(
              "¡Felicidades! 🎉",
              `Has ganado el juego!\n\nPuntaje Final: ${newScore}\nTiempo: ${prevState.timeElapsed}s`
            );
          }
        }

        return {
          ...prevState,
          board: newBoard,
          gameStatus: newGameStatus,
          score: newScore,
        };
      });
    },
    [gameState.gameStatus, gameState.board, config.boardSize, config.minesCount, stopTimer]
  );

  const toggleFlag = useCallback(
    (row: number, col: number) => {
      if (
        gameState.gameStatus !== "playing" ||
        gameState.board[row][col].isRevealed
      ) {
        return;
      }

      setGameState((prevState) => {
        const newBoard = [...prevState.board.map((row) => [...row])];
        newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;

        const newFlagsUsed = countFlags(newBoard);

        return { 
          ...prevState, 
          board: newBoard,
          flagsUsed: newFlagsUsed,
        };
      });
    },
    [gameState.gameStatus, gameState.board]
  );

  useEffect(() => {
    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    }
  }, []);

  return {
    gameState,
    startNewGame,
    revealCell,
    toggleFlag,
    minesRemaining: config.minesCount - gameState.flagsUsed,
  };
};

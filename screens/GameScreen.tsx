"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react"; // Importa useRef

import { GameBoard } from "@/components/GameBoard";
import { GameHeader } from "@/components/GameHeader";
import { useGame } from "@/hooks/useGame";
import { socketService, type MultiplayerRoom } from "@/services/socketService";
import type { Difficulty } from "@/types/game";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DIFFICULTY_CONFIGS } from "../types/game";

interface GameScreenProps {
  difficulty: Difficulty;
  onBack: () => void;
  onBackToHome: () => void;
  // Add multiplayer props
  isMultiplayer?: boolean;
  multiplayerRoom?: MultiplayerRoom;
  roomCode?: string;
}
export const GameScreen: React.FC<GameScreenProps> = ({
  difficulty,
  onBack,
  onBackToHome,
  isMultiplayer = false,
  multiplayerRoom,
  roomCode,
}) => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const [multiplayerState, setMultiplayerState] =
    useState<MultiplayerRoom | null>(multiplayerRoom || null);

  // Use different game logic for multiplayer vs single player
  const singlePlayerGame = useGame(config);

  // Usa un ref para rastrear si el juego de un solo jugador ha sido inicializado
  const isSinglePlayerGameInitialized = useRef(false);
  const hasGameEndedAlertBeenShown = useRef(false); // Nuevo ref para controlar la alerta de fin de juego

  // Set up multiplayer listeners
  useEffect(() => {
    if (isMultiplayer && roomCode) {
      socketService.onGameUpdated((data) => {
        console.log(
          "[CLIENT] Game updated received. New board state (first 3x3):",
          data.room.gameState?.board
            ? data.room.gameState.board
                .slice(0, 3)
                .map((row) => row.slice(0, 3))
            : "Game state is null"
        );
        // Deep copy the received room to ensure React detects state change
        setMultiplayerState(JSON.parse(JSON.stringify(data.room)));
      });

      socketService.onPlayerLeft((data) => {
        // Recibe data para actualizar la sala
        setMultiplayerState(data.room); // Actualiza el estado de la sala para reflejar el jugador que se fue
        Alert.alert(
          "Jugador Desconectado",
          "El otro jugador ha abandonado el juego",
          [{ text: "OK", onPress: onBackToHome }]
        );
      });

      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [isMultiplayer, roomCode, onBackToHome]);

  // Add this useEffect right after the existing useEffect for multiplayer listeners
  useEffect(() => {
    if (multiplayerRoom) {
      console.log(
        "[CLIENT] Syncing multiplayerState with multiplayerRoom prop:",
        multiplayerRoom
      );
      setMultiplayerState(JSON.parse(JSON.stringify(multiplayerRoom))); // Deep copy here too
    }
  }, [multiplayerRoom]); // Dependency on multiplayerRoom prop

  // Inicializa el juego de un solo jugador solo una vez al entrar en modo de un solo jugador
  useEffect(() => {
    if (!isMultiplayer && !isSinglePlayerGameInitialized.current) {
      singlePlayerGame.startNewGame();
      isSinglePlayerGameInitialized.current = true;
    }
    // Si cambiamos a multijugador, resetea la bandera para que pueda reinicializarse si volvemos a un solo jugador
    if (isMultiplayer) {
      isSinglePlayerGameInitialized.current = false;
    }
  }, [isMultiplayer, singlePlayerGame]); // singlePlayerGame es un objeto estable si config es estable

  // Nuevo useEffect para manejar el fin del juego multijugador
  useEffect(() => {
    if (
      isMultiplayer &&
      multiplayerState &&
      multiplayerState.gameStatus === "finished" &&
      !hasGameEndedAlertBeenShown.current
    ) {
      const { gameState, players } = multiplayerState;
      const myPlayerId = socketService.socket?.id;
      const myPlayerIndex = players.findIndex((p) => p.id === myPlayerId);
      const otherPlayerIndex = myPlayerIndex === 0 ? 1 : 0;

      let title = "";
      let message = "";

      if (gameState?.gameStatus === "won") {
        title = "¡Felicidades! 🎉";
        message = `¡Has ganado el juego!\n\nTu puntaje: ${
          gameState.scores[myPlayerIndex]
        }\nPuntaje de ${players[otherPlayerIndex]?.name || "tu oponente"}: ${
          gameState.scores[otherPlayerIndex]
        }\nTiempo: ${gameState.timeElapsed}s`;
      } else if (gameState?.gameStatus === "lost") {
        title = "¡Boom! 💣";
        message = `¡Tocaste una mina!\n\nTu puntaje: ${
          gameState.scores[myPlayerIndex]
        }\nPuntaje de ${players[otherPlayerIndex]?.name || "tu oponente"}: ${
          gameState.scores[otherPlayerIndex]
        }\nTiempo: ${gameState.timeElapsed}s`;
      }

      if (title && message) {
        Alert.alert(title, message, [{ text: "OK", onPress: onBackToHome }]);
        hasGameEndedAlertBeenShown.current = true; // Marca que la alerta ya se mostró
      }
    }
    // Resetear la bandera si el juego vuelve a un estado de "playing" o "waiting"
    if (multiplayerState && multiplayerState.gameStatus !== "finished") {
      hasGameEndedAlertBeenShown.current = false;
    }
  }, [isMultiplayer, multiplayerState, onBackToHome]); // Dependencias para este useEffect

  // Get current game state based on mode
  const getCurrentGameState = () => {
    if (isMultiplayer && multiplayerState?.gameState) {
      return {
        board: multiplayerState.gameState.board,
        gameStatus: multiplayerState.gameState.gameStatus,
        score: multiplayerState.gameState.scores.reduce((a, b) => a + b, 0),
        flagsUsed: multiplayerState.gameState.flagsUsed, // Asegúrate de pasar flagsUsed
        timeElapsed: multiplayerState.gameState.timeElapsed,
      };
    }
    return singlePlayerGame.gameState;
  };

  const getCurrentMinesRemaining = () => {
    if (isMultiplayer && multiplayerState?.gameState) {
      return config.minesCount - multiplayerState.gameState.flagsUsed;
    }
    return singlePlayerGame.minesRemaining;
  };

  const handleCellPress = (row: number, col: number) => {
    console.log(`[CLIENT] handleCellPress called for: (${row}, ${col})`);
    if (isMultiplayer && roomCode) {
      const turnInfo = getCurrentTurnInfo();
      console.log(
        `[CLIENT] Multiplayer mode active. Turn Info: ${JSON.stringify(
          turnInfo
        )}`
      );
      console.log(
        `[CLIENT] Current Game Status: ${currentGameState.gameStatus}`
      );

      if (turnInfo?.isMyTurn && currentGameState.gameStatus === "playing") {
        console.log(
          `[CLIENT] CONFIRM: It is my turn (${turnInfo.isMyTurn}) and game is playing. Sending reveal move.`
        );
        socketService.makeMove(roomCode, row, col, "reveal");
      } else if (!turnInfo?.isMyTurn) {
        console.log("[CLIENT] Not my turn. Showing alert.");
        Alert.alert(
          "Espera tu turno",
          "No es tu turno para hacer un movimiento."
        );
      } else {
        console.log(
          "[CLIENT] Move not allowed: Game not playing or other condition."
        );
      }
    } else {
      console.log("[CLIENT] Single player mode. Revealing cell.");
      singlePlayerGame.revealCell(row, col);
    }
  };

  const handleCellLongPress = (row: number, col: number) => {
    console.log(`[CLIENT] handleCellLongPress called for: (${row}, ${col})`);

    const cell = currentGameState.board[row][col];

    if (cell.isRevealed) return;

    const flagsUsed = currentGameState.board
      .flat()
      .filter((c) => c.isFlagged).length;
    const maxFlags = config.minesCount;

    if (!cell.isFlagged && flagsUsed >= maxFlags) {
      Alert.alert(
        "Límite de Banderas Alcanzado",
        `Ya has usado el máximo de ${maxFlags} banderas. No puedes marcar más.`
      );
      return;
    }

    if (isMultiplayer && roomCode) {
      const turnInfo = getCurrentTurnInfo();
      console.log(
        `[CLIENT] Multiplayer mode active. Turn Info: ${JSON.stringify(
          turnInfo
        )}`
      );
      console.log(
        `[CLIENT] Current Game Status: ${currentGameState.gameStatus}`
      );

      if (turnInfo?.isMyTurn && currentGameState.gameStatus === "playing") {
        console.log(
          `[CLIENT] CONFIRM: It is my turn (${turnInfo.isMyTurn}) and game is playing. Sending flag move.`
        );
        socketService.makeMove(roomCode, row, col, "flag");
      } else if (!turnInfo?.isMyTurn) {
        console.log("[CLIENT] Not my turn. Showing alert.");
        Alert.alert(
          "Espera tu turno",
          "No es tu turno para marcar una bandera."
        );
      } else {
        console.log(
          "[CLIENT] Move not allowed: Game not playing or other condition."
        );
      }
    } else {
      console.log("[CLIENT] Single player mode. Toggling flag.");
      singlePlayerGame.toggleFlag(row, col);
    }
  };

  const handleNewGame = () => {
    if (isMultiplayer) {
      Alert.alert(
        "Nuevo Juego",
        "En modo multijugador, debes salir y crear una nueva sala para jugar otra vez.",
        [
          { text: "OK", onPress: onBackToHome }, // Vuelve a la pantalla de inicio para crear una nueva sala
        ]
      );
    } else {
      singlePlayerGame.startNewGame();
    }
  };

  const currentGameState = getCurrentGameState();
  const currentMinesRemaining = getCurrentMinesRemaining();

  // Get current turn info for multiplayer
  const getCurrentTurnInfo = () => {
    if (!isMultiplayer || !multiplayerState) return null;

    const currentPlayer =
      multiplayerState.players[multiplayerState.currentTurn];
    const isMyTurn = currentPlayer?.id === socketService.socket?.id;

    return {
      currentPlayerName: currentPlayer?.name || "Desconocido",
      isMyTurn,
    };
  };

  const turnInfo = getCurrentTurnInfo();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <LinearGradient
        colors={[
          "#E2885C",
          "#E2885C",
          "#DD815C",
          "#DD815C",
          "#D97C5B",
          "#D97C5B",
          "#D67859",
          "#D67859",
          "#D47558",
          "#D47558",
          "#D27457",
          "#D27457",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.8, y: 1 }}
        locations={[
          0, 0.23, 0.23, 0.32, 0.32, 0.42, 0.42, 0.52, 0.52, 0.62, 0.62, 1,
        ]}
        style={styles.container}
      >
        <GameHeader
          score={currentGameState.score}
          minesRemaining={currentMinesRemaining}
          timeElapsed={currentGameState.timeElapsed}
          difficulty={difficulty}
          gameStatus={currentGameState.gameStatus}
        />

        {/* Multiplayer turn indicator */}
        {isMultiplayer && turnInfo && (
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>
              {turnInfo.isMyTurn
                ? "🎯 Tu turno"
                : `⏳ Turno de ${turnInfo.currentPlayerName}`}
            </Text>
          </View>
        )}

        <GameBoard
          board={currentGameState.board}
          config={config}
          onCellPress={handleCellPress}
          onCellLongPress={handleCellLongPress}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.newGameButton}
            onPress={handleNewGame}
          >
            <Text style={styles.newGameButtonText}>
              {isMultiplayer ? "🏠 Nueva Sala" : "🔄 New Game"}
            </Text>
          </TouchableOpacity>

          <View style={styles.navigationButtons}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>↩ Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={onBackToHome}>
              <Text style={styles.homeButtonText}>🏠 Inicio</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Toca para revelar • Mantén presionado para bandera
          </Text>
          {isMultiplayer && (
            <Text style={styles.instructionText}>
              🎮 Modo Multijugador - Turnos alternados
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
  buttonContainer: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    gap: 15,
  },
  newGameButton: {
    backgroundColor: "#A9E2B3",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    // borderTopWidth: 2,
    // borderLeftWidth: 2,
    borderColor: "#5c9779",
    shadowColor: "#5c9779",
    ...Platform.select({
      android: {
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 4,
        shadowRadius: 0,
        elevation: 6,
      },
      ios: {
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 4,
        shadowRadius: 0,
      },
    }),
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 4,
    shadowRadius: 0,
    elevation: 6,
    alignItems: "center",
  },
  newGameButtonText: {
    fontSize: 14,
    color: "#1B1B1B",
    fontFamily: "PressStart2P",
    textTransform: "uppercase",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#B5B5B5",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    // borderTopWidth: 2,
    // borderLeftWidth: 2,
    borderColor: "#616467",
    shadowColor: "#616467",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 4,
    shadowRadius: 0,
    elevation: 6,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 12,
    color: "#1B1B1B",
    fontFamily: "PressStart2P",
    textTransform: "uppercase",
  },
  homeButton: {
    flex: 1,
    backgroundColor: "#F8B65C",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    // borderTopWidth: 2,
    // borderLeftWidth: 2,
    borderColor: "#d09a4e",
    shadowColor: "#d09a4e",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 4,
    shadowRadius: 0,
    elevation: 6,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 12,
    color: "#1B1B1B",
    fontFamily: "PressStart2P",
    textTransform: "uppercase",
  },
  instructions: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 20,
    fontFamily: "Jersey10",
    color: "#fff",
    textAlign: "center",
    margin: 5,
  },
  turnIndicator: {
    backgroundColor: "#A9E2B3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#5c9779",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  turnText: {
    fontSize: 18,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    fontWeight: "bold",
  },
});

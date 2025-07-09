"use client";

import type React from "react";

import { GameBoard } from "@/components/GameBoard";
import { GameHeader } from "@/components/GameHeader";
import { useGame } from "@/hooks/useGame";
import type { Difficulty } from "@/types/game";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DIFFICULTY_CONFIGS } from "../types/game";

interface GameScreenProps {
  difficulty: Difficulty;
  onBack: () => void;
  onBackToHome: () => void;
}
export const GameScreen: React.FC<GameScreenProps> = ({
  difficulty,
  onBack,
  onBackToHome,
}) => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const { gameState, startNewGame, revealCell, toggleFlag, minesRemaining } =
    useGame(config);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  return (
    <LinearGradient
      colors={[
        "#E2885C",
        "#E2885C", // Franja 1 (duplicado)
        "#DD815C",
        "#DD815C", // Franja 2
        "#D97C5B",
        "#D97C5B", // Franja 3
        "#D67859",
        "#D67859", // Franja 4
        "#D47558",
        "#D47558", // Franja 5
        "#D27457",
        "#D27457", // Franja 6
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1.8, y: 1 }}
      locations={[
        0, 0.23, 0.23, 0.32, 0.32, 0.42, 0.42, 0.52, 0.52, 0.62, 0.62, 1,
      ]}
      style={styles.container}
    >
      <GameHeader
        score={gameState.score}
        minesRemaining={minesRemaining}
        timeElapsed={gameState.timeElapsed}
        difficulty={difficulty}
        gameStatus={gameState.gameStatus}
      />

      <GameBoard
        board={gameState.board}
        config={config}
        onCellPress={revealCell}
        onCellLongPress={toggleFlag}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.newGameButton} onPress={startNewGame}>
          <Text style={styles.newGameButtonText}>🔄 New Game</Text>
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
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
});

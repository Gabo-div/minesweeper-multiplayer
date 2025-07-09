import { DifficultyScreen } from "@/screens/DifficultyScreen";
import { GameScreen } from "@/screens/GameScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import type { Difficulty } from "@/types/game";
import { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

type Screen = "home" | "difficulty" | "game";


export default function HomeMenu() {
const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("easy");

  const handleLocalPlay = () => {
    setCurrentScreen("difficulty");
  };

  const handleMultiplayer = () => {
    alert("Multijugador proximamente");
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentScreen("game");
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
  };

  const handleBackToDifficulty = () => {
    setCurrentScreen("difficulty");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return (
          <HomeScreen
            onLocalPlay={handleLocalPlay}
            onMultiplayer={handleMultiplayer}
          />
        );
      case "difficulty":
        return (
          <DifficultyScreen
            onDifficultySelect={handleDifficultySelect}
            onBack={handleBackToHome}
          />
        );
      case "game":
        return (
          <GameScreen
            difficulty={selectedDifficulty}
            onBack={handleBackToDifficulty}
            onBackToHome={handleBackToHome}
          />
        );
      default:
        return (
          <HomeScreen
            onLocalPlay={handleLocalPlay}
            onMultiplayer={handleMultiplayer}
          />
        );
    }
  };

  return <SafeAreaView style={styles.container}>{renderScreen()}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
});

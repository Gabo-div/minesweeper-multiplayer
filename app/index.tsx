"use client"

import { DifficultyScreen } from "@/screens/DifficultyScreen"
import { GameScreen } from "@/screens/GameScreen"
import { HomeScreen } from "@/screens/HomeScreen"
import type { Difficulty } from "@/types/game"
import { DIFFICULTY_CONFIGS } from "@/types/game"
import { useState } from "react"
import { SafeAreaView, StyleSheet } from "react-native"
import { MultiplayerConnectionScreen } from "../screens/MultiplayerConnectionScreen"
import { MultiplayerLobbyScreen } from "../screens/MultiplayerLobbyScreen"
import type { MultiplayerRoom } from "../services/socketService"

type Screen = "home" | "difficulty" | "game" | "multiplayerConnection" | "multiplayerLobby"

export default function HomeMenu() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy")
  const [isMultiplayer, setIsMultiplayer] = useState(false)

  // Multiplayer state
  const [roomCode, setRoomCode] = useState<string>("")
  const [isHost, setIsHost] = useState(false)
  const [multiplayerRoom, setMultiplayerRoom] = useState<MultiplayerRoom | null>(null)

  const handleLocalPlay = () => {
    setIsMultiplayer(false)
    setCurrentScreen("difficulty")
  }

  const handleMultiplayer = () => {
    setIsMultiplayer(true)
    setCurrentScreen("difficulty")
  }

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty)
    if (isMultiplayer) {
      setCurrentScreen("multiplayerConnection")
    } else {
      setCurrentScreen("game")
    }
  }

  const handleMultiplayerGameStart = (roomCode: string, isHost: boolean) => {
    setRoomCode(roomCode)
    setIsHost(isHost)
    setCurrentScreen("multiplayerLobby")
  }

  const handleLobbyGameStart = (room: MultiplayerRoom) => {
    setMultiplayerRoom(room)
    setCurrentScreen("game")
  }

  const handleBackToHome = () => {
    setCurrentScreen("home")
    setIsMultiplayer(false)
    setRoomCode("")
    setIsHost(false)
    setMultiplayerRoom(null)
  }

  const handleBackToDifficulty = () => {
    if (isMultiplayer) {
      setCurrentScreen("difficulty")
      setRoomCode("")
      setIsHost(false)
      setMultiplayerRoom(null)
    } else {
      setCurrentScreen("difficulty")
    }
  }

  const handleBackToConnection = () => {
    setCurrentScreen("multiplayerConnection")
    setRoomCode("")
    setIsHost(false)
    setMultiplayerRoom(null)
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen onLocalPlay={handleLocalPlay} onMultiplayer={handleMultiplayer} />
      case "difficulty":
        return <DifficultyScreen onDifficultySelect={handleDifficultySelect} onBack={handleBackToHome} />
      case "multiplayerConnection":
        return (
          <MultiplayerConnectionScreen
            difficulty={selectedDifficulty}
            config={DIFFICULTY_CONFIGS[selectedDifficulty]}
            onGameStart={handleMultiplayerGameStart}
            onBack={handleBackToDifficulty}
          />
        )
      case "multiplayerLobby":
        return (
          <MultiplayerLobbyScreen
            roomCode={roomCode}
            isHost={isHost}
            difficulty={selectedDifficulty}
            onGameStart={handleLobbyGameStart}
            onBack={handleBackToConnection}
          />
        )
      case "game":
        return (
          <GameScreen
            difficulty={selectedDifficulty}
            onBack={isMultiplayer ? handleBackToConnection : handleBackToDifficulty}
            onBackToHome={handleBackToHome}
            isMultiplayer={isMultiplayer}
            multiplayerRoom={multiplayerRoom ?? undefined}
            roomCode={roomCode}
          />
        )
      default:
        return <HomeScreen onLocalPlay={handleLocalPlay} onMultiplayer={handleMultiplayer} />
    }
  }

  return <SafeAreaView style={styles.container}>{renderScreen()}</SafeAreaView>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
})

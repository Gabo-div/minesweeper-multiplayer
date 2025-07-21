"use client"

import type React from "react"

import { socketService, type MultiplayerRoom } from "@/services/socketService"
import type { Difficulty } from "@/types/game"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface MultiplayerLobbyScreenProps {
  roomCode: string
  isHost: boolean
  difficulty: Difficulty
  onGameStart: (room: MultiplayerRoom) => void
  onBack: () => void
}

const difficultyNames = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
}

export const MultiplayerLobbyScreen: React.FC<MultiplayerLobbyScreenProps> = ({
  roomCode,
  isHost,
  difficulty,
  onGameStart,
  onBack,
}) => {
  const [room, setRoom] = useState<MultiplayerRoom | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Set up socket listeners
    socketService.onRoomCreated((data) => {
      console.log("Room created:", data.room)
      setRoom(data.room)
    })

    socketService.onPlayerJoined((data) => {
      console.log("Player joined:", data.room)
      setRoom(data.room)
    })

    socketService.onPlayerReady((data) => {
      console.log("Player ready update:", data.room)
      setRoom(data.room)
    })

    socketService.onGameStarted((data) => {
      console.log("Game started:", data.room)
      onGameStart(data.room)
    })

    socketService.onPlayerLeft((data) => {
      console.log("Player left:", data.room)
      setRoom(data.room)
      Alert.alert("Jugador Desconectado", "Un jugador ha abandonado la sala")
    })

    socketService.onError((error) => {
      console.log("Socket error:", error)
      Alert.alert("Error", error.message)
    })

    return () => {
      socketService.removeAllListeners()
    }
  }, [onGameStart])

  const handleReady = () => {
    setIsReady(true)
    socketService.setPlayerReady(roomCode)
  }

  const getPlayerStatus = (player: any) => {
    if (player.ready) {
      return "✅ Listo"
    }
    return "⏳ Esperando..."
  }

  const canStartGame = room && room.players.length === 2
  const allPlayersReady = room && room.players.every((p) => p.ready)

  return (
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
      locations={[0, 0.23, 0.23, 0.32, 0.32, 0.42, 0.42, 0.52, 0.52, 0.62, 0.62, 1]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>SALA DE ESPERA</Text>

        <View style={styles.roomInfoContainer}>
          <Text style={styles.roomCode}>Código: {roomCode}</Text>
          <Text style={styles.difficulty}>Dificultad: {difficultyNames[difficulty]}</Text>
        </View>

        <View style={styles.playersContainer}>
          <Text style={styles.playersTitle}>Jugadores ({room?.players.length || 0}/2):</Text>

          {room?.players.map((player, index) => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.playerName}>
                {player.name} {isHost && index === 0 ? "(Anfitrión)" : ""}
              </Text>
              <Text style={styles.playerStatus}>{getPlayerStatus(player)}</Text>
            </View>
          ))}

          {(!room || room.players.length < 2) && (
            <View style={styles.waitingCard}>
              <Text style={styles.waitingText}>🔄 Esperando al segundo jugador...</Text>
              <Text style={styles.waitingSubtext}>Comparte el código de sala: {roomCode}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {canStartGame && !isReady && (
            <TouchableOpacity style={[styles.button, styles.readyButton]} onPress={handleReady}>
              <Text style={styles.buttonText}>✅ ESTOY LISTO</Text>
            </TouchableOpacity>
          )}

          {isReady && !allPlayersReady && (
            <View style={styles.waitingReadyContainer}>
              <Text style={styles.waitingReadyText}>⏳ Esperando al otro jugador...</Text>
            </View>
          )}

          {allPlayersReady && (
            <View style={styles.startingContainer}>
              <Text style={styles.startingText}>🎮 ¡Iniciando juego!</Text>
            </View>
          )}

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>⬅ Salir de la Sala</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    fontFamily: "Jersey10",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  roomInfoContainer: {
    backgroundColor: "#A9E2B3",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginBottom: 30,
    width: "100%",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  roomCode: {
    fontSize: 28,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    fontWeight: "bold",
    marginBottom: 5,
  },
  difficulty: {
    fontSize: 20,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
  },
  playersContainer: {
    width: "100%",
    marginBottom: 30,
  },
  playersTitle: {
    fontSize: 24,
    fontFamily: "Jersey10",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  playerCard: {
    backgroundColor: "#B9E4C9",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playerName: {
    fontSize: 18,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    fontWeight: "bold",
  },
  playerStatus: {
    fontSize: 16,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
  },
  waitingCard: {
    backgroundColor: "#FFE2A7",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  waitingText: {
    fontSize: 18,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    textAlign: "center",
    marginBottom: 5,
  },
  waitingSubtext: {
    fontSize: 14,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
    shadowOffset: {
      width: 1,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  readyButton: {
    backgroundColor: "#B9E4C9",
    shadowColor: "#90C4AA",
  },
  buttonText: {
    fontSize: 24,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    textAlign: "center",
  },
  waitingReadyContainer: {
    backgroundColor: "#FFE2A7",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  waitingReadyText: {
    fontSize: 20,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    textAlign: "center",
  },
  startingContainer: {
    backgroundColor: "#B9E4C9",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  startingText: {
    fontSize: 22,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    textAlign: "center",
    fontWeight: "bold",
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    backgroundColor: "#F4A88D",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#D97C5B",
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 18,
    color: "#1B1B1B",
    fontWeight: "bold",
    fontFamily: "Jersey10",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
})

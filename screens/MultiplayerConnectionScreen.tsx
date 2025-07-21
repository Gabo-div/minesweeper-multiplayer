"use client"

import type React from "react"

import { socketService } from "@/services/socketService"
import type { Difficulty, GameConfig } from "@/types/game"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

interface MultiplayerConnectionScreenProps {
  difficulty: Difficulty
  config: GameConfig
  onGameStart: (roomCode: string, isHost: boolean) => void
  onBack: () => void
}

export const MultiplayerConnectionScreen: React.FC<MultiplayerConnectionScreenProps> = ({
  difficulty,
  config,
  onGameStart,
  onBack,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [mode, setMode] = useState<"create" | "join" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // connectToServer() // Comenta esta línea

    // Don't disconnect when component unmounts - keep connection alive
    return () => {
      // socketService.disconnect() // Comenta esta línea también
    }
  }, [])

  const connectToServer = async () => {
    setConnectionStatus("connecting")
    try {
      await socketService.connect()
      setConnectionStatus("connected")
    } catch (error) {
      setConnectionStatus("disconnected")
      Alert.alert("Error de Conexión", "No se pudo conectar al servidor. Verifica que el servidor esté ejecutándose.")
    }
  }

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      Alert.alert("Error", "Por favor ingresa tu nombre")
      return
    }

    setIsLoading(true)
    try {
      const { roomCode } = await socketService.createRoom(playerName, config)
      Alert.alert("Sala Creada", `Código de sala: ${roomCode}\nComparte este código con tu amigo.`, [
        {
          text: "OK",
          onPress: () => onGameStart(roomCode, true),
        },
      ])
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la sala")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      Alert.alert("Error", "Por favor ingresa tu nombre")
      return
    }

    if (!roomCode.trim()) {
      Alert.alert("Error", "Por favor ingresa el código de sala")
      return
    }

    setIsLoading(true)
    try {
      await socketService.joinRoom(roomCode.toUpperCase(), playerName)
      onGameStart(roomCode.toUpperCase(), false)
    } catch (error) {
      Alert.alert("Error", "No se pudo unir a la sala. Verifica el código.")
    } finally {
      setIsLoading(false)
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connecting":
        return "🔄 Conectando al servidor..."
      case "connected":
        return "✅ Conectado al servidor"
      case "disconnected":
        return "❌ Desconectado del servidor"
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connecting":
        return "#FFE2A7"
      case "connected":
        return "#B9E4C9"
      case "disconnected":
        return "#F8B6B6"
    }
  }

  if (!mode) {
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
          <Text style={styles.title}>MULTIJUGADOR</Text>

          <View style={[styles.statusContainer, { backgroundColor: getConnectionStatusColor() }]}>
            <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
          </View>

          {connectionStatus === "connected" && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.createButton]} onPress={() => setMode("create")}>
                <Text style={styles.buttonText}>🏠 CREAR SALA</Text>
                <Text style={styles.buttonSubtext}>Serás el anfitrión</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.joinButton]} onPress={() => setMode("join")}>
                <Text style={styles.buttonText}>🚪 UNIRSE A SALA</Text>
                <Text style={styles.buttonSubtext}>Ingresa el código</Text>
              </TouchableOpacity>
            </View>
          )}

          {connectionStatus === "disconnected" && (
            <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={connectToServer}>
              <Text style={styles.buttonText}>🔄 REINTENTAR</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>⬅ Volver</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )
  }

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
        <Text style={styles.title}>{mode === "create" ? "CREAR SALA" : "UNIRSE A SALA"}</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tu Nombre:</Text>
            <TextInput
              style={styles.textInput}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#999"
              maxLength={20}
            />
          </View>

          {mode === "join" && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Código de Sala:</Text>
              <TextInput
                style={styles.textInput}
                value={roomCode}
                onChangeText={setRoomCode}
                placeholder="Ej: ABC123"
                placeholderTextColor="#999"
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              mode === "create" ? styles.createButton : styles.joinButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={mode === "create" ? handleCreateRoom : handleJoinRoom}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "⏳ PROCESANDO..." : mode === "create" ? "🏠 CREAR SALA" : "🚪 UNIRSE"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => setMode(null)}>
          <Text style={styles.backButtonText}>⬅ Volver</Text>
        </TouchableOpacity>
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
  statusContainer: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginBottom: 30,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  statusText: {
    fontSize: 18,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 20,
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    gap: 20,
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 20,
    fontFamily: "Jersey10",
    color: "#fff",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 18,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    borderWidth: 2,
    borderColor: "#D97C5B",
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
  createButton: {
    backgroundColor: "#B9E4C9",
    shadowColor: "#90C4AA",
  },
  joinButton: {
    backgroundColor: "#FFE2A7",
    shadowColor: "#D1B878",
  },
  retryButton: {
    backgroundColor: "#F8B6B6",
    shadowColor: "#C88D8D",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: "Jersey10",
    color: "#1B1B1B",
    marginBottom: 0,
    textAlign: "center",
  },
  buttonSubtext: {
    fontSize: 16,
    color: "#1B1B1B",
    marginTop: 5,
    textAlign: "center",
    fontFamily: "Jersey10",
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

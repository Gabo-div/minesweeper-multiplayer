import type { GameConfig } from "@/types/game"
import { io, type Socket } from "socket.io-client"

export interface MultiplayerRoom {
  code: string
  players: {
    id: string
    name: string
    ready: boolean
  }[]
  gameState: {
    board: any[][]
    gameStatus: "playing" | "won" | "lost"
    scores: number[]
    flagsUsed: number
    timeElapsed: number
    startTime: number
  } | null
  currentTurn: number
  config: GameConfig
  gameStatus: "waiting" | "playing" | "finished"
}

class SocketService {
  public socket: Socket | null = null
  private serverUrl = "http://192.168.1.108:3001"

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ["websocket"],
        timeout: 5000,
      })

      this.socket.on("connect", () => {
        console.log("Connected to server")
        resolve()
      })

      this.socket.on("connect_error", (error) => {
        console.log("Connection error:", error)
        reject(error)
      })

      this.socket.on("disconnect", () => {
        console.log("Disconnected from server")
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  async createRoom(playerName: string, config: GameConfig): Promise<{ roomCode: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Not connected"))
        return
      }

      this.socket.emit("create-room", { playerName, config })

      this.socket.once("room-created", (data) => {
        console.log("Room created response:", data)
        resolve({ roomCode: data.roomCode })
      })

      this.socket.once("error", (error) => {
        reject(new Error(error.message))
      })
    })
  }

  async joinRoom(roomCode: string, playerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Not connected"))
        return
      }

      console.log("Attempting to join room:", roomCode, "with name:", playerName)
      this.socket.emit("join-room", { roomCode: roomCode.trim().toUpperCase(), playerName })

      this.socket.once("player-joined", (data) => {
        console.log("Successfully joined room:", data)
        resolve()
      })

      this.socket.once("error", (error) => {
        console.log("Join room error:", error)
        reject(new Error(error.message))
      })
    })
  }

  setPlayerReady(roomCode: string) {
    if (this.socket) {
      this.socket.emit("player-ready", { roomCode })
    }
  }

  makeMove(roomCode: string, row: number, col: number, action: "reveal" | "flag") {
    if (this.socket) {
      this.socket.emit("make-move", { roomCode, row, col, action })
    }
  }

  onRoomCreated(callback: (data: { roomCode: string; room: MultiplayerRoom }) => void) {
    if (this.socket) {
      this.socket.on("room-created", callback)
    }
  }

  onPlayerJoined(callback: (data: { room: MultiplayerRoom }) => void) {
    if (this.socket) {
      this.socket.on("player-joined", callback)
    }
  }

  onPlayerReady(callback: (data: { room: MultiplayerRoom }) => void) {
    if (this.socket) {
      this.socket.on("player-ready-update", callback)
    }
  }

  onGameStarted(callback: (data: { room: MultiplayerRoom }) => void) {
    if (this.socket) {
      this.socket.on("game-started", callback)
    }
  }

  onGameUpdated(callback: (data: { room: MultiplayerRoom }) => void) {
    if (this.socket) {
      this.socket.on("game-updated", callback)
    }
  }

  onPlayerLeft(callback: (data: { room: MultiplayerRoom }) => void) {
    if (this.socket) {
      this.socket.on("player-left", callback)
    }
  }

  onError(callback: (error: { message: string }) => void) {
    if (this.socket) {
      this.socket.on("error", callback)
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }
}

export const socketService = new SocketService()

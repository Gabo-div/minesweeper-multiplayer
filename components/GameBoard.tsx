"use client"

import React from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import type { Cell, GameConfig } from "../types/game"
import { GameCell } from "./GameCell"

interface GameBoardProps {
  board: Cell[][]
  config: GameConfig
  onCellPress: (row: number, col: number) => void
  onCellLongPress: (row: number, col: number) => void
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, config, onCellPress, onCellLongPress }) => {
  // Add a log here to see if the board prop is changing
  React.useEffect(() => {
    console.log("[GameBoard] Board prop updated. First cell:", board[0]?.[0])
  }, [board])

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <GameCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                size={config.cellSize}
                onPress={() => onCellPress(rowIndex, colIndex)}
                onLongPress={() => onCellLongPress(rowIndex, colIndex)}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  board: {
    backgroundColor: "#3A3A3A",
    padding: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#111",
  },
  row: {
    flexDirection: "row",
  },
})

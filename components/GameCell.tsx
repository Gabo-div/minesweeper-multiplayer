import { Image } from "expo-image";
import type React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import type { Cell } from "../types/game";

interface GameCellProps {
  cell: Cell;
  row: number;
  col: number;
  size: number;
  onPress: (row: number, col: number) => void;
  onLongPress: (row: number, col: number) => void;
}

export const GameCell: React.FC<GameCellProps> = ({
  cell,
  row,
  col,
  size,
  onPress,
  onLongPress,
}) => {
  const cellStyle = [
    styles.cell,
    {
      width: size,
      height: size,
    },
  ];
  // let cellText = "";
  let textColor = "#333";
  let cellContent = null;

  if (cell.isRevealed) {
    if (cell.isMine) {
      cellStyle.push(styles.mine);
      cellContent = (
        <Image 
          source={require('@/assets/images/BombImage.png')}
          style={styles.cellImage}
          contentFit="contain"
        />
      )
    } else {
      cellStyle.push(styles.revealed);
      if (cell.neighborMines > 0) {
        cellContent = cell.neighborMines.toString();
        // Colores diferentes según el número
        const colors = [
          "",
          "#1976D2",
          "#388E3C",
          "#D32F2F",
          "#7B1FA2",
          "#FF8F00",
          "#C2185B",
          "#000000",
          "#424242",
        ];
        textColor = colors[cell.neighborMines] || "#333";
        cellContent = (
          <Text style={[styles.cellText, { fontSize: size * 0.4, color: textColor }]}>
            {cell.neighborMines}
          </Text>
        )
      }
    }
  } else if (cell.isFlagged) {
    cellStyle.push(styles.flagged);
    cellContent = (
      <Image 
          source={require('@/assets/images/pixel-flag.png')}
          style={styles.cellImageFlag}
          contentFit="contain"
        />
    )
  }

  return (
    <TouchableOpacity
      style={cellStyle}
      onPress={() => onPress(row, col)}
      onLongPress={() => onLongPress(row, col)}
    >
      
        {cellContent}
      
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    backgroundColor: "#B0B0B0",
    margin: 1,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#333",
    borderWidth: 3,
  },
  revealed: {
    backgroundColor: "#EAEAEA",
    borderColor: "#B0B0B0",
    margin: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  mine: {
    backgroundColor: "#FF7B7B",
    borderColor: "#333",
    margin: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  cellImage: {
    width: "100%",
    height: "100%",
  },
  cellImageFlag: {
    width: "90%",
    height: "90%",
  },
  flagged: {
    backgroundColor: "#FFD966",
    borderColor: "#333",
    margin: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  cellText: {
    fontFamily: "PressStart2P",
    fontWeight: "bold",
  },
});

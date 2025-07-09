import type { Difficulty } from "@/types/game";
import { StyleSheet, Text, View } from "react-native";

interface GameHeaderProps {
  score: number;
  minesRemaining: number;
  timeElapsed: number;
  difficulty: Difficulty;
  gameStatus: "playing" | "won" | "lost";
}

const difficultyNames = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

const formaTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  minesRemaining,
  timeElapsed,
  difficulty,
  gameStatus,
}) => {
  const getStatusEmoji = () => {
    switch (gameStatus) {
      case "playing":
        return "⏳";
      case "won":
        return "🎉";
      case "lost":
        return "💥";
      default:
        return "";
    }
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>
        {getStatusEmoji()} Busca Minas - {difficultyNames[difficulty]}
      </Text>

      <View style={styles.statsContainer}>
        <View>
          <Text style={styles.statLabel}>Puntaje</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Minas Restantes</Text>
          <Text
            style={[
              styles.statValue,
              { color: minesRemaining > 0 ? "#FF0000" : "#333" },
            ]}
          >
            {minesRemaining}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tiempo</Text>
          <Text style={styles.statValue}>{formaTime(timeElapsed)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "PressStart2P",
    marginBottom: 15,
    marginTop: 15,
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase"
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "#A9E2B3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    // borderTopWidth: 8,
    // borderRightWidth: 8,
    // borderLeftWidth: 8,
    // borderBottomWidth: 8,
    borderColor: "#599175",
    shadowColor: "#599175",
    shadowOffset: {
      width: -5,
      height: 10,
    },
    shadowOpacity: 4,
    shadowRadius: 0,
    elevation: 6,
  },
  statItem : {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 24,
    color: "#000",
    marginBottom: 4,
    fontFamily: "Jersey10"
  },
  statValue: {
    fontSize: 28,
    fontFamily: "Jersey10",
    color: "#000",
    textAlign: "center"
  },
});

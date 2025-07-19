import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DIFFICULTY_CONFIGS, type Difficulty } from "../types/game";

interface DifficultyScreenProps {
  onDifficultySelect: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const difficultyInfo = {
  easy: {
    name: "Easy",
    emoji: "🙂",
    bgColor: "#B9E4C9", // Green
    shadowColor: "#fff", // Darker Green
    textColor: "#1B1B1B",
  },
  medium: {
    name: "Medium",
    emoji: "😐",
    bgColor: "#FFE2A7", // Orange
    shadowColor: "#D1B878",
    textColor: "#1B1B1B",
  },
  hard: {
    name: "Hard",
    emoji: "😟",
    bgColor: "#F8B6B6", // Red
    shadowColor: "#C88D8D",
    textColor: "#1B1B1B",
  },
};

export const DifficultyScreen: React.FC<DifficultyScreenProps> = ({
  onDifficultySelect,
  onBack,
}) => {
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
      <View style={styles.content}>
        <Text style={styles.title}>SELECCIONA LA DIFICULTAD</Text>

        <View style={styles.buttonContainer}>
          {(Object.keys(difficultyInfo) as Difficulty[]).map((difficulty) => {
            const info = difficultyInfo[difficulty];
            const config = DIFFICULTY_CONFIGS[difficulty];

            return (
              <View
                key={difficulty}
                style={[
                  styles.shadowWrapper,
                  { backgroundColor: info.shadowColor },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    difficulty === "easy" && styles.easyButton,
                    difficulty === "medium" && styles.mediumButton,
                    difficulty === "hard" && styles.hardButton,
                    { backgroundColor: info.bgColor },
                  ]}
                  onPress={() => onDifficultySelect(difficulty)}
                >
                  <Text style={[styles.emoji, { color: info.textColor }]}>
                    {info.emoji}
                  </Text>
                  <Text
                    style={[styles.difficultyName, { color: info.textColor }]}
                  >
                    {info.name}
                  </Text>
                  <View style={styles.difficultyInfoContainer}>
                    <Text
                      style={[
                        styles.difficultyDescription,
                        { color: info.textColor },
                      ]}
                    >
                      {config.boardSize}x{config.boardSize}
                    </Text>
                    <View style={styles.mineRow}>
                      <Image
                        source={require('@/assets/images/BombImage.png')}
                        style={styles.mineIcon}
                      />
                      <Text
                        style={[styles.minesCount, { color: info.textColor }]}
                      >
                        {config.minesCount}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>⬅ Volver</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

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
    fontFamily: "Jersey10",
    color: "#fff",
    // marginBottom: 40,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  buttonContainer: {
    width: "100%",
    gap: 20,
    marginBottom: 40,
  },
  shadowWrapper: {
    borderRadius: 15,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  difficultyButton: {
    width: "100%",
    paddingVertical: 25,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: {
      width: 1,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  easyButton: {
    backgroundColor: "#B9E4C9", // Green
    shadowColor: "#A0D3B2", // Darker Green
  },
  mediumButton: {
    backgroundColor: "#FFE2A7", // Orange
    shadowColor: "#D1B878", // Darker Orange
  },
  hardButton: {
    backgroundColor: "#F8B6B6", // Red
    shadowColor: "#C88D8D", // Darker Red
  },
  emoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  difficultyName: {
    fontSize: 20,
    fontFamily: "PressStart2P",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  difficultyInfoContainer: {
    flexDirection: "row",
    gap: 10,
  },
  difficultyDescription: {
    fontSize: 26,
    fontFamily: "Jersey10",
  },
  minesCount: {
    fontSize: 24,
    fontFamily: "Jersey10",
  },
  mineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  mineIcon: {
    width: 42,
    height: 42,
    marginTop: -10,
    marginLeft: -8
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
    color: "1B1B1B",
    fontFamily: "Jersey10",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

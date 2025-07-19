import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HomeScreenProps {
  onLocalPlay: () => void;
  onMultiplayer: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onLocalPlay,
  onMultiplayer,
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
        <Text style={styles.title}>🎮</Text>
        <Text style={styles.title}>MINESWEEPER</Text>
        <Text style={styles.subtitle}>¡Desafía tu mente!</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.localButton]}
            onPress={onLocalPlay}
          >
            <Text style={styles.buttonText}> JUEGO LOCAL</Text>
            <Text style={styles.buttonSubtext}>Un jugador</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.multiplayerButton]}
            onPress={onMultiplayer}
          >
            <Text style={styles.buttonText}> MULTIJUGADOR</Text>
            <Text style={styles.buttonSubtext}>Próximamente...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 60,
    fontFamily: "Jersey10",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 34,
    fontFamily: "Jersey10",
    color: "#fff",
    marginBottom: 40,
    textAlign: "center",
  },
  shadowWrapper: {
    borderRadius: 15,
    padding: 0,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    // Sombra para Android
    elevation: 8,
  },
  buttonContainer: {
    width: "100%",
    gap: 20,
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
  localButton: {
    backgroundColor: "#A9DDC2",
    shadowColor: "#90C4AA",
  },
  multiplayerButton: {
    backgroundColor: "#34C759",
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 35,
    fontFamily: "Jersey10",
    // fontWeight: "bold",
    color: "#206163",
    marginBottom: 0,
    textAlign: "center",
  },
  buttonSubtext: {
    fontSize: 15,
    color: "#206163",
    marginTop: 5,
    marginBottom: 5,
    textAlign: "center",
  },
  footer: {
    marginTop: 50,
  },
  footerText: {
    fontSize: 18,
    fontFamily: "Jersey10",
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase"
  },
});

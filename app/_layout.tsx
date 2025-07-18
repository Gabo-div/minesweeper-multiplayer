import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { Text, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P: require("../assets/fonts/PressStart2P-Regular.ttf"),
    Jersey10: require("../assets/fonts/Jersey10-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return <Slot />;
}

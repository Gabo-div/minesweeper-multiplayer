import { useColorScheme } from "@/hooks/useColorScheme"; // Asegúrate de que esta ruta sea correcta
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native"; // Necesario para el fallback de carga de fuentes
import "react-native-reanimated"; // Asegúrate de que esto esté importado si lo usas en algún componente

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    // Asegúrate de que estas rutas sean correctas
    PressStart2P: require("../assets/fonts/PressStart2P-Regular.ttf"),
    Jersey10: require("../assets/fonts/Jersey10-Regular.ttf"),
    // Si usas SpaceMono en algún lugar, descomenta:
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  if (!loaded) {
    // Muestra una pantalla de carga mientras las fuentes se cargan
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando fuentes...</Text>
      </View>
    )
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* La pantalla principal de tu juego está en app/(tabs)/index.tsx */}
        {/* headerShown: false para que el layout de pestañas maneje el encabezado */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* Si tienes una pantalla 404, asegúrate de que exista en +not-found.tsx */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}

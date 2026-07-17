import React, { useEffect, useRef } from "react";
import { getGameSettings } from "./SettingsScreen";
//import { Audio } from "expo-av";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ModeScreen({ navigation }) {
  const musicRef = useRef(null);

  useEffect(() => {
    playHomeMusic();

    return () => {
      stopHomeMusic();
    };
  }, []);

async function playHomeMusic() {
  try {
    if (!getGameSettings().soundOn) return;

    if (musicRef.current) return;

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/home-music.mp3"),
      {
        isLooping: true,
        volume: 0.35,
      }
    );

    musicRef.current = sound;
    await sound.playAsync();
  } catch (error) {
    console.log("Music error:", error);
  }
}

  async function stopHomeMusic() {
    try {
      if (musicRef.current) {
        await musicRef.current.stopAsync();
        await musicRef.current.unloadAsync();
        musicRef.current = null;
      }
    } catch (error) {
      console.log("Stop mode music error:", error);
    }
  }

  async function playClickSound() {
  try {
    if (!getGameSettings().soundOn) return;

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/click.mp3")
    );

    await sound.playAsync();

    setTimeout(() => {
      sound.unloadAsync();
    }, 1000);
  } catch (error) {
    console.log("Click sound error:", error);
  }
}

  async function goSinglePlayer() {
    await playClickSound();
    await stopHomeMusic();

    navigation.navigate("Game", {
      mode: "single",
      playersCount: 2,
    });
  }

  async function goMultiplayer() {
    await playClickSound();
    await stopHomeMusic();

    navigation.navigate("PlayerCount");
  }

  async function goBackHome() {
    await playClickSound();
    await stopHomeMusic();

    navigation.navigate("Home");
  }

  return (
    <ImageBackground
      source={require("../../assets/color-blast-bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.smallTitle}>🎮 Choose Your Battle 🎮</Text>

          <Text style={styles.title}>Select Mode</Text>

          <TouchableOpacity style={styles.singleButton} onPress={goSinglePlayer}>
            <Text style={styles.emoji}>🤖 ⚡ 👤</Text>
            <Text style={styles.buttonText}>Single Player</Text>
            <Text style={styles.subText}>Play against smart AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.multiButton} onPress={goMultiplayer}>
            <Text style={styles.emoji}>👥 🌈 🏆</Text>
            <Text style={styles.buttonText}>Multiplayer</Text>
            <Text style={styles.subText}>2, 3 or 4 players battle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={goBackHome}>
            <Ionicons name="arrow-back-circle" size={30} color="#fff" />
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23, 0, 45, 0.58)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "rgba(43, 23, 64, 0.85)",
    borderRadius: 35,
    padding: 24,
    borderWidth: 3,
    borderColor: "#FFD166",
    shadowColor: "#FFD166",
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 20,
  },
  smallTitle: {
    color: "#45C7F3",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    color: "#FFD166",
    fontSize: 43,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 34,
    textShadowColor: "#FF4D8D",
    textShadowRadius: 16,
  },
  singleButton: {
    backgroundColor: "#33C7FF",
    paddingVertical: 20,
    borderRadius: 27,
    marginBottom: 22,
    alignItems: "center",
    shadowColor: "#33C7FF",
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 15,
  },
  multiButton: {
    backgroundColor: "#15CFA3",
    paddingVertical: 20,
    borderRadius: 27,
    marginBottom: 22,
    alignItems: "center",
    shadowColor: "#15CFA3",
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 15,
  },
  backButton: {
    backgroundColor: "#FF4D6D",
    paddingVertical: 19,
    borderRadius: 27,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: "#FF4D6D",
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 15,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
  },
  subText: {
    color: "#F7F7F7",
    fontSize: 17,
    textAlign: "center",
    marginTop: 5,
    fontWeight: "800",
  },
});
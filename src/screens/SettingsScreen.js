import React, { useState, useEffect, useRef } from "react";
//import { Audio } from "expo-av";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

let GAME_SETTINGS = {
  boardSize: 7,
  rounds: 18,
  soundOn: true,
};

export function getGameSettings() {
  return GAME_SETTINGS;
}

export default function SettingsScreen({ navigation }) {
  const musicRef = useRef(null);

  const [boardSize, setBoardSize] = useState(GAME_SETTINGS.boardSize);
  const [rounds, setRounds] = useState(GAME_SETTINGS.rounds);
  const [soundOn, setSoundOn] = useState(GAME_SETTINGS.soundOn);

  useEffect(() => {
    if (GAME_SETTINGS.soundOn) {
      playHomeMusic();
    }

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
    } catch (e) {
      console.log("Stop settings music error:", e);
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

  async function selectBoardSize(size) {
    await playClickSound();
    GAME_SETTINGS.boardSize = size;
    setBoardSize(size);
  }

  async function selectRounds(value) {
    await playClickSound();
    GAME_SETTINGS.rounds = value;
    setRounds(value);
  }

  async function toggleSound() {
    await playClickSound();

    const newValue = !soundOn;
    GAME_SETTINGS.soundOn = newValue;
    setSoundOn(newValue);

    if (newValue) {
      playHomeMusic();
    } else {
      stopHomeMusic();
    }
  }

  async function goBack() {
    await playClickSound();
    await stopHomeMusic();
    navigation.goBack();
  }

  return (
    <ImageBackground
      source={require("../../assets/color-blast-bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.topBackButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={34} color="#fff" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>⚙️ Settings</Text>

          <Text style={styles.instruction}>
            Select board size, rounds, and sound before starting the game.
          </Text>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>🎮 Select Board Size</Text>

            <View style={styles.optionRow}>
              {[7, 10, 15].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.boardOption,
                    boardSize === size && styles.selectedBoard,
                  ]}
                  onPress={() => selectBoardSize(size)}
                >
                  <Text style={styles.optionText}>{size}×{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.selectedInfo}>
              Current Board: {boardSize} × {boardSize}
            </Text>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>🔄 Select Rounds</Text>

            <View style={styles.optionRow}>
              {[10, 18, 25, 35].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.roundOption,
                    rounds === value && styles.selectedRound,
                  ]}
                  onPress={() => selectRounds(value)}
                >
                  <Text style={styles.optionText}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.selectedInfo}>Current Rounds: {rounds}</Text>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>🔊 Sound Control</Text>

            <TouchableOpacity
              style={[
                styles.soundButton,
                soundOn ? styles.soundOnButton : styles.soundOffButton,
              ]}
              onPress={toggleSound}
            >
              <Ionicons
                name={soundOn ? "volume-high" : "volume-mute"}
                size={32}
                color="#fff"
              />
              <Text style={styles.soundButtonText}>
                {soundOn ? "Sound ON" : "Sound OFF"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.selectedInfo}>
              {soundOn
                ? "Music and click sounds are enabled"
                : "All sounds are disabled"}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Game Rules</Text>

            <Text style={styles.infoText}>
              • Select tiles only near your blinking tiles.{"\n\n"}
              • Same-colored connected tiles become yours.{"\n\n"}
              • Previous active tiles change into random colors.{"\n\n"}
              • Highest score wins the game.
            </Text>
          </View>
        </ScrollView>
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
    backgroundColor: "rgba(23,0,45,0.58)",
    padding: 20,
  },
  topBackButton: {
    position: "absolute",
    top: 42,
    left: 18,
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#39214F",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
    borderWidth: 2,
    borderColor: "#FFD166",
  },
  title: {
    color: "#FFD166",
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 35,
    textShadowColor: "#FF4FD8",
    textShadowRadius: 15,
  },
  instruction: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 26,
  },
  sectionBox: {
    backgroundColor: "#2B1740EE",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: "#FFD166",
  },
  sectionTitle: {
    color: "#45C7F3",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  boardOption: {
    backgroundColor: "#33C7FF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#fff",
  },
  roundOption: {
    backgroundColor: "#FF4D8D",
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#fff",
  },
  selectedBoard: {
    backgroundColor: "#FFD166",
  },
  selectedRound: {
    backgroundColor: "#15CFA3",
  },
  optionText: {
    color: "#17002D",
    fontSize: 20,
    fontWeight: "900",
  },
  selectedInfo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 16,
  },
  soundButton: {
    paddingVertical: 18,
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  soundOnButton: {
    backgroundColor: "#15CFA3",
  },
  soundOffButton: {
    backgroundColor: "#FF4D6D",
  },
  soundButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  infoBox: {
    backgroundColor: "#2B1740EE",
    borderRadius: 25,
    padding: 20,
    marginBottom: 35,
    borderWidth: 3,
    borderColor: "#45C7F3",
  },
  infoTitle: {
    color: "#FFD166",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 15,
  },
  infoText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 29,
    fontWeight: "700",
  },
});
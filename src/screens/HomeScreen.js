import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const titleAnim = useRef(new Animated.Value(1)).current;
  const [helpVisible, setHelpVisible] = useState(false);

  useEffect(() => {
    const titleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(titleAnim, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    titleAnimation.start();

    return () => {
      titleAnimation.stop();
    };
  }, [titleAnim]);

  function goToMode() {
    navigation.navigate("Mode");
  }

  function goToOnlineGame() {
    navigation.navigate("OnlineHome");
  }

  function goToSettings() {
    navigation.navigate("Settings");
  }

  function openHelp() {
    setHelpVisible(true);
  }

  function closeHelp() {
    setHelpVisible(false);
  }

  return (
    <ImageBackground
      source={require("../../assets/color-blast-bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.tagline}>
            ✨ Tap • Match • Blast ✨
          </Text>

          <Animated.Text
            style={[
              styles.title,
              {
                transform: [{ scale: titleAnim }],
              },
            ]}
          >
            Color Blast
          </Animated.Text>

          <Text style={styles.subtitle}>
            🌈 Capture same-color tiles, grow your area, and
            become the color champion!
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={goToMode}
            activeOpacity={0.8}
          >
            <Ionicons
              name="play-circle"
              size={32}
              color="#fff"
            />

            <Text style={styles.buttonText}>
              Start Game
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.onlineButton}
            onPress={goToOnlineGame}
            activeOpacity={0.8}
          >
            <Ionicons
              name="globe-outline"
              size={30}
              color="#fff"
            />

            <Text style={styles.buttonText}>
              Play Online
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={goToSettings}
            activeOpacity={0.8}
          >
            <Ionicons
              name="settings"
              size={30}
              color="#fff"
            />

            <Text style={styles.buttonText}>
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={openHelp}
            activeOpacity={0.8}
          >
            <Ionicons
              name="help-circle"
              size={30}
              color="#fff"
            />

            <Text style={styles.buttonText}>
              Help
            </Text>
          </TouchableOpacity>

          <View style={styles.badgeRow}>
            <Text style={styles.badge}>🎮 Fun</Text>
            <Text style={styles.badge}>💥 Blast</Text>
            <Text style={styles.badge}>🏆 Win</Text>
          </View>
        </View>
      </View>

      <Modal
        visible={helpVisible}
        transparent
        animationType="slide"
        onRequestClose={closeHelp}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.helpCard}>
            <TouchableOpacity
              style={styles.helpBackButton}
              onPress={closeHelp}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-back"
                size={28}
                color="#fff"
              />

              <Text style={styles.helpBackText}>
                Back
              </Text>
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.helpScrollContent}
            >
              <Text style={styles.helpTitle}>
                🎮 How to Play
              </Text>

              <View style={styles.helpBox}>
                <Text style={styles.helpHeading}>
                  🏠 Home Screen
                </Text>

                <Text style={styles.helpText}>
                  ➜ Start Game: choose single player or
                  multiplayer.{"\n"}
                  ➜ Play Online: create or join an online
                  room.{"\n"}
                  ➜ Settings: change board size and
                  rounds.{"\n"}
                  ➜ Help: read the complete game guide.
                </Text>
              </View>

              <View style={styles.helpBox}>
                <Text style={styles.helpHeading}>
                  🤖 Single Player
                </Text>

                <Text style={styles.helpText}>
                  You play against AI. Player 1 starts from
                  the top-left corner. AI starts from the
                  top-right corner.
                </Text>
              </View>

              <View style={styles.helpBox}>
                <Text style={styles.helpHeading}>
                  👥 Multiplayer
                </Text>

                <Text style={styles.helpText}>
                  2, 3, or 4 players can play. Each player
                  starts from a different corner of the
                  board.
                </Text>
              </View>

              <View style={styles.helpBox}>
                <Text style={styles.helpHeading}>
                  🌐 Online Multiplayer
                </Text>

                <Text style={styles.helpText}>
                  Create a room and share the room code with
                  other players, or enter an existing room
                  code to join a match.
                </Text>
              </View>

              <View style={styles.helpBox}>
                <Text style={styles.helpHeading}>
                  🎯 Game Process
                </Text>

                <Text style={styles.helpText}>
                  1️⃣ Tap a tile near your current blinking
                  tiles.{"\n"}
                  2️⃣ Same-color connected tiles will glow.
                  {"\n"}
                  3️⃣ Your score increases based on matched
                  tiles.{"\n"}
                  4️⃣ The next player gets the turn.{"\n"}
                  5️⃣ The player with the highest score wins
                  the match.
                </Text>
              </View>

              <View style={styles.demoBox}>
                <Text style={styles.demoTitle}>
                  📌 Board Guide
                </Text>

                <Text style={styles.demoText}>
                  P1 ↘ starts top-left{"\n"}
                  P2 ↙ starts top-right{"\n"}
                  P3 ↖ starts bottom-right{"\n"}
                  P4 ↗ starts bottom-left
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeHelp}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close-circle"
                  size={28}
                  color="#fff"
                />

                <Text style={styles.buttonText}>
                  Close Help
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(23, 0, 45, 0.55)",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "rgba(43, 23, 64, 0.82)",
    borderRadius: 35,
    padding: 25,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFD166",
  },

  tagline: {
    color: "#45C7F3",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 18,
    textAlign: "center",
  },

  title: {
    color: "#FFD166",
    fontSize: 52,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "#FF4D8D",
    textShadowRadius: 18,
  },

  subtitle: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 30,
    textAlign: "center",
    marginTop: 24,
    fontWeight: "800",
  },

  startButton: {
    width: "100%",
    backgroundColor: "#FF4D8D",
    paddingVertical: 18,
    borderRadius: 26,
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  onlineButton: {
    width: "100%",
    backgroundColor: "#15CFA3",
    paddingVertical: 19,
    borderRadius: 26,
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  settingsButton: {
    width: "100%",
    backgroundColor: "#45C7F3",
    paddingVertical: 18,
    borderRadius: 26,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  helpButton: {
    width: "100%",
    backgroundColor: "#9B5DE5",
    paddingVertical: 18,
    borderRadius: 26,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 22,
    gap: 10,
  },

  badge: {
    backgroundColor: "#FFD166",
    color: "#17002D",
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 18,
    fontSize: 15,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 18,
  },

  helpCard: {
    maxHeight: "88%",
    backgroundColor: "#2B1740",
    borderRadius: 30,
    padding: 20,
    borderWidth: 3,
    borderColor: "#FFD166",
  },

  helpBackButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FF4D8D",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 15,
  },

  helpBackText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 8,
  },

  helpScrollContent: {
    paddingBottom: 5,
  },

  helpTitle: {
    color: "#FFD166",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 18,
  },

  helpBox: {
    backgroundColor: "#35214A",
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#ffffff22",
  },

  helpHeading: {
    color: "#45C7F3",
    fontSize: 23,
    fontWeight: "900",
    marginBottom: 8,
  },

  helpText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 27,
    fontWeight: "700",
  },

  demoBox: {
    backgroundColor: "#17002D",
    padding: 18,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#FF4D8D",
    marginBottom: 16,
  },

  demoTitle: {
    color: "#FF4D8D",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },

  demoText: {
    color: "#fff",
    fontSize: 19,
    lineHeight: 30,
    textAlign: "center",
    fontWeight: "800",
  },

  closeButton: {
    backgroundColor: "#FF4D6D",
    paddingVertical: 16,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
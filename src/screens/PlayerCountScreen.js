import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const FLOATS = [
  "🎮",
  "👥",
  "✨",
  "💥",
  "🏆",
  "🌈",
  "🔵",
  "🟢",
  "🟡",
  "🟣",
];

function FloatingEmoji({ emoji, index }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  const left = (index * 79) % width;
  const top = 50 + ((index * 101) % (height - 160));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1800 + index * 130,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800 + index * 130,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 18],
  });

  return (
    <Animated.Text
      style={[
        styles.floatEmoji,
        {
          left,
          top,
          transform: [{ translateY }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function PlayerCountScreen({ navigation }) {
  function startGame(playersCount) {
    navigation.navigate("Game", {
      mode: "multi",
      playersCount,
    });
  }

  function goBackMode() {
    navigation.navigate("Mode");
  }

  return (
    <View style={styles.container}>
      {FLOATS.map((emoji, index) => (
        <FloatingEmoji
          key={index}
          emoji={emoji}
          index={index}
        />
      ))}

      <View style={styles.card}>
        <Text style={styles.smallTitle}>
          👥 Multiplayer Mode 👥
        </Text>

        <Text style={styles.title}>
          Choose Players
        </Text>

        <TouchableOpacity
          style={styles.player2}
          onPress={() => startGame(2)}
          activeOpacity={0.8}
        >
          <Text style={styles.emojiText}>
            👤 👤
          </Text>

          <Text style={styles.buttonText}>
            2 Players
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.player3}
          onPress={() => startGame(3)}
          activeOpacity={0.8}
        >
          <Text style={styles.emojiText}>
            👤 👤 👤
          </Text>

          <Text style={styles.buttonText}>
            3 Players
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.player4}
          onPress={() => startGame(4)}
          activeOpacity={0.8}
        >
          <Text style={styles.emojiText}>
            👤 👤 👤 👤
          </Text>

          <Text style={styles.buttonText}>
            4 Players
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={goBackMode}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back-circle"
            size={30}
            color="#fff"
          />

          <Text style={styles.buttonText}>
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17002D",
    justifyContent: "center",
    padding: 22,
    overflow: "hidden",
  },

  floatEmoji: {
    position: "absolute",
    fontSize: 30,
    opacity: 0.65,
  },

  card: {
    backgroundColor: "#2B1740DD",
    borderRadius: 35,
    padding: 22,
    borderWidth: 3,
    borderColor: "#FFD166",
    shadowColor: "#FFD166",
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 18,
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
    fontSize: 39,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 35,
    textShadowColor: "#FF4D8D",
    textShadowRadius: 12,
  },

  player2: {
    backgroundColor: "#33C7FF",
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#33C7FF",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
  },

  player3: {
    backgroundColor: "#FFD700",
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
  },

  player4: {
    backgroundColor: "#FF4FD8",
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#FF4FD8",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
  },

  backButton: {
    backgroundColor: "#FF4D6D",
    paddingVertical: 18,
    borderRadius: 25,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: "#FF4D6D",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
  },

  emojiText: {
    fontSize: 26,
    marginBottom: 5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
});
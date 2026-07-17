import React, { useEffect, useRef } from "react";
import { getGameSettings } from "./SettingsScreen";
//import { Audio } from "expo-av";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const RAIN_ITEMS = [
  "🍫",
  "🍬",
  "🍭",
  "🎉",
  "🎊",
  "🎀",
  "💥",
  "🌈",
  "🍫",
  "🍬",
  "🍭",
  "🎉",
  "🎊",
  "🎀",
  "💥",
  "🍬",
];

function RainEmoji({ emoji, index }) {
  const fallAnim = useRef(new Animated.Value(-100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const left = (index * 47) % width;
  const duration = 2800 + (index % 5) * 500;
  const delay = (index % 8) * 250;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(fallAnim, {
            toValue: height + 120,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(fallAnim, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.Text
      style={[
        styles.rainEmoji,
        {
          left,
          transform: [{ translateY: fallAnim }, { rotate }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function EndScreen({ navigation, route }) {
  const scores = route?.params?.scores || {};
  const endMusicRef = useRef(null);

  const scoreEntries = Object.entries(scores);

  const highestScore =
    scoreEntries.length > 0
      ? Math.max(...scoreEntries.map(([, score]) => Number(score)))
      : 0;

  const winners = scoreEntries
    .filter(([, score]) => Number(score) === highestScore)
    .map(([player]) => player);

  let winnerText = "";

  if (scoreEntries.length === 2 && winners.length === 2) {
    winnerText = "🤝 Match Draw!";
  } else if (winners.length === scoreEntries.length) {
    winnerText = "🤝 Match Draw!";
  } else if (winners.length === 1) {
    winnerText = `🏆 Player ${winners[0]} Wins!`;
  } else {
    winnerText = "🏆 Winners: " + winners.map((p) => `Player ${p}`).join(", ");
  }

  const danceAnim = useRef(new Animated.Value(0)).current;
  const blastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    playEndMusic();

    Animated.loop(
      Animated.sequence([
        Animated.timing(danceAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(danceAnim, {
          toValue: -1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(danceAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blastAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(blastAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      stopEndMusic();
    };
  }, []);

  async function playEndMusic() {
  try {
    if (!getGameSettings().soundOn) return;

    if (endMusicRef.current) return;

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/end-music.mp3"),
      {
        isLooping: true,
        volume: 0.4,
      }
    );

    endMusicRef.current = sound;
    await sound.playAsync();
  } catch (error) {
    console.log("End music error:", error);
  }
}

  async function stopEndMusic() {
    try {
      if (endMusicRef.current) {
        await endMusicRef.current.stopAsync();
        await endMusicRef.current.unloadAsync();
        endMusicRef.current = null;
      }
    } catch (error) {
      console.log("Stop end music error:", error);
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

  async function goHome() {
    await playClickSound();
    await stopEndMusic();

    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  }

  async function restartGame() {
    await playClickSound();
    await stopEndMusic();

    navigation.reset({
      index: 0,
      routes: [{ name: "Mode" }],
    });
  }

  const dollRotate = danceAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-12deg", "0deg", "12deg"],
  });

  const dollMove = danceAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-10, 0, 10],
  });

  const blastScale = blastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  return (
    <View style={styles.container}>
      <View style={styles.rainLayer}>
        {RAIN_ITEMS.map((emoji, index) => (
          <RainEmoji key={index} emoji={emoji} index={index} />
        ))}
      </View>

      <Animated.Text style={[styles.blastLeft, { transform: [{ scale: blastScale }] }]}>
        💥
      </Animated.Text>

      <Animated.Text style={[styles.blastRight, { transform: [{ scale: blastScale }] }]}>
        🌈
      </Animated.Text>

      <Text style={styles.title}>Game Over</Text>

      <Animated.Text
        style={[
          styles.doll,
          {
            transform: [{ rotate: dollRotate }, { translateY: dollMove }],
          },
        ]}
      >
        🕺
      </Animated.Text>

      <Text style={styles.winner}>{winnerText}</Text>

      

      <View style={styles.scoreBox}>
        {Object.entries(scores).map(([player, score]) => (
          <View
            key={player}
            style={[styles.row, winners.includes(player) && styles.winnerRow]}
          >
            <Text style={styles.player}>Player {player}</Text>
            <Text style={styles.score}>{score}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={goHome}>
        <Ionicons name="home" size={28} color="#fff" />
        <Text style={styles.buttonText}>Go Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
        <Ionicons name="refresh" size={30} color="#fff" />
        <Text style={styles.buttonText}>Restart Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17002D",
    justifyContent: "center",
    padding: 24,
    overflow: "hidden",
  },
  rainLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  rainEmoji: {
    position: "absolute",
    top: -80,
    fontSize: 34,
    zIndex: 1,
  },
  blastLeft: {
    position: "absolute",
    left: 25,
    top: 120,
    fontSize: 55,
    zIndex: 2,
  },
  blastRight: {
    position: "absolute",
    right: 25,
    top: 135,
    fontSize: 55,
    zIndex: 2,
  },
  title: {
    color: "#FFD166",
    fontSize: 45,
    fontWeight: "900",
    textAlign: "center",
    zIndex: 3,
  },
  doll: {
    fontSize: 70,
    textAlign: "center",
    marginTop: 10,
    zIndex: 3,
  },
  winner: {
    marginTop: 5,
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    zIndex: 3,
  },
  claimText: {
    marginTop: 12,
    color: "#FFD166",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    zIndex: 3,
  },
  scoreBox: {
    marginTop: 28,
    backgroundColor: "#35214AEE",
    borderRadius: 28,
    padding: 20,
    borderWidth: 3,
    borderColor: "#FFD166",
    shadowColor: "#FFD166",
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 15,
    zIndex: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff33",
    paddingVertical: 13,
  },
  winnerRow: {
    backgroundColor: "#FFD16633",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFD166",
  },
  player: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
  },
  score: {
    color: "#FFD166",
    fontSize: 28,
    fontWeight: "900",
  },
  homeButton: {
    marginTop: 35,
    backgroundColor: "#FF4D6D",
    paddingVertical: 19,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: "#FF4D6D",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
    zIndex: 3,
  },
  restartButton: {
    marginTop: 18,
    backgroundColor: "#15CFA3",
    paddingVertical: 19,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: "#15CFA3",
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
    zIndex: 3,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 25,
    fontWeight: "900",
  },
});
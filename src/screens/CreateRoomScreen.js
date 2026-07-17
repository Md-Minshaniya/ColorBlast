import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ref, set } from "firebase/database";
import { db } from "../firebaseConfig";
import { getGameSettings } from "./SettingsScreen";
import { getUserSession } from "../utils/userSession";

const COLORS = ["#45C7F3", "#FFD166", "#FF4D6D", "#15CFA3", "#9B5DE5", "#FF8A3D"];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createBoard(boardSize) {
  return Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => ({
      color: randomColor(),
    }))
  );
}

function createScores(playersCount) {
  const scores = {};
  for (let i = 1; i <= playersCount; i++) scores[i] = 0;
  return scores;
}

export default function CreateRoomScreen({ navigation }) {
  const settings = getGameSettings();

  const [selectedPlayers, setSelectedPlayers] = useState(2);
  const [creating, setCreating] = useState(false);

  async function createRoom() {
    if (creating) return;

    const user = await getUserSession();

    if (!user) {
      Alert.alert("Login Required", "Please login first.");
      navigation.navigate("Auth");
      return;
    }

    const roomCode = generateRoomCode();

    const boardSize = settings.boardSize || 7;
    const rounds = settings.rounds || 18;
    const soundOn = settings.soundOn !== false;

    const roomData = {
      roomCode,
      boardSize,
      rounds,
      roundsLeft: rounds,
      soundOn,
      playersCount: selectedPlayers,
      joinedPlayers: 1,
      status: "waiting",
      createdAt: Date.now(),
      startedAt: null,
      currentPlayer: 1,
      board: createBoard(boardSize),
      scores: createScores(selectedPlayers),
      lastMoveAt: Date.now(),
      players: {
        1: {
          playerId: 1,
          uid: user.uid,
          name: user.name,
          avatar: user.avatar,
          isHost: true,
          joined: true,
        },
      },
    };

    try {
      setCreating(true);

      await set(ref(db, "rooms/" + roomCode), roomData);

      navigation.navigate("OnlineWaiting", {
        roomCode,
        playersCount: selectedPlayers,
        playerId: 1,
        isHost: true,
      });
    } catch (error) {
      Alert.alert("Error", "Room not created. Check Firebase connection.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <ImageBackground source={require("../../assets/color-blast-bg.jpg")} style={styles.bg}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>➕ Create Room</Text>
          <Text style={styles.subtitle}>Select online players</Text>

          <View style={styles.settingsBox}>
            <Text style={styles.settingsText}>Board: {settings.boardSize} × {settings.boardSize}</Text>
            <Text style={styles.settingsText}>Rounds: {settings.rounds}</Text>
            <Text style={styles.settingsText}>Sound: {settings.soundOn === false ? "Off" : "On"}</Text>
          </View>

          <View style={styles.playerRow}>
            {[2, 3, 4].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.playerButton, selectedPlayers === num && styles.selectedButton]}
                onPress={() => setSelectedPlayers(num)}
              >
                <Text style={styles.playerText}>{num} Players</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.createButton} onPress={createRoom}>
            <Text style={styles.createText}>
              {creating ? "Creating..." : "🎮 Create Online Room"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23,0,45,0.65)",
    justifyContent: "center",
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: 45,
    left: 20,
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#39214F",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  card: {
    backgroundColor: "rgba(43,23,64,0.9)",
    borderRadius: 34,
    padding: 24,
    borderWidth: 3,
    borderColor: "#FFD166",
  },
  title: {
    color: "#FFD166",
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 18,
  },
  settingsBox: {
    backgroundColor: "#35214A",
    borderRadius: 20,
    padding: 14,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#ffffff33",
  },
  settingsText: {
    color: "#FFD166",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 2,
  },
  playerRow: { gap: 16 },
  playerButton: {
    backgroundColor: "#45C7F3",
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#fff",
  },
  selectedButton: {
    backgroundColor: "#15CFA3",
    borderColor: "#FFD166",
  },
  playerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#FF4D8D",
    paddingVertical: 20,
    borderRadius: 25,
    marginTop: 28,
  },
  createText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
});
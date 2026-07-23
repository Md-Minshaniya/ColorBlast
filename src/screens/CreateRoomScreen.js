import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  get,
  ref,
  set,
} from "firebase/database";

import { db } from "../firebaseConfig";
import { getGuestPlayer } from "../utils/userSession";
import { getGameSettings } from "./SettingsScreen";

const COLORS = [
  "#45C7F3",
  "#FFD166",
  "#FF4D6D",
  "#15CFA3",
  "#9B5DE5",
  "#FF8A3D",
];

function randomColor() {
  return COLORS[
    Math.floor(Math.random() * COLORS.length)
  ];
}

function generateRoomCode() {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}

function createBoard(boardSize) {
  return Array.from(
    { length: boardSize },
    () =>
      Array.from(
        { length: boardSize },
        () => ({
          color: randomColor(),
        })
      )
  );
}

function createScores(playersCount) {
  const scores = {};

  for (
    let playerId = 1;
    playerId <= playersCount;
    playerId += 1
  ) {
    scores[playerId] = 0;
  }

  return scores;
}

async function createUniqueRoomCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const roomCode = generateRoomCode();

    const snapshot = await get(
      ref(db, `rooms/${roomCode}`)
    );

    if (!snapshot.exists()) {
      return roomCode;
    }
  }

  throw new Error(
    "Could not generate a unique room code. Try again."
  );
}

export default function CreateRoomScreen({
  navigation,
}) {
  const settings = getGameSettings();

  const [selectedPlayers, setSelectedPlayers] =
    useState(2);

  const [creating, setCreating] = useState(false);

  async function createRoom() {
    if (creating) {
      return;
    }

    try {
      setCreating(true);

      const guestPlayer = await getGuestPlayer();
      const roomCode =
        await createUniqueRoomCode();

      const boardSize =
        Number(settings?.boardSize) || 7;

      const rounds =
        Number(settings?.rounds) || 18;

      const currentTime = Date.now();

      const roomData = {
        roomCode,
        boardSize,
        rounds,
        roundsLeft: rounds,

        playersCount: selectedPlayers,
        joinedPlayers: 1,

        status: "waiting",

        createdAt: currentTime,
        startedAt: 0,
        endedAt: 0,

        currentPlayer: 1,
        lastMoveAt: currentTime,

        board: createBoard(boardSize),
        scores: createScores(selectedPlayers),

        players: {
          1: {
            playerId: 1,
            uid: guestPlayer.uid,
            name: guestPlayer.name,
            avatar: guestPlayer.avatar,
            isHost: true,
            joined: true,
            joinedAt: currentTime,
          },
        },
      };

      await set(
        ref(db, `rooms/${roomCode}`),
        roomData
      );

      navigation.replace("OnlineWaiting", {
        roomCode,
        playersCount: selectedPlayers,
        playerId: 1,
        isHost: true,
      });
    } catch (error) {
      console.error(
        "Create room error:",
        error
      );

      Alert.alert(
        "Room Creation Failed",
        error?.message ||
          "Could not create the room. Check your internet connection and Firebase rules."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <ImageBackground
      source={require("../../assets/color-blast-bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={creating}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={30}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>
            ➕ Create Room
          </Text>

          <Text style={styles.subtitle}>
            Select the number of online players
          </Text>

          <View style={styles.settingsBox}>
            <Text style={styles.settingsText}>
              Board:{" "}
              {settings?.boardSize || 7} ×{" "}
              {settings?.boardSize || 7}
            </Text>

            <Text style={styles.settingsText}>
              Rounds: {settings?.rounds || 18}
            </Text>
          </View>

          <View style={styles.playerRow}>
            {[2, 3, 4].map(
              (numberOfPlayers) => (
                <TouchableOpacity
                  key={numberOfPlayers}
                  style={[
                    styles.playerButton,
                    selectedPlayers ===
                      numberOfPlayers &&
                      styles.selectedButton,
                    creating &&
                      styles.disabledButton,
                  ]}
                  onPress={() =>
                    setSelectedPlayers(
                      numberOfPlayers
                    )
                  }
                  disabled={creating}
                  activeOpacity={0.8}
                >
                  <Text
                    style={styles.playerText}
                  >
                    {numberOfPlayers} Players
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              creating &&
                styles.disabledButton,
            ]}
            onPress={createRoom}
            disabled={creating}
            activeOpacity={0.8}
          >
            <Text style={styles.createText}>
              {creating
                ? "Creating Room..."
                : "🎮 Create Online Room"}
            </Text>
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
    backgroundColor:
      "rgba(23,0,45,0.65)",
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
    backgroundColor:
      "rgba(43,23,64,0.9)",
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

  playerRow: {
    gap: 16,
  },

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

  disabledButton: {
    opacity: 0.65,
  },

  createText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
});
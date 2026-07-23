import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  get,
  ref,
  update,
} from "firebase/database";

import { db } from "../firebaseConfig";
import { getGuestPlayer } from "../utils/userSession";

function findExistingPlayer(players, guestUid) {
  if (!players || !guestUid) {
    return null;
  }

  const playerIds = Object.keys(players);

  for (const id of playerIds) {
    if (players[id]?.uid === guestUid) {
      return Number(id);
    }
  }

  return null;
}

function findAvailablePlayerId(
  players,
  playersCount
) {
  for (
    let playerId = 1;
    playerId <= playersCount;
    playerId += 1
  ) {
    if (!players?.[playerId]) {
      return playerId;
    }
  }

  return null;
}

export default function JoinRoomScreen({
  navigation,
}) {
  const [roomCode, setRoomCode] =
    useState("");

  const [joining, setJoining] =
    useState(false);

  function handleRoomCodeChange(value) {
    const numericValue = value.replace(
      /[^0-9]/g,
      ""
    );

    setRoomCode(numericValue);
  }

  async function joinRoom() {
    if (joining) {
      return;
    }

    const code = roomCode.trim();

    if (!/^\d{6}$/.test(code)) {
      Alert.alert(
        "Invalid Code",
        "Enter a valid 6-digit room code."
      );

      return;
    }

    try {
      setJoining(true);

      const guestPlayer =
        await getGuestPlayer();

      const roomRef = ref(
        db,
        `rooms/${code}`
      );

      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        Alert.alert(
          "Room Not Found",
          "No room exists with this code. Check the code and try again."
        );

        return;
      }

      const room = snapshot.val();

      const playersCount =
        Number(room.playersCount) || 2;

      const players =
        room.players || {};

      /*
       * If this phone already joined the room,
       * reopen the waiting screen instead of
       * creating another player.
       */
      const existingPlayerId =
        findExistingPlayer(
          players,
          guestPlayer.uid
        );

      if (existingPlayerId) {
        if (room.status === "playing") {
          navigation.replace(
            "OnlineGame",
            {
              roomCode: code,
              playersCount,
              playerId:
                existingPlayerId,
            }
          );
        } else if (
          room.status === "waiting"
        ) {
          navigation.replace(
            "OnlineWaiting",
            {
              roomCode: code,
              playersCount,
              playerId:
                existingPlayerId,
              isHost:
                existingPlayerId === 1,
            }
          );
        } else {
          Alert.alert(
            "Game Ended",
            "This room's game has already ended."
          );
        }

        return;
      }

      if (room.status !== "waiting") {
        Alert.alert(
          "Room Closed",
          room.status === "playing"
            ? "This game has already started."
            : "This game has already ended."
        );

        return;
      }

      const playerId =
        findAvailablePlayerId(
          players,
          playersCount
        );

      if (!playerId) {
        Alert.alert(
          "Room Full",
          "All player positions are already filled."
        );

        return;
      }

      const currentPlayerCount =
        Object.keys(players).length;

      if (
        currentPlayerCount >= playersCount
      ) {
        Alert.alert(
          "Room Full",
          "All players have already joined."
        );

        return;
      }

      const joinedAt = Date.now();

      /*
       * Add the new player and update the joined
       * count in one Firebase update operation.
       */
      await update(roomRef, {
        [`players/${playerId}`]: {
          playerId,
          uid: guestPlayer.uid,
          name:
            guestPlayer.name ||
            `Player ${playerId}`,
          avatar:
            guestPlayer.avatar || "🎮",
          isHost: false,
          joined: true,
          joinedAt,
        },

        joinedPlayers:
          currentPlayerCount + 1,
      });

      navigation.replace(
        "OnlineWaiting",
        {
          roomCode: code,
          playersCount,
          playerId,
          isHost: false,
        }
      );
    } catch (error) {
      console.error(
        "Join room error:",
        error
      );

      Alert.alert(
        "Could Not Join",
        error?.message ||
          "Check your internet connection and try again."
      );
    } finally {
      setJoining(false);
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
          onPress={() =>
            navigation.goBack()
          }
          disabled={joining}
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
            🔑 Join Room
          </Text>

          <Text style={styles.subtitle}>
            Enter the room code shared by
            your friend
          </Text>

          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#ffffff66"
            keyboardType="number-pad"
            maxLength={6}
            value={roomCode}
            onChangeText={
              handleRoomCodeChange
            }
            editable={!joining}
            returnKeyType="done"
            onSubmitEditing={joinRoom}
          />

          <TouchableOpacity
            style={[
              styles.joinButton,
              joining &&
                styles.disabledButton,
            ]}
            onPress={joinRoom}
            disabled={joining}
            activeOpacity={0.8}
          >
            <Text style={styles.joinText}>
              {joining
                ? "Joining..."
                : "🌐 Join Online Room"}
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
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#35214A",
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 5,
    paddingVertical: 18,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#45C7F3",
  },

  joinButton: {
    backgroundColor: "#15CFA3",
    paddingVertical: 20,
    borderRadius: 25,
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.65,
  },

  joinText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
});
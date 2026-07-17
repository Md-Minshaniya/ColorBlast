import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ImageBackground,
  TextInput, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ref, get, update } from "firebase/database";
import { db } from "../firebaseConfig";
import { getUserSession } from "../utils/userSession";

export default function JoinRoomScreen({ navigation }) {
  const [roomCode, setRoomCode] = useState("");
  const [joining, setJoining] = useState(false);

  async function joinRoom() {
    if (joining) return;

    const user = await getUserSession();

    if (!user) {
      Alert.alert("Login Required", "Please login first.");
      navigation.navigate("Auth");
      return;
    }

    const code = roomCode.trim();

    if (code.length !== 6) {
      Alert.alert("Invalid Code", "Enter 6 digit room code.");
      return;
    }

    try {
      setJoining(true);

      const roomRef = ref(db, "rooms/" + code);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        Alert.alert("Room Not Found", "Check room code again.");
        return;
      }

      const room = snapshot.val();

      if (room.status !== "waiting") {
        Alert.alert("Room Closed", "This game already started.");
        return;
      }

      if (room.joinedPlayers >= room.playersCount) {
        Alert.alert("Room Full", "All players already joined.");
        return;
      }

      const playerId = room.joinedPlayers + 1;

      await update(roomRef, {
        joinedPlayers: playerId,
        [`players/${playerId}`]: {
          playerId,
          uid: user.uid,
          name: user.name,
          avatar: user.avatar,
          isHost: false,
          joined: true,
        },
      });

      navigation.navigate("OnlineWaiting", {
        roomCode: code,
        playersCount: room.playersCount,
        playerId,
        isHost: false,
      });
    } catch (error) {
      Alert.alert("Error", "Could not join room.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <ImageBackground source={require("../../assets/color-blast-bg.jpg")} style={styles.bg}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>🔑 Join Room</Text>
          <Text style={styles.subtitle}>Enter room code shared by your friend</Text>

          <TextInput
            style={styles.input}
            placeholder="Room Code"
            placeholderTextColor="#ffffff99"
            keyboardType="number-pad"
            maxLength={6}
            value={roomCode}
            onChangeText={setRoomCode}
          />

          <TouchableOpacity style={styles.joinButton} onPress={joinRoom}>
            <Text style={styles.joinText}>
              {joining ? "Joining..." : "🌐 Join Online Room"}
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
  joinText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
});
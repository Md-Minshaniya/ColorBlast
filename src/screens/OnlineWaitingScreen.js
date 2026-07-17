import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ref, onValue, update, off } from "firebase/database";
import { db } from "../firebaseConfig";

export default function OnlineWaitingScreen({ navigation, route }) {
  const roomCode = route.params?.roomCode;
  const playersCount = route.params?.playersCount || 2;
  const playerId = route.params?.playerId || 1;
  const isHost = route.params?.isHost || false;

  const [joinedPlayers, setJoinedPlayers] = useState(1);

  useEffect(() => {
    const roomRef = ref(db, "rooms/" + roomCode);

    const unsubscribe = onValue(roomRef, async (snapshot) => {
      if (!snapshot.exists()) return;

      const room = snapshot.val();

      setJoinedPlayers(room.joinedPlayers || 1);

      if (
        isHost &&
        room.status === "waiting" &&
        room.joinedPlayers >= room.playersCount
      ) {
        await update(roomRef, {
          status: "playing",
          startedAt: Date.now(),
        });
      }

      if (room.status === "playing") {
        navigation.replace("OnlineGame", {
          roomCode,
          playersCount: room.playersCount,
          playerId,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/color-blast-bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>⏳ Waiting Room</Text>

          <Text style={styles.label}>Room Code</Text>
          <Text style={styles.roomCode}>{roomCode}</Text>

          <Text style={styles.info}>Share this code with your friends.</Text>

          <Text style={styles.players}>
            Joined: {joinedPlayers} / {playersCount}
          </Text>

          <Text style={styles.waitText}>
            Game starts automatically after all players join.
          </Text>
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
    alignItems: "center",
  },
  title: {
    color: "#FFD166",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 25,
  },
  label: {
    color: "#45C7F3",
    fontSize: 22,
    fontWeight: "900",
  },
  roomCode: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 6,
    marginVertical: 16,
  },
  info: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  players: {
    color: "#FFD166",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 25,
  },
  waitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 18,
    lineHeight: 25,
  },
});
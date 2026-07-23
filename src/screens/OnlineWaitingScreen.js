import React, {
  useEffect,
  useRef,
  useState,
} from "react";

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
  onValue,
  ref,
  update,
} from "firebase/database";

import { db } from "../firebaseConfig";

export default function OnlineWaitingScreen({
  navigation,
  route,
}) {
  const roomCode =
    route.params?.roomCode;

  const playerId =
    Number(route.params?.playerId) || 1;

  const routePlayersCount =
    Number(
      route.params?.playersCount
    ) || 2;

  const [joinedPlayers, setJoinedPlayers] =
    useState(1);

  const [playersCount, setPlayersCount] =
    useState(routePlayersCount);

  const [players, setPlayers] =
    useState({});

  const [roomStatus, setRoomStatus] =
    useState("waiting");

  const startRequestedRef =
    useRef(false);

  const navigationStartedRef =
    useRef(false);

  useEffect(() => {
    if (!roomCode) {
      Alert.alert(
        "Invalid Room",
        "Room information is missing."
      );

      navigation.replace("OnlineHome");
      return undefined;
    }

    const roomRef = ref(
      db,
      `rooms/${roomCode}`
    );

    const unsubscribe = onValue(
      roomRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          Alert.alert(
            "Room Closed",
            "This room no longer exists."
          );

          navigation.replace(
            "OnlineHome"
          );

          return;
        }

        const room = snapshot.val();

        const currentJoined =
          Number(room.joinedPlayers) || 0;

        const requiredPlayers =
          Number(room.playersCount) || 2;

        setJoinedPlayers(
          currentJoined
        );

        setPlayersCount(
          requiredPlayers
        );

        setPlayers(
          room.players || {}
        );

        setRoomStatus(
          room.status || "waiting"
        );

        if (
          room.status === "waiting" &&
          currentJoined >=
            requiredPlayers &&
          !startRequestedRef.current
        ) {
          startRequestedRef.current =
            true;

          try {
            await update(roomRef, {
              status: "playing",
              startedAt: Date.now(),
              lastMoveAt: Date.now(),
              currentPlayer:
                Number(
                  room.currentPlayer
                ) || 1,
            });
          } catch (error) {
            console.error(
              "Start game error:",
              error
            );

            startRequestedRef.current =
              false;
          }
        }

        if (
          room.status === "playing" &&
          !navigationStartedRef.current
        ) {
          navigationStartedRef.current =
            true;

          navigation.replace(
            "OnlineGame",
            {
              roomCode,
              playersCount:
                requiredPlayers,
              playerId,
            }
          );
        }

        if (
          room.status === "ended" &&
          !navigationStartedRef.current
        ) {
          navigationStartedRef.current =
            true;

          navigation.replace(
            "OnlineHome"
          );
        }
      },
      (error) => {
        console.error(
          "Waiting room listener error:",
          error
        );

        Alert.alert(
          "Connection Error",
          "Could not connect to the room."
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [
    navigation,
    playerId,
    roomCode,
  ]);

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
            navigation.navigate(
              "OnlineHome"
            )
          }
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
            ⏳ Waiting Room
          </Text>

          <Text style={styles.label}>
            Room Code
          </Text>

          <Text style={styles.roomCode}>
            {roomCode}
          </Text>

          <Text style={styles.info}>
            Share this code with your
            friends.
          </Text>

          <Text style={styles.playersCount}>
            Joined: {joinedPlayers} /{" "}
            {playersCount}
          </Text>

          <View style={styles.playerList}>
            {Array.from(
              {
                length: playersCount,
              },
              (_, index) => index + 1
            ).map((id) => {
              const player =
                players?.[id];

              return (
                <View
                  key={id}
                  style={styles.playerRow}
                >
                  <Text
                    style={
                      styles.playerAvatar
                    }
                  >
                    {player?.avatar ||
                      "⌛"}
                  </Text>

                  <Text
                    style={
                      styles.playerName
                    }
                  >
                    {player
                      ? `${player.name} ${
                          id === playerId
                            ? "(You)"
                            : ""
                        }`
                      : `Waiting for Player ${id}`}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.waitText}>
            {roomStatus === "playing"
              ? "Starting game..."
              : "The game starts automatically when all players join."}
          </Text>
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

  playersCount: {
    color: "#FFD166",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 25,
  },

  playerList: {
    width: "100%",
    marginTop: 18,
    gap: 10,
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#35214A",
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },

  playerAvatar: {
    fontSize: 24,
    marginRight: 12,
  },

  playerName: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
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
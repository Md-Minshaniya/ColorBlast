import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  ScrollView,
  TextInput,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ref,
  onValue,
  update,
  push,
  query,
  limitToLast,
} from "firebase/database";
import { db } from "../firebaseConfig";

const COLORS = [
  "#45C7F3",
  "#FFD166",
  "#FF4D6D",
  "#15CFA3",
  "#9B5DE5",
  "#FF8A3D",
];

const PLAYER_COLORS = {
  1: "#33C7FF",
  2: "#4DFF66",
  3: "#FFD700",
  4: "#FF4FD8",
};

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function isFreeTile(tile) {
  return tile.activeBy === undefined || tile.activeBy === null;
}

function getTileSize(boardSize) {
  if (boardSize === 7) return 42;
  if (boardSize === 10) return 28;
  return 18;
}

function getTileMargin(boardSize) {
  if (boardSize === 7) return 4;
  if (boardSize === 10) return 3;
  return 2;
}

function toArray(data) {
  if (Array.isArray(data)) return data;

  return Object.keys(data || {})
    .sort((a, b) => Number(a) - Number(b))
    .map((rowKey) => {
      const row = data[rowKey];
      if (Array.isArray(row)) return row;

      return Object.keys(row || {})
        .sort((a, b) => Number(a) - Number(b))
        .map((colKey) => row[colKey]);
    });
}

function getStartPosition(playerId, boardSize) {
  if (playerId === 1) return [0, 0];
  if (playerId === 2) return [0, boardSize - 1];
  if (playerId === 3) return [boardSize - 1, boardSize - 1];
  return [boardSize - 1, 0];
}

function getPlayer(room, id) {
  return room?.players?.[id] || {
    playerId: id,
    name: `Player ${id}`,
    avatar: "🎮",
  };
}

function getPlayerLabel(room, id) {
  const player = getPlayer(room, id);
  return `${player.avatar || "🎮"} ${player.name || `Player ${id}`}`;
}

function isNearActiveTiles(board, boardSize, row, col, playerId) {
  if (!board[row] || !board[row][col]) return false;
  if (!isFreeTile(board[row][col])) return false;

  const hasActiveTiles = board.some((r) =>
    r.some((tile) => Number(tile.activeBy) === Number(playerId))
  );

  if (!hasActiveTiles) {
    const [startRow, startCol] = getStartPosition(playerId, boardSize);
    return row === startRow && col === startCol;
  }

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  return dirs.some(([dr, dc]) => {
    const nr = row + dr;
    const nc = col + dc;

    return (
      nr >= 0 &&
      nc >= 0 &&
      nr < boardSize &&
      nc < boardSize &&
      Number(board[nr][nc].activeBy) === Number(playerId)
    );
  });
}

function getConnected(board, boardSize, row, col, color) {
  const visited = {};
  const result = [];
  const stack = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const key = `${r}-${c}`;

    if (
      r < 0 ||
      c < 0 ||
      r >= boardSize ||
      c >= boardSize ||
      visited[key] ||
      board[r][c].color !== color ||
      !isFreeTile(board[r][c])
    ) {
      continue;
    }

    visited[key] = true;
    result.push([r, c]);

    stack.push([r + 1, c]);
    stack.push([r - 1, c]);
    stack.push([r, c + 1]);
    stack.push([r, c - 1]);
  }

  return result;
}

function getWinner(scores) {
  let winner = 1;
  let highest = scores?.[1] || 0;

  Object.keys(scores || {}).forEach((id) => {
    if ((scores[id] || 0) > highest) {
      highest = scores[id];
      winner = Number(id);
    }
  });

  return winner;
}

export default function OnlineGameScreen({ navigation, route }) {
  const roomCode = route.params?.roomCode;
  const playerId = route.params?.playerId || 1;

  const [room, setRoom] = useState(null);
  const [moving, setMoving] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const endedRef = useRef(false);
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: false,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const roomRef = ref(db, "rooms/" + roomCode);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        Alert.alert("Room Closed", "This room no longer exists.");
        navigation.replace("OnlineHome");
        return;
      }

      const latestRoom = snapshot.val();
      setRoom(latestRoom);

      if (latestRoom.status === "ended" && !endedRef.current) {
        endedRef.current = true;

        const finalScores = latestRoom.scores || {};
        const winner = latestRoom.winner || getWinner(finalScores);

        navigation.replace("End", {
          scores: finalScores,
          winner,
          online: true,
          roomCode,
          players: latestRoom.players || {},
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const messagesRef = query(
      ref(db, `rooms/${roomCode}/messages`),
      limitToLast(5)
    );

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMessages([]);
        return;
      }

      setMessages(Object.values(snapshot.val()));
    });

    return () => unsubscribe();
  }, []);

  async function playMove(row, col) {
    if (!room || moving) return;
    if (room.status !== "playing") return;

    if (Number(room.currentPlayer) !== Number(playerId)) {
      Alert.alert("Wait", "It is not your turn.");
      return;
    }

    const board = toArray(room.board);
    const boardSize = room.boardSize || 7;

    if (!isNearActiveTiles(board, boardSize, row, col, playerId)) {
      return;
    }

    const selectedColor = board[row][col].color;
    const matchedTiles = getConnected(board, boardSize, row, col, selectedColor);

    if (matchedTiles.length === 0) return;

    try {
      setMoving(true);

      const newBoard = board.map((boardRow) =>
        boardRow.map((tile) => {
          if (Number(tile.activeBy) === Number(playerId)) {
            return {
              color: randomColor(),
            };
          }

          return { ...tile };
        })
      );

      matchedTiles.forEach(([r, c]) => {
        newBoard[r][c] = {
          ...newBoard[r][c],
          activeBy: playerId,
        };
      });

      const oldScores = room.scores || {};
      const newScores = {
        ...oldScores,
        [playerId]: (oldScores[playerId] || 0) + matchedTiles.length,
      };

      let nextPlayer = Number(playerId) + 1;
      let roundsLeft = room.roundsLeft || room.rounds || 18;

      if (nextPlayer > room.playersCount) {
        nextPlayer = 1;
        roundsLeft -= 1;
      }

      const updates = {
        board: newBoard,
        scores: newScores,
        currentPlayer: nextPlayer,
        roundsLeft,
        lastMoveAt: Date.now(),
      };

      if (roundsLeft <= 0) {
        updates.status = "ended";
        updates.winner = getWinner(newScores);
      }

      await update(ref(db, "rooms/" + roomCode), updates);
    } catch (error) {
      console.log(error);
      Alert.alert("Move Failed", "Check internet connection.");
    } finally {
      setMoving(false);
    }
  }

  async function sendMessage() {
    const text = message.trim();
    if (!text) return;

    const player = getPlayer(room, playerId);

    try {
      await push(ref(db, `rooms/${roomCode}/messages`), {
        playerId,
        name: player.name || `Player ${playerId}`,
        avatar: player.avatar || "🎮",
        text,
        createdAt: Date.now(),
      });

      setMessage("");
    } catch (error) {
      console.log(error);
    }
  }

  if (!room) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading online game...</Text>
      </View>
    );
  }

  const board = toArray(room.board);
  const boardSize = room.boardSize || 7;
  const tileSize = getTileSize(boardSize);
  const tileMargin = getTileMargin(boardSize);
  const isMyTurn = Number(room.currentPlayer) === Number(playerId);
  const currentPlayerLabel = getPlayerLabel(room, room.currentPlayer);
  const myPlayer = getPlayer(room, playerId);

  return (
    <ImageBackground
      source={require("../../assets/color-blast-bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.overlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("OnlineHome")}
        >
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>🌐 Online Game</Text>
        <Text style={styles.roomText}>Room: {roomCode}</Text>
        <Text style={styles.youText}>
          You are {myPlayer.avatar || "🎮"} {myPlayer.name || `Player ${playerId}`}
        </Text>

        <Text style={styles.settingsText}>
          Board: {boardSize} × {boardSize} | Rounds:{" "}
          {room.rounds || room.roundsLeft} | Sound:{" "}
          {room.soundOn === false ? "Off" : "On"}
        </Text>

        <View style={styles.scoreRow}>
          {Array.from({ length: room.playersCount }, (_, i) => i + 1).map(
            (id) => {
              const player = getPlayer(room, id);
              const isActivePlayer = Number(room.currentPlayer) === id;

              return (
                <View
                  key={id}
                  style={[
                    styles.scoreBox,
                    {
                      borderColor: isActivePlayer
                        ? PLAYER_COLORS[id]
                        : "#ffffff",
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>{player.avatar || "🎮"}</Text>

                  <Text style={styles.scoreName} numberOfLines={1}>
                    {player.name || `Player ${id}`}
                  </Text>

                  <Text style={styles.playerIdText}>P{id}</Text>

                  <Text style={styles.scoreValue}>
                    {room.scores?.[id] || 0}
                  </Text>
                </View>
              );
            }
          )}
        </View>

        <Text style={[styles.turnText, isMyTurn && styles.myTurnText]}>
          {isMyTurn ? "Your Turn" : `${currentPlayerLabel}'s Turn`}
        </Text>

        <Text style={styles.roundText}>Rounds Left: {room.roundsLeft}</Text>

        <View style={styles.board}>
          {board.map((rowTiles, r) => (
            <View key={r} style={styles.boardRow}>
              {rowTiles.map((tile, c) => {
                const isActive =
                  tile.activeBy !== undefined && tile.activeBy !== null;

                const isCurrentPlayerTile =
                  Number(tile.activeBy) === Number(room.currentPlayer);

                const borderColor =
                  isActive && isCurrentPlayerTile
                    ? blinkAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["#fff", PLAYER_COLORS[tile.activeBy]],
                      })
                    : isActive
                    ? PLAYER_COLORS[tile.activeBy]
                    : "#ffffff33";

                return (
                  <TouchableOpacity
                    key={`${r}-${c}`}
                    activeOpacity={0.7}
                    disabled={!isMyTurn || moving || room.status === "ended"}
                    onPress={() => playMove(r, c)}
                  >
                    <Animated.View
                      style={[
                        styles.tile,
                        {
                          width: tileSize,
                          height: tileSize,
                          margin: tileMargin,
                          borderRadius: boardSize === 15 ? 7 : 12,
                          backgroundColor: tile.color,
                          borderColor,
                          borderWidth: isActive ? 4 : 1,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.chatBox}>
          <Text style={styles.chatTitle}>💬 Room Chat</Text>

          {messages.map((item, index) => (
            <Text key={index} style={styles.chatMessage}>
              {item.avatar || "🎮"} {item.name || `Player ${item.playerId}`}:{" "}
              {item.text}
            </Text>
          ))}

          <View style={styles.chatInputRow}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type message"
              placeholderTextColor="#ffffff99"
              style={styles.chatInput}
            />

            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    minHeight: "100%",
    backgroundColor: "rgba(23,0,45,0.65)",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 35,
  },
  loading: {
    flex: 1,
    backgroundColor: "#17002D",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  backButton: {
    position: "absolute",
    top: 35,
    left: 20,
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#39214F",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    color: "#FFD166",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 8,
  },
  roomText: {
    color: "#45C7F3",
    fontSize: 20,
    fontWeight: "900",
  },
  youText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },
  settingsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 18,
    gap: 12,
    paddingHorizontal: 10,
  },
  scoreBox: {
    width: 105,
    minHeight: 112,
    backgroundColor: "#35214A",
    borderRadius: 18,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  avatarText: {
    fontSize: 24,
    marginBottom: 2,
  },
  scoreName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    maxWidth: 88,
    textAlign: "center",
  },
  playerIdText: {
    color: "#45C7F3",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
  },
  scoreValue: {
    color: "#FFD166",
    fontSize: 26,
    fontWeight: "900",
  },
  turnText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  myTurnText: {
    color: "#15CFA3",
  },
  roundText: {
    color: "#FFD166",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },
  board: {
    backgroundColor: "#2B1740",
    padding: 8,
    borderRadius: 24,
    marginTop: 18,
  },
  boardRow: {
    flexDirection: "row",
  },
  tile: {},
  chatBox: {
    width: "90%",
    backgroundColor: "#2B1740DD",
    borderRadius: 20,
    padding: 14,
    marginTop: 22,
    borderWidth: 2,
    borderColor: "#FFD166",
  },
  chatTitle: {
    color: "#FFD166",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  chatMessage: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  chatInputRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#35214A",
    color: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "700",
  },
  sendButton: {
    backgroundColor: "#15CFA3",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 14,
  },
  sendText: {
    color: "#fff",
    fontWeight: "900",
  },
});
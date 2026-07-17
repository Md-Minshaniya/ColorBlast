import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getGameSettings } from "./SettingsScreen";

const TURN_TIME = 10;

const COLORS = [
  "#45C7F3",
  "#FFD166",
  "#FF4D6D",
  "#15CFA3",
  "#9B5DE5",
  "#FF8A3D",
];

const PLAYER_STYLES = {
  1: { name: "Player 1", border: "#33C7FF", labelStyle: "p1" },
  2: { name: "Player 2", border: "#4DFF66", labelStyle: "p2" },
  3: { name: "Player 3", border: "#FFD700", labelStyle: "p3" },
  4: { name: "Player 4", border: "#FF4FD8", labelStyle: "p4" },
};

function getStartPosition(playerId, boardSize) {
  if (playerId === 1) return [0, 0];
  if (playerId === 2) return [0, boardSize - 1];
  if (playerId === 3) return [boardSize - 1, boardSize - 1];
  return [boardSize - 1, 0];
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

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createBoard(boardSize) {
  return Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => ({
      color: randomColor(),
      activeBy: null,
    }))
  );
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
      board[r][c].activeBy !== null
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

function isNearActiveTiles(board, boardSize, row, col, playerId) {
  if (board[row][col].activeBy !== null) return false;

  const hasActiveTiles = board.some((r) =>
    r.some((tile) => tile.activeBy === playerId)
  );

  if (!hasActiveTiles) {
    const [startRow, startCol] = getStartPosition(playerId, boardSize);
    return row === startRow && col === startCol;
  }

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  return directions.some(([dr, dc]) => {
    const nr = row + dr;
    const nc = col + dc;

    return (
      nr >= 0 &&
      nc >= 0 &&
      nr < boardSize &&
      nc < boardSize &&
      board[nr][nc].activeBy === playerId
    );
  });
}

export default function GameScreen({ navigation, route }) {
  const settings = getGameSettings();

  const boardSize = settings.boardSize;
  const maxRounds = settings.rounds;
  const tileSize = getTileSize(boardSize);
  const tileMargin = getTileMargin(boardSize);

  const mode = route.params?.mode || "single";
  const playersCount = route.params?.playersCount || 2;

  const [board, setBoard] = useState(() => createBoard(boardSize));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [roundsLeft, setRoundsLeft] = useState(maxRounds);
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const [gameEnded, setGameEnded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [scores, setScores] = useState(() => {
    const obj = {};
    for (let i = 1; i <= playersCount; i++) obj[i] = 0;
    return obj;
  });

  const blinkAnim = useRef(new Animated.Value(0)).current;

  async function playGameMusic() {
    return;
  }

  async function stopGameMusic() {
    return;
  }

  async function playClickSound() {
    return;
  }

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
    playGameMusic();

    return () => {
      stopGameMusic();
    };
  }, []);

  useEffect(() => {
    if (gameEnded || paused) return;

    setTimeLeft(TURN_TIME);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          nextTurn();
          return TURN_TIME;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayer, gameEnded, paused]);

  useEffect(() => {
    if (gameEnded || paused) return;

    if (mode === "single" && currentPlayer === 2) {
      const aiTimer = setTimeout(() => {
        const possibleMoves = [];

        for (let r = 0; r < boardSize; r++) {
          for (let c = 0; c < boardSize; c++) {
            if (isNearActiveTiles(board, boardSize, r, c, 2)) {
              possibleMoves.push([r, c]);
            }
          }
        }

        if (possibleMoves.length > 0) {
          const bestMove = possibleMoves.sort((a, b) => {
            const scoreA = getConnected(
              board,
              boardSize,
              a[0],
              a[1],
              board[a[0]][a[1]].color
            ).length;

            const scoreB = getConnected(
              board,
              boardSize,
              b[0],
              b[1],
              board[b[0]][b[1]].color
            ).length;

            return scoreB - scoreA;
          })[0];

          playMove(bestMove[0], bestMove[1], true);
        } else {
          nextTurn();
        }
      }, 700);

      return () => clearTimeout(aiTimer);
    }
  }, [currentPlayer, board, gameEnded, paused]);

  function finishGame(finalScores = scores) {
    if (gameEnded) return;

    setGameEnded(true);
    stopGameMusic();

    const winner = Object.keys(finalScores).reduce((a, b) =>
      finalScores[a] > finalScores[b] ? a : b
    );

    navigation.replace("End", {
      scores: finalScores,
      winner,
    });
  }

  function nextTurn() {
    if (gameEnded || paused) return;

    if (currentPlayer === playersCount) {
      if (roundsLeft <= 1) {
        finishGame();
        return;
      }

      setRoundsLeft((prev) => prev - 1);
      setCurrentPlayer(1);
    } else {
      setCurrentPlayer((prev) => prev + 1);
    }
  }

  function playMove(row, col, isAI = false) {
    if (gameEnded || paused) return;
    if (mode === "single" && currentPlayer === 2 && !isAI) return;
    if (!isNearActiveTiles(board, boardSize, row, col, currentPlayer)) return;

    const selectedTile = board[row][col];

    const matchedTiles = getConnected(
      board,
      boardSize,
      row,
      col,
      selectedTile.color
    );

    if (matchedTiles.length === 0) return;

    const newScores = {
      ...scores,
      [currentPlayer]: scores[currentPlayer] + matchedTiles.length,
    };

    const newBoard = board.map((boardRow) =>
      boardRow.map((tile) => {
        if (tile.activeBy === currentPlayer) {
          return {
            color: randomColor(),
            activeBy: null,
          };
        }

        return { ...tile };
      })
    );

    matchedTiles.forEach(([r, c]) => {
      newBoard[r][c] = {
        ...newBoard[r][c],
        activeBy: currentPlayer,
      };
    });

    setScores(newScores);
    setBoard(newBoard);

    if (currentPlayer === playersCount && roundsLeft <= 1) {
      finishGame(newScores);
      return;
    }

    nextTurn();
  }

  function restartGame() {
    setBoard(createBoard(boardSize));

    setScores(() => {
      const obj = {};
      for (let i = 1; i <= playersCount; i++) obj[i] = 0;
      return obj;
    });

    setCurrentPlayer(1);
    setRoundsLeft(maxRounds);
    setTimeLeft(TURN_TIME);
    setGameEnded(false);
    setPaused(false);
    setMenuOpen(false);
  }

  function togglePause() {
    setPaused((prev) => !prev);
    setMenuOpen(false);
  }

  const playerCards = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= playersCount; i++) arr.push(i);
    return arr;
  }, [playersCount]);

  const topPlayers = playerCards.slice(0, 2);
  const bottomPlayers = playersCount === 4 ? [4, 3] : playerCards.slice(2);

  function renderPlayerCard(playerId) {
    const active = currentPlayer === playerId;
    const playerColor = PLAYER_STYLES[playerId].border;

    const borderColor = active
      ? blinkAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["#ffffff", playerColor],
        })
      : playerColor;

    return (
      <Animated.View
        key={playerId}
        style={[
          styles.scoreCard,
          {
            width: boardSize === 15 ? 122 : 145,
            height: boardSize === 15 ? 100 : 118,
            borderColor,
            shadowColor: playerColor,
            shadowOpacity: active ? 1 : 0.35,
            borderWidth: active ? 6 : 4,
          },
        ]}
      >
        <Text
          style={[
            styles.playerName,
            { fontSize: boardSize === 15 ? 16 : 19 },
          ]}
        >
          {mode === "single" && playerId === 2
            ? "AI Player"
            : PLAYER_STYLES[playerId].name}
        </Text>

        <Text
          style={[
            styles.scoreText,
            { fontSize: boardSize === 15 ? 26 : 32 },
          ]}
        >
          {scores[playerId]}
        </Text>

        <Text style={styles.timerText}>
          {active ? (paused ? "Paused" : `${timeLeft}s`) : "Waiting"}
        </Text>
      </Animated.View>
    );
  }

  function renderStartLabels() {
    return playerCards.map((playerId) => {
      const color = PLAYER_STYLES[playerId].border;
      const label = PLAYER_STYLES[playerId].labelStyle;

      return (
        <Text
          key={playerId}
          style={[
            styles.startLabel,
            styles[label],
            {
              color,
              textShadowColor: color,
              fontSize: boardSize === 15 ? 14 : 18,
            },
          ]}
        >
          P{playerId}
        </Text>
      );
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={async () => {
            await playClickSound();
            await stopGameMusic();
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={32} color="#fff" />
        </TouchableOpacity>

        <Text style={[styles.title, { fontSize: boardSize === 15 ? 28 : 33 }]}>
          Color Blast
        </Text>

        <View style={styles.menuWrapper}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            <Ionicons name="menu" size={36} color="#6B6B6B" />
          </TouchableOpacity>

          {menuOpen && (
            <View style={styles.menuBox}>
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={async () => {
                  await playClickSound();
                  togglePause();
                }}
              >
                <Text style={styles.menuText}>
                  {paused ? "Resume" : "Pause"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restartMenuButton}
                onPress={async () => {
                  await playClickSound();
                  restartGame();
                }}
              >
                <Text style={styles.menuText}>Restart</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.scoreRow}>{topPlayers.map(renderPlayerCard)}</View>

      <Text style={[styles.turnText, { fontSize: boardSize === 15 ? 21 : 25 }]}>
        ✨{" "}
        {mode === "single" && currentPlayer === 2
          ? "AI Player"
          : PLAYER_STYLES[currentPlayer].name}
        's Turn
      </Text>

      <Text style={[styles.roundText, { fontSize: boardSize === 15 ? 19 : 22 }]}>
        {paused ? "Game Paused" : `Rounds Left: ${roundsLeft}`}
      </Text>

      <View style={styles.boardWrapper}>
        {renderStartLabels()}

        <View style={[styles.board, paused && styles.pausedBoard]}>
          {board.map((boardRow, r) => (
            <View key={r} style={styles.boardRow}>
              {boardRow.map((tile, c) => {
                const isActive = tile.activeBy !== null;
                const isCurrentPlayerActive = tile.activeBy === currentPlayer;

                const borderColor =
                  isActive && isCurrentPlayerActive
                    ? blinkAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          "#ffffff",
                          PLAYER_STYLES[tile.activeBy].border,
                        ],
                      })
                    : isActive
                    ? PLAYER_STYLES[tile.activeBy].border
                    : "#ffffff33";

                return (
                  <TouchableOpacity
                    key={`${r}-${c}`}
                    activeOpacity={0.8}
                    disabled={paused}
                    onPress={() => playMove(r, c)}
                  >
                    <Animated.View
                      style={[
                        styles.tile,
                        {
                          width: tileSize,
                          height: tileSize,
                          margin: tileMargin,
                          borderRadius: boardSize === 15 ? 7 : 13,
                          backgroundColor: tile.color,
                          borderColor,
                          borderWidth: isActive ? 4 : 1.5,
                          opacity: paused ? 0.45 : 1,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {paused && (
          <View style={styles.pausedOverlay}>
            <Text style={styles.pausedText}>PAUSED</Text>
          </View>
        )}
      </View>

      {bottomPlayers.length > 0 && (
        <View style={styles.bottomScoreRow}>
          {bottomPlayers.map(renderPlayerCard)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#17002D",
  },
  content: {
    paddingTop: 42,
    paddingHorizontal: 14,
    paddingBottom: 35,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#39214F",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#FFD166",
    fontWeight: "900",
  },
  menuWrapper: {
    position: "relative",
    zIndex: 99,
  },
  menuButton: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  menuBox: {
    position: "absolute",
    top: 70,
    right: 0,
    width: 140,
    backgroundColor: "#2B1740",
    borderRadius: 18,
    padding: 10,
    borderWidth: 2,
    borderColor: "#ffffff44",
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  pauseButton: {
    backgroundColor: "#33C7FF",
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 10,
  },
  restartMenuButton: {
    backgroundColor: "#FF4D6D",
    paddingVertical: 13,
    borderRadius: 14,
  },
  menuText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "900",
  },
  scoreRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  bottomScoreRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
  },
  scoreCard: {
    borderRadius: 24,
    backgroundColor: "#35214A",
    justifyContent: "center",
    alignItems: "center",
    shadowRadius: 15,
    elevation: 10,
  },
  playerName: {
    color: "#fff",
    fontWeight: "900",
  },
  scoreText: {
    color: "#FFD166",
    fontWeight: "900",
  },
  timerText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  turnText: {
    marginTop: 23,
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
  },
  roundText: {
    color: "#FFD166",
    textAlign: "center",
    marginTop: 5,
    fontWeight: "900",
  },
  boardWrapper: {
    marginTop: 21,
    alignSelf: "center",
    position: "relative",
    padding: 4,
  },
  board: {
    backgroundColor: "#2B1740",
    padding: 8,
    borderRadius: 24,
  },
  pausedBoard: {
    borderWidth: 2,
    borderColor: "#FFD166",
  },
  pausedOverlay: {
    position: "absolute",
    top: "43%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pausedText: {
    color: "#FFD166",
    fontSize: 34,
    fontWeight: "900",
    backgroundColor: "#17002DDD",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 18,
  },
  boardRow: {
    flexDirection: "row",
  },
  tile: {},
  startLabel: {
    position: "absolute",
    fontWeight: "900",
    zIndex: 10,
    textShadowRadius: 10,
  },
  p1: {
    top: -8,
    left: 10,
  },
  p2: {
    top: -8,
    right: 10,
  },
  p3: {
    bottom: -8,
    right: 10,
  },
  p4: {
    bottom: -8,
    left: 10,
  },
});
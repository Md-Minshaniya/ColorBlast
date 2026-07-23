import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PLAYER_COLORS = {
  1: "#45C7F3",
  2: "#FF4D8D",
  3: "#15CFA3",
  4: "#FFD166",
};

export default function EndScreen({ navigation, route }) {
  const scores = route?.params?.scores || {};
  const playerNames = route?.params?.playerNames || {};

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(35)).current;
  const trophyScale = useRef(new Animated.Value(0.7)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  const scoreEntries = useMemo(() => {
    return Object.entries(scores)
      .map(([player, score]) => ({
        player: String(player),
        score: Number(score) || 0,
      }))
      .sort((first, second) => second.score - first.score);
  }, [scores]);

  const highestScore =
    scoreEntries.length > 0
      ? Math.max(...scoreEntries.map((entry) => entry.score))
      : 0;

  const winners = scoreEntries
    .filter((entry) => entry.score === highestScore)
    .map((entry) => entry.player);

  const isDraw =
    scoreEntries.length > 1 &&
    winners.length === scoreEntries.length;

  const winnerTitle = useMemo(() => {
    if (scoreEntries.length === 0) {
      return "Match Complete";
    }

    if (isDraw) {
      return "Match Draw";
    }

    if (winners.length === 1) {
      const winnerId = winners[0];

      const winnerName =
        playerNames[winnerId] || `Player ${winnerId}`;

      return `${winnerName} Wins`;
    }

    const names = winners.map(
      (playerId) =>
        playerNames[playerId] || `Player ${playerId}`
    );

    return `${names.join(" & ")} Win`;
  }, [isDraw, playerNames, scoreEntries.length, winners]);

  const resultMessage = useMemo(() => {
    if (scoreEntries.length === 0) {
      return "The match has finished.";
    }

    if (isDraw) {
      return `All players finished with ${highestScore} points.`;
    }

    if (winners.length > 1) {
      return `The winners finished with ${highestScore} points.`;
    }

    return `Winning score: ${highestScore} points`;
  }, [highestScore, isDraw, scoreEntries.length, winners.length]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.spring(cardTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),

      Animated.spring(trophyScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),

        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [
    cardTranslateY,
    pulseValue,
    screenOpacity,
    trophyScale,
  ]);

  function getPlayerName(playerId) {
    return playerNames[playerId] || `Player ${playerId}`;
  }

  function isWinner(playerId) {
    return winners.includes(String(playerId));
  }

  function goHome() {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  }

  function restartGame() {
    navigation.reset({
      index: 0,
      routes: [{ name: "Mode" }],
    });
  }

  const glowScale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const glowOpacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.75],
  });

  return (
    <ImageBackground
      source={require("../../assets/color-blast-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              style={[
                styles.resultCard,
                {
                  opacity: screenOpacity,
                  transform: [
                    {
                      translateY: cardTranslateY,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.topAccentRow}>
                <View
                  style={[
                    styles.accentDot,
                    {
                      backgroundColor: "#FF4D8D",
                    },
                  ]}
                />

                <View
                  style={[
                    styles.accentDot,
                    {
                      backgroundColor: "#45C7F3",
                    },
                  ]}
                />

                <View
                  style={[
                    styles.accentDot,
                    {
                      backgroundColor: "#15CFA3",
                    },
                  ]}
                />

                <View
                  style={[
                    styles.accentDot,
                    {
                      backgroundColor: "#FFD166",
                    },
                  ]}
                />
              </View>

              <View style={styles.matchBadge}>
                <Ionicons
                  name="flag"
                  size={14}
                  color="#17002D"
                />

                <Text style={styles.matchBadgeText}>
                  MATCH RESULT
                </Text>
              </View>

              <View style={styles.heroSection}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.trophyGlow,
                    {
                      opacity: glowOpacity,
                      transform: [
                        {
                          scale: glowScale,
                        },
                      ],
                    },
                  ]}
                />

                <Animated.View
                  style={[
                    styles.trophyCircle,
                    {
                      transform: [
                        {
                          scale: trophyScale,
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons
                    name={isDraw ? "people" : "trophy"}
                    size={48}
                    color="#17002D"
                  />
                </Animated.View>

                <Text style={styles.gameOverLabel}>
                  GAME OVER
                </Text>

                <Text style={styles.winnerTitle}>
                  {winnerTitle}
                </Text>

                <Text style={styles.resultMessage}>
                  {resultMessage}
                </Text>
              </View>

              <View style={styles.scoreboardCard}>
                <View style={styles.scoreboardHeader}>
                  <View>
                    <Text style={styles.scoreboardTitle}>
                      Final Scoreboard
                    </Text>

                    <Text style={styles.scoreboardSubtitle}>
                      Player rankings and final scores
                    </Text>
                  </View>

                  <View style={styles.playerCountBadge}>
                    <Ionicons
                      name="people"
                      size={17}
                      color="#FFFFFF"
                    />

                    <Text style={styles.playerCountText}>
                      {scoreEntries.length}
                    </Text>
                  </View>
                </View>

                <View style={styles.scoreList}>
                  {scoreEntries.length > 0 ? (
                    scoreEntries.map((entry, index) => {
                      const playerColor =
                        PLAYER_COLORS[entry.player] ||
                        "#9B5DE5";

                      const playerIsWinner = isWinner(
                        entry.player
                      );

                      return (
                        <View
                          key={entry.player}
                          style={[
                            styles.scoreRow,
                            playerIsWinner &&
                              styles.winnerRow,
                          ]}
                        >
                          <View
                            style={[
                              styles.rankBox,
                              {
                                backgroundColor:
                                  playerColor,
                              },
                            ]}
                          >
                            <Text style={styles.rankText}>
                              {index + 1}
                            </Text>
                          </View>

                          <View style={styles.playerInfo}>
                            <View
                              style={styles.playerNameRow}
                            >
                              <Text
                                style={styles.playerName}
                                numberOfLines={1}
                              >
                                {getPlayerName(
                                  entry.player
                                )}
                              </Text>

                              {playerIsWinner && (
                                <View
                                  style={styles.winnerBadge}
                                >
                                  <Ionicons
                                    name="trophy"
                                    size={12}
                                    color="#17002D"
                                  />

                                  <Text
                                    style={
                                      styles.winnerBadgeText
                                    }
                                  >
                                    WINNER
                                  </Text>
                                </View>
                              )}
                            </View>

                            <Text style={styles.positionText}>
                              {index === 0
                                ? "Top performer"
                                : `Rank ${index + 1}`}
                            </Text>
                          </View>

                          <View style={styles.scoreArea}>
                            <Text
                              style={[
                                styles.scoreValue,
                                playerIsWinner && {
                                  color: "#FFD166",
                                },
                              ]}
                            >
                              {entry.score}
                            </Text>

                            <Text style={styles.pointsText}>
                              POINTS
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons
                        name="information-circle-outline"
                        size={30}
                        color="#FFD166"
                      />

                      <Text style={styles.emptyStateText}>
                        Score information is unavailable.
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.playAgainButton}
                  onPress={restartGame}
                  activeOpacity={0.84}
                >
                  <View style={styles.playAgainIcon}>
                    <Ionicons
                      name="refresh"
                      size={26}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.buttonTextArea}>
                    <Text style={styles.playAgainText}>
                      Play Again
                    </Text>

                    <Text
                      style={styles.playAgainDescription}
                    >
                      Start a new Color Blast match
                    </Text>
                  </View>

                  <Ionicons
                    name="arrow-forward-circle"
                    size={30}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.homeButton}
                  onPress={goHome}
                  activeOpacity={0.84}
                >
                  <View style={styles.homeIcon}>
                    <Ionicons
                      name="home"
                      size={25}
                      color="#17002D"
                    />
                  </View>

                  <View style={styles.buttonTextArea}>
                    <Text style={styles.homeButtonText}>
                      Return to Home
                    </Text>

                    <Text
                      style={styles.homeButtonDescription}
                    >
                      Go back to the main screen
                    </Text>
                  </View>

                  <Ionicons
                    name="arrow-forward-circle"
                    size={30}
                    color="#17002D"
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>

            <View style={styles.footerBadge}>
              <View
                style={[
                  styles.footerDot,
                  {
                    backgroundColor: "#45C7F3",
                  },
                ]}
              />

              <Text style={styles.footerText}>
                COLOR BLAST
              </Text>

              <View
                style={[
                  styles.footerDot,
                  {
                    backgroundColor: "#FF4D8D",
                  },
                ]}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  backgroundOverlay: {
    flex: 1,
    backgroundColor: "rgba(12, 0, 28, 0.76)",
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 28,
  },

  resultCard: {
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    backgroundColor: "rgba(33, 14, 55, 0.97)",
    borderRadius: 32,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 22,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.18)",
    shadowColor: "#000000",
    shadowOpacity: 0.65,
    shadowRadius: 26,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    elevation: 20,
    overflow: "hidden",
  },

  topAccentRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    flexDirection: "row",
  },

  accentDot: {
    flex: 1,
  },

  matchBadge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFD166",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#2B1740",
  },

  matchBadgeText: {
    color: "#17002D",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },

  heroSection: {
    alignItems: "center",
    marginTop: 20,
  },

  trophyGlow: {
    position: "absolute",
    top: -7,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#FFD166",
  },

  trophyCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD166",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.82)",
    shadowColor: "#FFD166",
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },

  gameOverLabel: {
    color: "#45C7F3",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 5,
    marginTop: 18,
  },

  winnerTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 7,
  },

  resultMessage: {
    color: "#E4D8EC",
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 7,
  },

  scoreboardCard: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderRadius: 25,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  scoreboardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
    paddingHorizontal: 3,
  },

  scoreboardTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  scoreboardSubtitle: {
    color: "#B7A8C4",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  playerCountBadge: {
    minWidth: 52,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: 16,
    backgroundColor: "#9B5DE5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  playerCountText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  scoreList: {
    gap: 10,
  },

  scoreRow: {
    minHeight: 76,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  winnerRow: {
    backgroundColor: "rgba(255, 209, 102, 0.14)",
    borderWidth: 1.5,
    borderColor: "#FFD166",
  },

  rankBox: {
    width: 47,
    height: 47,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },

  rankText: {
    color: "#17002D",
    fontSize: 19,
    fontWeight: "900",
  },

  playerInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  playerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  playerName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    maxWidth: 145,
  },

  winnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFD166",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  winnerBadgeText: {
    color: "#17002D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  positionText: {
    color: "#B7A8C4",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  scoreArea: {
    alignItems: "flex-end",
  },

  scoreValue: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
  },

  pointsText: {
    color: "#B7A8C4",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  emptyState: {
    minHeight: 100,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },

  emptyStateText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },

  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },

  playAgainButton: {
    minHeight: 72,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4D8D",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },

  playAgainIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonTextArea: {
    flex: 1,
    marginLeft: 12,
  },

  playAgainText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  playAgainDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  homeButton: {
    minHeight: 72,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#45C7F3",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#45C7F3",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },

  homeIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },

  homeButtonText: {
    color: "#17002D",
    fontSize: 19,
    fontWeight: "900",
  },

  homeButtonDescription: {
    color: "rgba(23,0,45,0.68)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  footerBadge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 17,
  },

  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  footerText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 3,
  },
});
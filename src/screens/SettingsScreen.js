import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

let GAME_SETTINGS = {
  boardSize: 7,
  rounds: 18,
};

export function getGameSettings() {
  return GAME_SETTINGS;
}

export default function SettingsScreen({ navigation }) {
  const [boardSize, setBoardSize] = useState(
    GAME_SETTINGS.boardSize
  );

  const [rounds, setRounds] = useState(
    GAME_SETTINGS.rounds
  );

  function selectBoardSize(size) {
    GAME_SETTINGS.boardSize = size;
    setBoardSize(size);
  }

  function selectRounds(value) {
    GAME_SETTINGS.rounds = value;
    setRounds(value);
  }

  function goBack() {
    navigation.goBack();
  }

  return (
    <ImageBackground
      source={require("../../assets/color-blast-bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.topBackButton}
          onPress={goBack}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={34}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>⚙️ Settings</Text>

          <Text style={styles.instruction}>
            Select the board size and number of rounds before
            starting the game.
          </Text>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>
              🎮 Select Board Size
            </Text>

            <View style={styles.optionRow}>
              {[7, 10, 15].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.boardOption,
                    boardSize === size &&
                      styles.selectedBoard,
                  ]}
                  onPress={() => selectBoardSize(size)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.optionText,
                      boardSize === size &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {size} × {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.currentSelectionBox}>
              <Ionicons
                name="grid-outline"
                size={20}
                color="#FFD166"
              />

              <Text style={styles.selectedInfo}>
                Current Board: {boardSize} × {boardSize}
              </Text>
            </View>
          </View>

          <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>
              🔄 Select Rounds
            </Text>

            <View style={styles.optionRow}>
              {[10, 18, 25, 35].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.roundOption,
                    rounds === value &&
                      styles.selectedRound,
                  ]}
                  onPress={() => selectRounds(value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.optionText,
                      rounds === value &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.currentSelectionBox}>
              <Ionicons
                name="repeat-outline"
                size={21}
                color="#FFD166"
              />

              <Text style={styles.selectedInfo}>
                Current Rounds: {rounds}
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoTitleRow}>
              <Ionicons
                name="bulb"
                size={27}
                color="#FFD166"
              />

              <Text style={styles.infoTitle}>
                Game Rules
              </Text>
            </View>

            <View style={styles.ruleRow}>
              <View
                style={[
                  styles.ruleNumber,
                  {
                    backgroundColor: "#45C7F3",
                  },
                ]}
              >
                <Text style={styles.ruleNumberText}>
                  1
                </Text>
              </View>

              <Text style={styles.infoText}>
                Select tiles only near your blinking tiles.
              </Text>
            </View>

            <View style={styles.ruleRow}>
              <View
                style={[
                  styles.ruleNumber,
                  {
                    backgroundColor: "#FF4D8D",
                  },
                ]}
              >
                <Text style={styles.ruleNumberText}>
                  2
                </Text>
              </View>

              <Text style={styles.infoText}>
                Same-colored connected tiles become yours.
              </Text>
            </View>

            <View style={styles.ruleRow}>
              <View
                style={[
                  styles.ruleNumber,
                  {
                    backgroundColor: "#15CFA3",
                  },
                ]}
              >
                <Text style={styles.ruleNumberText}>
                  3
                </Text>
              </View>

              <Text style={styles.infoText}>
                Previous active tiles change into random colors.
              </Text>
            </View>

            <View style={styles.ruleRow}>
              <View
                style={[
                  styles.ruleNumber,
                  {
                    backgroundColor: "#FFD166",
                  },
                ]}
              >
                <Text style={styles.ruleNumberText}>
                  4
                </Text>
              </View>

              <Text style={styles.infoText}>
                The player with the highest score at the end wins.
              </Text>
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: "rgba(23,0,45,0.66)",
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingTop: 35,
    paddingBottom: 35,
  },

  topBackButton: {
    position: "absolute",
    top: 42,
    left: 18,
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#39214F",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
    borderWidth: 2,
    borderColor: "#FFD166",
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 8,
  },

  title: {
    color: "#FFD166",
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 35,
    textShadowColor: "#FF4FD8",
    textShadowRadius: 15,
  },

  instruction: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 26,
    paddingHorizontal: 10,
  },

  sectionBox: {
    backgroundColor: "rgba(43,23,64,0.96)",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "rgba(255,209,102,0.75)",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 8,
  },

  sectionTitle: {
    color: "#45C7F3",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 15,
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },

  boardOption: {
    minWidth: 82,
    backgroundColor: "#45C7F3",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
  },

  roundOption: {
    minWidth: 67,
    backgroundColor: "#FF4D8D",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
  },

  selectedBoard: {
    backgroundColor: "#FFD166",
    borderColor: "#FFFFFF",
    transform: [
      {
        scale: 1.06,
      },
    ],
    shadowColor: "#FFD166",
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 8,
  },

  selectedRound: {
    backgroundColor: "#15CFA3",
    borderColor: "#FFD166",
    transform: [
      {
        scale: 1.06,
      },
    ],
    shadowColor: "#15CFA3",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 8,
  },

  optionText: {
    color: "#17002D",
    fontSize: 20,
    fontWeight: "900",
  },

  selectedOptionText: {
    color: "#17002D",
  },

  currentSelectionBox: {
    marginTop: 16,
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  selectedInfo: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },

  infoBox: {
    backgroundColor: "rgba(43,23,64,0.96)",
    borderRadius: 25,
    padding: 20,
    marginBottom: 35,
    borderWidth: 2,
    borderColor: "#45C7F3",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 8,
  },

  infoTitleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },

  infoTitle: {
    color: "#FFD166",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },

  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },

  ruleNumber: {
    width: 32,
    height: 32,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
    marginTop: 1,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.75)",
  },

  ruleNumberText: {
    color: "#17002D",
    fontSize: 15,
    fontWeight: "900",
  },

  infoText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "700",
  },
});
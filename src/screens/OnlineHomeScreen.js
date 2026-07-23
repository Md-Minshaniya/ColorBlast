import React from "react";

import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function OnlineHomeScreen({
  navigation,
}) {
  function goToHome() {
    navigation.navigate("Home");
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
            🌐 Online Battle
          </Text>

          <Text style={styles.subtitle}>
            Create a room or join using a room code
          </Text>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() =>
              navigation.navigate("CreateRoom")
            }
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              ➕ Create Room
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={() =>
              navigation.navigate("JoinRoom")
            }
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              🔑 Join Room
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={goToHome}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              🏠 Go Home
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
    backgroundColor: "rgba(43,23,64,0.88)",
    borderRadius: 34,
    padding: 24,
    borderWidth: 3,
    borderColor: "#FFD166",
  },

  title: {
    color: "#FFD166",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 30,
  },

  createButton: {
    backgroundColor: "#15CFA3",
    paddingVertical: 20,
    borderRadius: 25,
    marginBottom: 18,
  },

  joinButton: {
    backgroundColor: "#45C7F3",
    paddingVertical: 20,
    borderRadius: 25,
    marginBottom: 18,
  },

  homeButton: {
    backgroundColor: "#FF4D8D",
    paddingVertical: 20,
    borderRadius: 25,
  },

  buttonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
});
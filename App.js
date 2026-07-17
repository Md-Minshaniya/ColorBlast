import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import AuthScreen from "./src/screens/AuthScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import ProfileSetupScreen from "./src/screens/ProfileSetupScreen";

import LoadingScreen from "./src/screens/LoadingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ModeScreen from "./src/screens/ModeScreen";
import PlayerCountScreen from "./src/screens/PlayerCountScreen";
import GameScreen from "./src/screens/GameScreen";
import EndScreen from "./src/screens/EndScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

import OnlineHomeScreen from "./src/screens/OnlineHomeScreen";
import CreateRoomScreen from "./src/screens/CreateRoomScreen";
import JoinRoomScreen from "./src/screens/JoinRoomScreen";
import OnlineWaitingScreen from "./src/screens/OnlineWaitingScreen";
import OnlineGameScreen from "./src/screens/OnlineGameScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />

      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />

        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Mode" component={ModeScreen} />
        <Stack.Screen name="PlayerCount" component={PlayerCountScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="End" component={EndScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />

        <Stack.Screen name="OnlineHome" component={OnlineHomeScreen} />
        <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
        <Stack.Screen name="JoinRoom" component={JoinRoomScreen} />
        <Stack.Screen name="OnlineWaiting" component={OnlineWaitingScreen} />
        <Stack.Screen name="OnlineGame" component={OnlineGameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
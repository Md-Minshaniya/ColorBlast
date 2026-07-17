import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveUserSession(user) {
  await AsyncStorage.setItem("colorBlastUser", JSON.stringify(user));
}

export async function getUserSession() {
  const data = await AsyncStorage.getItem("colorBlastUser");
  return data ? JSON.parse(data) : null;
}

export async function clearUserSession() {
  await AsyncStorage.removeItem("colorBlastUser");
}
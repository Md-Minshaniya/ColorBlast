import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_UID_KEY = "colorBlastGuestUid";
const PLAYER_NAME_KEY = "colorBlastPlayerName";
const PLAYER_AVATAR_KEY = "colorBlastPlayerAvatar";

function generateGuestId() {
  return `guest_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function generateGuestName() {
  const number = Math.floor(1000 + Math.random() * 9000);
  return `Player ${number}`;
}

export async function getGuestPlayer() {
  let uid = await AsyncStorage.getItem(GUEST_UID_KEY);
  let name = await AsyncStorage.getItem(PLAYER_NAME_KEY);
  let avatar = await AsyncStorage.getItem(PLAYER_AVATAR_KEY);

  if (!uid) {
    uid = generateGuestId();
    await AsyncStorage.setItem(GUEST_UID_KEY, uid);
  }

  if (!name || !name.trim()) {
    name = generateGuestName();
    await AsyncStorage.setItem(PLAYER_NAME_KEY, name);
  }

  if (!avatar) {
    avatar = "🎮";
    await AsyncStorage.setItem(PLAYER_AVATAR_KEY, avatar);
  }

  return {
    uid,
    name: name.trim(),
    avatar,
  };
}

export async function updateGuestPlayer({
  name,
  avatar,
}) {
  if (name && name.trim()) {
    await AsyncStorage.setItem(
      PLAYER_NAME_KEY,
      name.trim()
    );
  }

  if (avatar) {
    await AsyncStorage.setItem(
      PLAYER_AVATAR_KEY,
      avatar
    );
  }

  return getGuestPlayer();
}

export async function clearGuestPlayer() {
  await AsyncStorage.multiRemove([
    GUEST_UID_KEY,
    PLAYER_NAME_KEY,
    PLAYER_AVATAR_KEY,
  ]);
}

/*
  Compatibility functions.

  These prevent old imports from crashing while you remove
  authentication from the remaining project files.
*/

export async function getUserSession() {
  return getGuestPlayer();
}

export async function saveUserSession(user) {
  if (!user) {
    return;
  }

  if (user.uid) {
    await AsyncStorage.setItem(
      GUEST_UID_KEY,
      String(user.uid)
    );
  }

  if (user.name && user.name.trim()) {
    await AsyncStorage.setItem(
      PLAYER_NAME_KEY,
      user.name.trim()
    );
  }

  if (user.avatar) {
    await AsyncStorage.setItem(
      PLAYER_AVATAR_KEY,
      user.avatar
    );
  }
}

export async function clearUserSession() {
  await clearGuestPlayer();
}
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAR-EXFfhrG9Xt80K9ixR6pEyP4lI9WJyw",
  authDomain: "colorblastgame.firebaseapp.com",
  databaseURL: "https://colorblastgame-default-rtdb.firebaseio.com",
  projectId: "colorblastgame",
  storageBucket: "colorblastgame.firebasestorage.app",
  messagingSenderId: "1026884260615",
  appId: "1:1026884260615:web:e951b1f7fae883073faba2"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const FIREBASE_API_KEY = firebaseConfig.apiKey;
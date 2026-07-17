# Color Blast - React Native Expo Game

## Features
- Loading page
- Home page
- Mode selection: Single Player and Multiplayer
- Multiplayer: 2, 3, or 4 players
- Game page with colorful board, score cards, turn display, settings button
- AI opponent in single-player mode
- Game end page with winner, scores, claim text, restart

## Run on phone
```bash
npm install
npm start
```
Scan the QR code with Expo Go.

## Build APK for testing
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

## Build AAB for Play Store
```bash
eas build -p android --profile production
```
Upload the generated `.aab` file to Google Play Console.

## Important before Play Store upload
Change Android package name in `app.json` if needed:
```json
"package": "com.minish4279niya.colorblast"
```
Use your own app icon and splash images in the `assets` folder.

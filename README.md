# Wellness App – Breath Garden

A meditation and breathing practice app with **Streak + Garden** gamification. Designed with a calming, HeartMath-inspired aesthetic (teal/indigo/purple gradients, glassmorphism, orange accents).

## Features

- **Breath Garden** – Streak + plant growth gamification
- **Practice stats** – Sessions, minutes, coherence points
- **Practice streaks** – Current and longest streak
- **4-7-8 breathing** – Inhale 4s, hold 7s, exhale 8s
- **Bottom tab navigation** – Tap **Play** to open the game

## Prerequisites

- Node.js 18+ (recommended LTS)
- npm
- Expo Go app on your phone or Android/iOS emulator

## Install and Run

### 1) Clone and install

```bash
git clone <your-repo-url>
cd wellness-app
npm install
```

### 2) Run the app

```bash
npm start
```

Then in the Expo terminal:
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Press `w` for web

You can also run directly:

```bash
npm run android
npm run ios
npm run web
```

If this is your first time setting up the project, run the commands in order.

## Project structure

```
wellness-app/
├── App.js                 # Tab nav, Play opens Breath Garden
├── src/
│   ├── theme.js           # HeartMath design system
│   ├── context/
│   │   └── BreathGardenContext.js
│   └── screens/
│       ├── HomeScreen.js
│       ├── BreathGardenScreen.js
│       └── BreathExerciseScreen.js
└── README.md
```

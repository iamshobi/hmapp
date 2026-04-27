## Features

### My Progress (bottom tab)

- **My Journey** – phase path from *First Step* → *Seed* → *Habit* → *Deep Practice*, with short prompts based on how many sessions you have completed
- **Practice snapshot** – coherence score, **coherence points**, **sessions completed**, **average session length**, and **current streak**
- **Milestone card** – encouragement tied to your session count, with shortcuts to **Measure** when you are just starting or building momentum
- **Survey shifts** – after multiple sessions with pre/post check-ins, see how **stress**, **energy**, and **mood** change from before to after practice
- **Trends · Check-ins · Notes** – available after enough sessions and survey responses: **Trends** (stress, energy, mood, coherence over time), **Check-ins** (calendar view of your journey), **Notes** (session notes with Today / Week / Month filters and swipe to edit or delete)
- **Community Coherence Points** – community totals for the day and “highest day ever” (display)
- **Share My Progress** – native share sheet with sessions, streak, and coherence points


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
├── App.js                       # Bottom tabs: Home, Learn, Measure, Play, My Progress
├── src/
│   ├── theme.js                 # Design tokens
│   ├── context/
│   │   └── BreathGardenContext.js
│   └── screens/
│       ├── ProgressMainScreen.js   # My Progress hub
│       └── …
└── README.md
```

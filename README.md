# CricTalk 🏏

A cricket-focused social mobile application built with **React Native (Expo)** and **Appwrite**, where fans can discuss matches, join live match rooms, and compete on a community leaderboard.

---

## Features

- **Posts Feed** – Browse, search, and create cricket discussion posts. Pull-to-refresh, infinite scroll, and view tracking included.
- **Match Rooms** – Join or create rooms tied to cricket matches. Filter rooms by status: *All*, *Live*, *Upcoming*, or *Finished*.
- **Comments** – Engage in threaded discussions on any post.
- **Leaderboard** – See the top contributors ranked by message count, with a podium view for the top 3.
- **Notifications** – Push notification support via Expo Notifications.
- **Profile & Settings** – Manage your account, login/security preferences, and app preferences.
- **Authentication** – Email/password sign-up and login powered by Appwrite Auth.

---

## Tech Stack

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo%20Router-000020?style=for-the-badge&logo=expo&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge)
![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)
![Legend List](https://img.shields.io/badge/Legend%20List-000000?style=for-the-badge)

---

## Project Structure

```
cric-talk/
├── app/
│   ├── (auth)/          # Login & Signup screens
│   ├── (tabs)/          # Bottom tab screens: Home, Rooms, Leaderboard
│   ├── (posts)/         # Post detail screen
│   ├── (rooms)/         # Room detail & management screens
│   ├── (profile)/       # Profile, Settings, Account screens
│   ├── (notifications)/ # Notifications screen
│   └── components/      # Shared UI components
├── services/            # Appwrite service calls (posts, rooms, auth, etc.)
├── store/               # Zustand global state stores
├── hooks/               # Custom React hooks
├── interfaces/          # TypeScript interfaces
├── schemas/             # Zod validation schemas
├── libs/                # Appwrite client & utility helpers
├── utils/               # Miscellaneous utilities
└── assets/              # Images, fonts, icons
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- An [Appwrite](https://appwrite.io) project with the required collections and functions (see `.env.example`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/swapnasahoo/cric-talk.git
cd cric-talk

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and fill in your Appwrite credentials
```

### Environment Variables

Copy `.env.example` to `.env.local` and provide the following values:

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_APPWRITE_API_ENDPOINT` | Your Appwrite API endpoint |
| `EXPO_PUBLIC_APPWRITE_PROJECT_ID` | Your Appwrite project ID |
| `EXPO_PUBLIC_APPWRITE_CRIC_TALK_DATABASE_ID` | Database ID |
| `EXPO_PUBLIC_APPWRITE_POSTS_TABLE_ID` | Posts collection ID |
| `EXPO_PUBLIC_APPWRITE_POSTS_GUARD_FUNCTION_ID` | Posts guard function ID |
| `EXPO_PUBLIC_APPWRITE_COMMENTS_TABLE_ID` | Comments collection ID |
| `EXPO_PUBLIC_APPWRITE_COMMENTS_GUARD_FUNCTION_ID` | Comments guard function ID |
| `EXPO_PUBLIC_APPWRITE_ROOMS_TABLE_ID` | Rooms collection ID |
| `EXPO_PUBLIC_APPWRITE_ROOMS_GUARD_FUNCTION_ID` | Rooms guard function ID |
| `EXPO_PUBLIC_APPWRITE_ROOM_MESSAGE_TABLE_ID` | Room messages collection ID |
| `EXPO_PUBLIC_APPWRITE_ROOM_MESSAGE_GUARD_FUNCTION_ID` | Room messages guard function ID |
| `EXPO_PUBLIC_APPWRITE_USERS_TABLE_ID` | Users collection ID |
| `EXPO_PUBLIC_APPWRITE_USER_PUSH_TOKEN_GUARD_FUNCTION_ID` | Push token guard function ID |
| `EXPO_PUBLIC_APPWRITE_LEADERBOARD_GUARD_FUNCTION_ID` | Leaderboard guard function ID |
| `EXPO_PUBLIC_NOTIFICATIONS_GUARD_FUNCTION_ID` | Notifications guard function ID |

### Running the App

```bash
# Start the Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Linting

```bash
npm run lint
```

---

## Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for production builds. See `eas.json` for build profiles.

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

---

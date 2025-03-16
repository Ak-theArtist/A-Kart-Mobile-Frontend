# A-Kart Mobile

A React Native mobile application for the A-Kart e-commerce platform.

## Features

- User authentication (login/register)
- Browse products by category
- View product details
- Add products to cart
- Manage cart items
- User profile management
- Admin dashboard (for admin users)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Frontend-Mobile
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

4. Run on a device or emulator:

- Press `a` to run on Android emulator
- Press `i` to run on iOS simulator (macOS only)
- Scan the QR code with the Expo Go app on your physical device

## Environment Variables

The app uses the following environment variables:

- `EXPO_PUBLIC_API_URL`: The URL of the backend API

Create a `.env` file in the root directory with the following content:

```
EXPO_PUBLIC_API_URL=https://a-kart-backend.onrender.com
```

## Project Structure

- `src/components`: Reusable UI components
- `src/context`: Context providers for state management
- `src/navigation`: Navigation configuration
- `src/screens`: Screen components
- `src/utils`: Utility functions and API configuration
- `assets`: Static assets like images and fonts

## Backend API

This mobile app connects to the same backend API as the web version of A-Kart. The API is hosted at:

```
https://a-kart-backend.onrender.com
```

## License

MIT

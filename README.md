# Real-Time Chat Application

A sleek, real-time chat application built with Node.js, Express, and Socket.IO. It allows users to join chat rooms, send instant messages, and see when other users join or leave.

## Features
- **Real-Time Messaging:** Instant, bi-directional communication using WebSockets (Socket.IO).
- **User Accounts:** Simple in-memory session-based username registration.
- **Chat Rooms:** Ability to dynamically create or join different topic-based rooms (e.g., 'General', 'Tech Talk').
- **Presence Indicators:** System notifications when users join or leave a room.
- **Modern UI:** Premium vanilla CSS styling with glassmorphism, responsive design, and smooth animations.

## Tech Stack
- **Backend:** Node.js, Express.js, Socket.IO
- **Frontend:** Vanilla HTML, CSS, JavaScript

## Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.

## How to Run Locally

1. Clone or download this repository.
2. Navigate to the project directory in your terminal:
   ```bash
   cd chat-app
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   # or
   node server.js
   ```
5. Open your web browser and go to `http://localhost:3000`.

To test the real-time features, open multiple tabs or a separate incognito window, log in with different usernames, and join the same room!

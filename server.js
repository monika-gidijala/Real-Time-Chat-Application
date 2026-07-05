const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store for simple state management
const users = new Map(); // socket.id -> { username, currentRoom }
const rooms = new Set(); // Set of room names
// Let's create some default rooms
rooms.add('General');
rooms.add('Tech Talk');
rooms.add('Random');

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user login (setting a username)
    socket.on('login', (username, callback) => {
        // Simple check if username is already taken (very basic)
        let isTaken = false;
        for (const user of users.values()) {
            if (user.username.toLowerCase() === username.toLowerCase()) {
                isTaken = true;
                break;
            }
        }

        if (isTaken) {
            callback({ success: false, message: 'Username is already taken' });
        } else {
            users.set(socket.id, { username, currentRoom: null });
            callback({ success: true, rooms: Array.from(rooms) });
            console.log(`User logged in: ${username}`);
        }
    });

    // Handle joining a room
    socket.on('joinRoom', (roomName, callback) => {
        const user = users.get(socket.id);
        if (!user) return; // User must be logged in

        // Leave current room if in one
        if (user.currentRoom) {
            socket.leave(user.currentRoom);
            // Notify old room
            io.to(user.currentRoom).emit('systemMessage', {
                text: `${user.username} has left the room.`,
                time: new Date().toLocaleTimeString()
            });
        }

        // Add room if it doesn't exist
        rooms.add(roomName);
        
        socket.join(roomName);
        user.currentRoom = roomName;
        
        // Notify new room
        socket.to(roomName).emit('systemMessage', {
            text: `${user.username} has joined the room.`,
            time: new Date().toLocaleTimeString()
        });

        // Broadcast updated room list to everyone (in case a new room was created)
        io.emit('roomsList', Array.from(rooms));

        callback({ success: true, roomName });
    });

    // Handle incoming chat messages
    socket.on('chatMessage', (text) => {
        const user = users.get(socket.id);
        if (!user || !user.currentRoom) return;

        const message = {
            sender: user.username,
            text: text,
            time: new Date().toLocaleTimeString()
        };

        // Broadcast to the specific room
        io.to(user.currentRoom).emit('message', message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            if (user.currentRoom) {
                io.to(user.currentRoom).emit('systemMessage', {
                    text: `${user.username} has disconnected.`,
                    time: new Date().toLocaleTimeString()
                });
            }
            users.delete(socket.id);
            console.log(`User disconnected: ${user.username}`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

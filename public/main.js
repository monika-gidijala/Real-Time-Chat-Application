const socket = io();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatDashboard = document.getElementById('chat-dashboard');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const loginError = document.getElementById('login-error');

const roomsListEl = document.getElementById('rooms-list');
const createRoomForm = document.getElementById('create-room-form');
const newRoomInput = document.getElementById('new-room-input');
const currentUserDisplay = document.getElementById('current-user-display');

const chatHeaderName = document.getElementById('current-room-name');
const messagesContainer = document.getElementById('messages-container');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let currentUsername = '';
let currentRoom = '';

// --- Login Logic ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (!username) return;

    socket.emit('login', username, (response) => {
        if (response.success) {
            currentUsername = username;
            currentUserDisplay.textContent = `👤 ${username}`;
            
            // Switch screens
            loginScreen.classList.remove('active');
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                chatDashboard.classList.remove('hidden');
                setTimeout(() => chatDashboard.classList.add('active'), 50);
            }, 500);

            // Populate rooms
            updateRoomsList(response.rooms);
        } else {
            loginError.textContent = response.message;
        }
    });
});

// --- Room Logic ---
function updateRoomsList(rooms) {
    roomsListEl.innerHTML = '';
    rooms.forEach(room => {
        const li = document.createElement('li');
        li.textContent = room;
        if (room === currentRoom) {
            li.classList.add('active');
        }
        li.addEventListener('click', () => joinRoom(room));
        roomsListEl.appendChild(li);
    });
}

function joinRoom(roomName) {
    if (roomName === currentRoom) return;

    socket.emit('joinRoom', roomName, (response) => {
        if (response.success) {
            currentRoom = roomName;
            chatHeaderName.textContent = `Room: ${roomName}`;
            messagesContainer.innerHTML = ''; // Clear old messages
            messageInput.disabled = false;
            sendBtn.disabled = false;
            
            // Update active styling in sidebar
            Array.from(roomsListEl.children).forEach(li => {
                if (li.textContent === roomName) {
                    li.classList.add('active');
                } else {
                    li.classList.remove('active');
                }
            });
        }
    });
}

createRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newRoom = newRoomInput.value.trim();
    if (newRoom) {
        joinRoom(newRoom);
        newRoomInput.value = '';
    }
});

socket.on('roomsList', (rooms) => {
    if (currentUsername) {
        updateRoomsList(rooms);
    }
});

// --- Messaging Logic ---
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = messageInput.value.trim();
    if (!msg) return;

    socket.emit('chatMessage', msg);
    messageInput.value = '';
    messageInput.focus();
});

socket.on('message', (message) => {
    const isSelf = message.sender === currentUsername;
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(isSelf ? 'self' : 'other');

    msgDiv.innerHTML = `
        <div class="message-meta">
            <span>${isSelf ? 'You' : message.sender}</span>
            <span>${message.time}</span>
        </div>
        <div class="message-bubble">${message.text}</div>
    `;

    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
});

socket.on('systemMessage', (message) => {
    const sysDiv = document.createElement('div');
    sysDiv.classList.add('system-message');
    sysDiv.textContent = `${message.text} (${message.time})`;
    messagesContainer.appendChild(sysDiv);
    scrollToBottom();
});

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

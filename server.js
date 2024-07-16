const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3001;


let chats = [
  { id: '1', name: 'General Chat', creator: '12345', messages: [
    {id: '1231',text: 'tertert',timestamp: 'Tue Jul 16 2024 12:42:13 GMT+0300',sender: '12345'}
    ]},
  { id: '2', name: 'Random Chat1', creator: '67890', messages: [] },
  { id: '3', name: 'Random Chat2', creator: '67891', messages: [{id: '243423',text: 'tertert',timestamp: 'Tue Jul 16 2024 11:22:13 GMT+0300',sender: '12345'},{id: '423432',text: 'tertert',timestamp: 'Tue Jul 16 2024 12:42:13 GMT+0300',sender: 'user11'}] },
];


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('fetchChats', () => {
    socket.emit('chats', chats);
  });

  socket.on('createChat', (newChat) => {
    const chat = { ...newChat, id: `${Date.now()}`, messages: [] };
    chats.push(chat);
    io.emit('newChat', chat);
  });

  socket.on('deleteChat', ({ chatId, userId }) => {
    const chatIndex = chats.findIndex(chat => chat.id === chatId && chat.creator === userId);
    if (chatIndex !== -1) {
      chats.splice(chatIndex, 1);
      io.emit('deletedChat', chatId);
    }
  });

  socket.on('sendMessage', ({ chatId, message }) => {
    const chat = chats.find(chat => chat.id === chatId);
    if (chat) {
      chat.messages.push(message);
      io.emit('message', message);
    }
  });

  socket.on('searchChats', (searchTerm) => {
    const filteredChats = chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()));
    socket.emit('chats', filteredChats);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

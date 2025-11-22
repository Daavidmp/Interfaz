// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let deadBox = []; // lista compartida de caídos
let globalState = {
  cartaActiva: { tipo: 'Ninguno', origen: 'Nadie', destino: 'Nadie', descripcion: 'No hay retos asignados.' },
  muertes: {}
};

io.on('connection', (socket) => {
  console.log('cliente conectado', socket.id);
  // enviar estado actual al nuevo cliente
  socket.emit('deadbox:update', deadBox);
  socket.emit('state:update', globalState);

  socket.on('deadbox:add', (entry) => {
    deadBox.unshift(entry);
    deadBox = deadBox.slice(0, 100);
    io.emit('deadbox:update', deadBox);
  });

  socket.on('state:set', (partial) => {
    globalState = { ...globalState, ...partial };
    io.emit('state:update', globalState);
  });

  socket.on('disconnect', () => {
    console.log('desconectado', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Socket server listening on ${PORT}`));

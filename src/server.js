import app from './app';
import http from 'http';
import { Server } from 'socket.io';

const port = process.env.APP_PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket.io connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Socket.io disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

// const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * HTTP server routing configuration
 *
 * The files under public directory are served as static files, which are
 * accessible via fetch() or <link> tag in the client-side JavaScript.
 */
// app.use(express.static(join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.sendFile(join(__dirname, 'index.html'));
// });

server.listen(3001, () => {
  console.log('server running at http://localhost:3001');
});

/**
 * WebSocket server
 */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // replace with the origin of your React app
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

/**
 * Game state
 */

let gameState = {
  isPlaying: false,
  players: null, /* Set? : Stores player userIDs */
};

/**
 * Online users
 */

let serverState = {
  onlinePlayers: new Set(),
  host: null, /* String? : Store host's userID */
};

io.on('connection', (socket) => {
  const userId = (Math.random() + 1).toString(36).substring(7);
  socket.data.name = userId; // TODO: split name and userId

  console.log('user %s connected', userId);
  serverState.onlinePlayers.add(userId);

  if (serverState.host === null)
    serverState.host = userId;

  socket.emit('initialization', {
    'players': Array.from(serverState.onlinePlayers, (userId) => {
      return { 'name': userId, 'isPlaying': false };
    }),
    'host': serverState.host,
    'userId': userId,
  });

  socket.broadcast.emit('player', {
    'action': "add",
    'name': userId,
    'host': serverState.host,
  });

  // Description:
  //   User sends his/her user information to serer during initialization
  // Field:
  //   name: String
  // Expectation:
  //   The server receives display name about the sender.
  //   Then, server helps to broadcast it to other online users.
  socket.on('user-info', (msg) => {

  });

  // Description:
  //   The host presses "start".
  // Expectation:
  //   Broadcast to acknowledge all players to switch to GameView.
  socket.on('start', () => {
    io.socketsJoin('game-room');
    io.in('game-room').emit('start');

    gameState = {
      isPlaying: true,
      players: new Set(serverState.onlinePlayers),
    };
  });

  // Description:
  //   The player acknowledges that he/she is dead.
  // Expectation:
  //   Broadcast to acknowledge all players that a player is dead.
  socket.on('dead', () => {
    socket.emit('end', { 'remaining': gameState.players.size });
    socket.to('game-room').emit('dead', { 'name': socket.data.name });
    socket.leave('game-room');

    gameState.players.delete(socket.data.name);
    if (gameState.players.size === 1) {
      io.in('game-room').emit('end', { 'remaining': gameState.players.size });
      gameState.isPlaying = false;
    }
  });

  // Description:
  //   The player fulfills the requirement to attack others.
  // Expectation:
  //   Broadcast "being-attacked" to victim players
  socket.on('attack', () => {
    socket.to('game-room').emit('being-attacked', { 'source': socket.data.name });
  });

  socket.on('disconnect', () => {
    console.log('user %s disconnected', socket.data.name);
    serverState.onlinePlayers.delete(socket.data.name);

    // if the player is the host, reassign the host randomly
    if (serverState.host === socket.data.name) {
      if (serverState.onlinePlayers.size === 0) {
        serverState.host = null;
      } else {
        serverState.host = Array.from(
          serverState.onlinePlayers
        )[Math.floor(Math.random() * serverState.onlinePlayers.size)];
      }
    }

    io.emit('player', {
      'action': 'remove',
      'name': socket.data.name,
      'host': serverState.host,
    });

    if (!gameState.isPlaying)
      return;

    gameState.players.delete(socket.data.name);
    if (gameState.players.size <= 1) {
      gameState.isPlaying = false;
      io.in('game-room').emit('end', { 'remaining': gameState.players.size });
    }
  });
});

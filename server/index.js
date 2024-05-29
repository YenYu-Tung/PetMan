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

server.listen(3002, () => {
  console.log('server running at localhost:3002');
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
  onlinePlayers: new Map(), /* Map<String, Object> : Stores online players' states */
  host: null, /* String? : Store host's userID */
};

io.on('connection', (socket) => {
  const userId = (Math.random() + 1).toString(36).substring(7);
  while (serverState.onlinePlayers.has(userId)) {
    userId = (Math.random() + 1).toString(36).substring(7);
  }

  console.log('user %s connected', userId);
  serverState.onlinePlayers.set(userId, { 'name': null, 'isPlaying': false });

  if (serverState.host === null)
    serverState.host = userId;

  socket.emit('initialization', {
    'players': Array.from(serverState.onlinePlayers, ([userId, state]) => {
      return { 'userId': userId, 'name': state.name, 'isPlaying': false };
    }),
    'host': serverState.host,
    'userId': userId,
  });

  socket.broadcast.emit('player', {
    'action': "add",
    'userId': userId,
    'name': null,
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
    serverState.onlinePlayers.get(userId).name = msg.name;
    io.emit('player', {
      'action': "rename",
      'userId': userId,
      'name': msg.name,
      'host': serverState.host,
    });
  });

  // Description:
  //   The host presses "start".
  // Expectation:
  //   Broadcast to acknowledge all players to switch to GameView.
  socket.on('start', () => {
    if (serverState.isPlaying) {
      console.warn('game already started'); return;
    }

    console.log('game started by %s', serverState.onlinePlayers.get(userId).name);

    io.socketsJoin('game-room');
    io.in('game-room')
      .emit('start');

    gameState = {
      isPlaying: true,
      players: new Set(serverState.onlinePlayers.keys()),
    };
  });

  // Description:
  //   The player acknowledges that he/she is dead.
  // Field:
  //   remainLives: number
  //   srcId: string
  // Expectation:
  //   Broadcast to acknowledge all players that a player is dead.
  socket.on('dead', (msg) => {
    io.in('game-room')
      .emit('dead', {
        'userId': userId,
        'userName': serverState.onlinePlayers.get(userId).name,
        'remainLives': msg.remainLives,
        'srcId': msg.srcId,
      });

    if (msg.remainLives)
      return;

    socket.emit('end', { 'remainPlayers': gameState.players.size });
    socket.leave('game-room');
    gameState.players.delete(userId);
    if (gameState.players.size === 1) {
      io.in('game-room').emit('end', { 'remainPlayers': gameState.players.size });
      gameState.isPlaying = false;
      console.log('game ended');
    }
  });

  // Description:
  //   The player fulfills the requirement to attack others.
  // Expectation:
  //   Broadcast "being-attacked" to victim players
  socket.on('attack', () => {
    socket.to('game-room')
          .emit('being-attacked', {
            'srcId': userId,
            'name': serverState.onlinePlayers.get(userId).name
          });
  });

  socket.on('disconnect', () => {
    console.log('user %s disconnected', userId);
    serverState.onlinePlayers.delete(userId);

    // if the player is the host, reassign the host randomly
    if (serverState.host === userId) {
      if (serverState.onlinePlayers.size === 0) {
        serverState.host = null;
      } else {
        serverState.host = Array.from(
          serverState.onlinePlayers.keys()
        )[Math.floor(Math.random() * serverState.onlinePlayers.size)];
      }
    }

    io.emit('player', {
      'action': 'remove',
      'userId': userId,
      'name': null,
      'host': serverState.host,
    });

    if (!gameState.isPlaying)
      return;

    gameState.players.delete(userId);
    if (gameState.players.size <= 1) {
      gameState.isPlaying = false;
      console.log('game ended');
      io.in('game-room')
        .emit('end', { 'remainPlayers': gameState.players.size });
    }
  });
});

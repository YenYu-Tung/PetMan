import { strict as assert } from 'assert';
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

import ReactHowler from 'react-howler';
import { useStore } from '../../components/StoreContext';
import { GameRoom } from './Components/GameRoom';
import { Lobby } from './Components/Lobby';

export interface PlayerStatus {
  isPlaying: boolean;
  isHost: boolean;
}

export const Room: React.FC = () =>
{
  // user name
  const query = new URLSearchParams(useLocation().search);
  const name = query.get('name');
  const [userName, setUserName] = useState('');
  useEffect(() => {
    if (name) setUserName(name);   
  }, [setUserName]);

  // character
  const [selectedPet, setSelectedPet] = useState<string | null>('JN');


  // Game logic and UI
  const [isGameStart, setGameStart] = useState<boolean>(false);
  const [dialogOpen, setDialog] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [players, setPlayers] = useState<Map<string, PlayerStatus>>(new Map());
  const [rank, setRank] = useState<number>(-1);

  // BGM logic - Default BGM
  const [currentTrack, setCurrentTrack] = useState<string>('/track/bgm-1x.mp3');
  const [playing, setPlaying] = useState<boolean>(true);
  const soundRef = useRef<ReactHowler | null>(null);

  const soundEffect = (src: string) => {
    if (!soundRef.current)
      return;

    soundRef.current.stop();
    soundRef.current.src = src;
    soundRef.current.play();
  }

  const store = useStore();
  let userId: string | null = null;

  // Create socket.io in this level, so that it can be used in both GameRoom and Lobby.
  useEffect(() => {
    const socket = io('http://localhost:3001');   // ! the game server is running on another port.
    store.socket = socket;                        // store the socket for later use
    store.soundEffect = soundEffect;              // store the soundRef for later use

    // The client sends his or her name to the server
    // socket.emit('user-info', {
    //   'name': name
    // });

    // The server sends the player list to online players for initialization.
    // msg: {
    //   players: [{ name: string, isPlaying: boolean, userId: string }],
    //   host: String
    // }
    socket.on('initialization', (msg) => {
      console.debug(msg);

      assert('players' in msg && msg.players instanceof Array, 'Invalid player list received');
      assert('host' in msg && typeof(msg.host) == 'string', 'Invalid host received');
      assert('userId' in msg && typeof(msg.userId) == 'string', 'Invalid userId received');

      userId = msg.userId;  // store the server dispatched userId
      setPlayers((_) => {
        const map = new Map<string, PlayerStatus>();
        msg.players.forEach((player: { name: string, isPlaying: boolean }) => {
          map.set(player.name, { 'isPlaying': player.isPlaying, 'isHost': msg.host === player.name });
        });
        return map;
      });
    });

    // The server sends the delta of the user list.
    // msg: {
    //   action: String, // ['append', 'remove'],
    //   name: String,
    //   host: String?  // Possibly null
    // }
    socket.on('player', (msg) => {
      assert('action' in msg && typeof(msg.action) == 'string', 'Invalid action received');
      assert('name' in msg && typeof(msg.name) == 'string', 'Invalid name received');

      console.debug(msg);

      setPlayers((prev: Map<string, PlayerStatus>) => {
        const curr = new Map<string, PlayerStatus>(prev);
        if (msg.action === 'add') {
          curr.set(msg.name, { 'isPlaying': false, 'isHost': msg.host === msg.name });
        } else if (msg.action === 'remove') {
          curr.delete(msg.name);
        } else {
          throw new Error('Invalid action');
        }

        let host = curr.get(msg.host);
        if (host)
          host.isHost = true;

        return curr;
      });
    });

    // The server sends 'game start' signal to all players.
    socket.on('start', () => {
      setPlayers((prev: Map<string, PlayerStatus>) => { // Set all players' status to 'playing'
        const curr = new Map(prev);
        curr.forEach((status, key) => {
          curr.set(key, { 'isPlaying': true, 'isHost': status.isHost });
        });
        return curr;
      });

      store.resetGame();
      setCurrentTrack('/track/bgm-125x.mp3')
      setGameStart(true);
    });

    // The server sends 'game over' signal to all players.
    // msg: {
    //   remaining: number
    // }
    socket.on('end', (msg) => {
      console.debug('end', msg);

      store.game.gamePaused = true;
      setRank(msg.remaining);
      setDialog(true);
    });

    // The server notifies the surviving players that someone is dead (game over).
    // msg: {
    //   name: string
    // }
    socket.on('dead', (msg) => {
      console.debug('dead', msg);

      assert('name' in msg && typeof(msg.name) == 'string', 'Invalid name received');
      setHistory((prev) => {
        const curr = prev.slice();
        curr.push(msg.name + ' is dead.');
        return curr;
      });
    });

    // The server notifies the player that he or she is being attacked.
    // msg: {
    //   source: string
    // }
    socket.on('being-attacked', (msg) => {
      console.debug('being-attacked', msg);

      assert('source' in msg && typeof(msg.source) == 'string', 'Invalid source received');
      setHistory((prev) => {
        const curr = prev.slice();
        curr.push('You are being attacked by ' + msg.source);
        return curr;
      });
    });

    return () => {
      socket.disconnect();
    };

    // eslint-disable-next-line
  }, []);

  return (
    <>
      <ReactHowler
        src={currentTrack}
        playing={playing}
        loop={true}
      />
      <ReactHowler
        ref={soundRef}
        src={"/track/eat.mp3"} // initial src, will change when playSound is called
        playing={false}
      />
      {isGameStart ?
        <GameRoom
          players={players}
          history={history}
          rank={rank}
          dialogOpen={dialogOpen}
          setDialog={setDialog}
          userName={userName}
          selectedPet={selectedPet}
        />
        :
        <Lobby players={players} userName={userName} setSelectedPet={setSelectedPet} selectedPet={selectedPet} />
      }
    </>
  );
}
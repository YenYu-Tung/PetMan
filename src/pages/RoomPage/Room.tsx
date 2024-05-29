import { strict as assert } from 'assert';
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import './Room.css';

import ReactHowler from 'react-howler';
import { useStore } from '../../components/StoreContext';
import { GameRoom } from './Components/GameRoom';
import { Lobby } from './Components/Lobby';

export interface PlayerStatus {
  name: string | null;
  remainLives: number;
  numKills: number;
  isPlaying: boolean;
  isHost: boolean;
}

export const Room: React.FC = () =>
{
  // user name
  const query = new URLSearchParams(useLocation().search);
  const name: string | null = query.get('name');
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
  const [isHost, setIsHost] = useState<boolean>(false);
  const [rank, setRank] = useState<number>(-1);

  // BGM logic - Default BGM
  const [currentTrack, setCurrentTrack] = useState<string>('/track/bgm-1x.mp3');
  const [playing, setPlaying] = useState<boolean>(true);
  const soundGameOverRef = useRef<ReactHowler | null>(null);
  const soundReviveRef = useRef<ReactHowler | null>(null);
  const soundEatRef = useRef<ReactHowler | null>(null);

  const soundEffect = (src: string) => {
    if (!soundEatRef.current)
      return;

    soundEatRef.current.stop();
    soundEatRef.current.src = src;
    soundEatRef.current.play();
  }

  const soundRevive = (src: string) => {
    if (!soundReviveRef.current)
      return;

    soundReviveRef.current.stop();
    soundReviveRef.current.src = src;
    soundReviveRef.current.play();
  }

  const soundGameOver = (src: string) => {
    if (!soundGameOverRef.current)
      return;

    soundGameOverRef.current.stop();
    soundGameOverRef.current.src = src;
    soundGameOverRef.current.play();
  }

  const store = useStore();
  let userId: string | null = null;

  // Countdown logic
  const [countdown, setCountdown] = useState<number>(-1);
  const startCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 0) {
          clearInterval(countdownInterval);
          setGameStart(true);
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Create socket.io in this level, so that it can be used in both GameRoom and Lobby.
  useEffect(() => {
    const socket = io('http://localhost:3002');  // ! the game server is running on another port.
    store.socket = socket;                            // store the socket for later use
    store.soundEat = soundEffect;                     // store the soundRef for later use
    store.soundRevive = soundRevive;                  // store the soundRef for later use
    store.soundGameOver = soundGameOver;
    store.setPlaying = setPlaying;

    // The client sends his or her name to the server
    socket.emit('user-info', {
      'name': name
    });

    // The server sends the player list to online players for initialization.
    // msg: {
    //   players: [{ name: string, isPlaying: boolean, userId: string }],
    //   host: String
    // }
    socket.on('initialization', (msg) => {
      console.debug(msg);

      assert('players' in msg && msg.players instanceof Array, 'Invalid player list received');
      assert('userId' in msg && typeof(msg.userId) == 'string', 'Invalid userId received');
      assert('host' in msg && typeof(msg.host) == 'string', 'Invalid host received');

      userId = msg.userId;  // store the server dispatched userId
      setIsHost(msg.host === userId);
      setPlayers((_) => {
        const map = new Map<string, PlayerStatus>();
        msg.players.forEach((player: { userId: string, name: string | null, isPlaying: boolean }) => {
          map.set(player.userId, {
            'name': player.name,
            'isPlaying': player.isPlaying,
            'isHost': msg.host === player.name,
            'remainLives': 3,
            'numKills': 0
          });
        });
        return map;
      });
    });

    // The server sends the delta of the user list.
    // msg: {
    //   action: string, // ['append', 'remove', 'rename'],
    //   userId: string,
    //   name: string?,
    //   host: string  // Possibly null
    // }
    socket.on('player', (msg) => {
      assert('action' in msg && typeof(msg.action) == 'string', 'Invalid action received');
      assert('userId' in msg && typeof(msg.userId) == 'string', 'Invalid name received');

      console.debug(msg);

      setPlayers((prev: Map<string, PlayerStatus>) => {
        const curr = new Map<string, PlayerStatus>(prev);
        if (msg.action === 'add' || msg.action === 'rename') {
          const status = curr.get(msg.userId);
          curr.set(msg.userId, {
            'name': msg.name,
            'isPlaying': status ? status.isPlaying : false,
            'isHost': msg.host === msg.name,
            'remainLives': status ? status.remainLives : 3,
            'numKills': 0 });
        } else if (msg.action === 'remove') {
          curr.delete(msg.userId);
        } else {
          throw new Error('Invalid action');
        }

        let host = curr.get(msg.host);
        if (host)
          host.isHost = true;

        return curr;
      });
      setIsHost(msg.host === userId);
    });

    // The server sends 'game start' signal to all players.
    socket.on('start', () => {
      setPlayers((prev: Map<string, PlayerStatus>) => { // Set all players' status to 'playing'
        const curr = new Map(prev);
        curr.forEach((status, key) => {
          curr.set(key, {
            'name': status.name,
            'isPlaying': true,
            'isHost': status.isHost,
            'remainLives': 3,
            'numKills': 0 });
        });
        return curr;
      });

      store.resetGame();
      setCurrentTrack('/track/bgm-125x.mp3')
      startCountdown();
    });

    // The server sends 'game over' signal to all players.
    // msg: {
    //   remainPlayers: number
    // }
    socket.on('end', (msg) => {
      console.debug('end', msg);

      // store.game.gamePaused = true;
      setRank(msg.remainPlayers);
      setTimeout(() => {
        setDialog(true);
      }, 5000);
      setTimeout(() => {
        setDialog(false);
        window.location.href = `/room?name=${name}`;
      }, 10000);
    });

    // The server notifies the surviving players that someone is dead (game over).
    // msg: {
    //   userId: string
    //   userName: string
    //   remainLives: number
    //   srcId: string?
    // }
    socket.on('dead', (msg) => {
      console.debug('dead', msg);

      assert('userId' in msg && typeof(msg.userId) == 'string', 'Invalid userId received');
      assert('userName' in msg && typeof(msg.userName) == 'string', 'Invalid userName received');
      assert('remainLives' in msg && typeof(msg.remainLives) == 'number', 'Invalid remainLives received');

      setPlayers((prev: Map<string, PlayerStatus>) => {
        const curr = new Map(prev);

        const status = curr.get(msg.userId);
        if (status) {
          status.remainLives--;
          curr.set(msg.userId, status);
        }

        const src = curr.get(msg.srcId);
        if (src) {
          src.numKills++;
          curr.set(msg.srcId, src);
        }

        return curr;
      });

      if (msg.remainLives)
        return;

      setHistory((prev) => {
        return [msg.userName + ' is dead.', ...prev];
      });
    });

    // The server notifies the player that he or she is being attacked.
    // msg: {
    //   srcId: string,
    //   name: string
    // }
    socket.on('being-attacked', (msg) => {
      console.debug('being-attacked', msg);

      assert('srcId' in msg && typeof(msg.srcId) == 'string', 'Invalid srcId received');
      store.game.spawnGhost();
      store.srcKiller = msg.srcId;
      setHistory((prev) => {
        return ['Attacked by ' + msg.name, ...prev];
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
        ref={soundEatRef}
        src={"/track/eat.mp3"} // initial src, will change when playSound is called
        playing={false}
      />
      <ReactHowler
        ref={soundReviveRef}
        src={"/track/revive.mp3"} // initial src, will change when playSound is called
        playing={false}
      />
      <ReactHowler
        ref={soundGameOverRef}
        src={"/track/game-over.mp3"} // initial src, will change when playSound is called
        playing={false}
      />
      {countdown >= 0 && (
        <div className="countdown-modal">
          <img src={`/${selectedPet}.PNG`} alt="" className='w-36' />
          <div className="countdown-text">
            {countdown === 0 ? 'Go !' : countdown }
          </div>
        </div>
      )}
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
        <Lobby
          players={players}
          userName={userName}
          isHost={isHost}
          setSelectedPet={setSelectedPet}
          selectedPet={selectedPet}
        />
      }
    </>
  );
}
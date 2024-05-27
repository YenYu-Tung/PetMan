import { Row } from 'antd';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import styled from 'styled-components/macro';
import { Board } from '../../components/Board';
import { VSpace } from '../../components/Spacer';
import { useStore } from '../../components/StoreContext';
import { useGameLoop } from '../../model/useGameLoop';
import { DebugView } from './components/DebugView';
import { ExtraLives } from './components/ExtraLives';
import { GameOver } from './components/GameOver';
import { GhostsGameView } from './components/GhostsView';
import { MazeView } from './components/MazeView';
import { PacManView } from './components/PacManView';
import { PillsView } from './components/PillsView';
import { Score } from './components/Score';
import { useKeyboardActions } from './components/useKeyboardActions';

export const GamePage: React.FC = observer(() => {
  const store = useStore();

  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    // ! the game server is running on another port.
    const socket = io('https://pet-man-server.vercel.app:3001');

    // the client sends his or her name to the server
    socket.emit('players', { 'name': (Math.random() + 1).toString(36).substring(7) });

    // the server updates the player list in real-time.
    socket.on('players', (msg) => {
      // console.log(msg);              // debug usage
      setPlayerCount(msg.playerCount);
    });

    store.resetGame();
    store.socket = socket;
    return () => {
      store.game.gamePaused = true;
      socket.disconnect();
    };

    // eslint-disable-next-line
  }, []);

  useGameLoop();
  useKeyboardActions();

  return (
    <Layout data-testid="GamePage">
      <ScoreArea>
        <Row justify="center">
          <Score />
        </Row>
        <VSpace size="small" />
      </ScoreArea>

      <EmptyArea />

      <BoardArea>
        <Board>
          <MazeView />
          <PillsView />
          {/* <PacManView /> */}
          <GhostsGameView />
          <GameOver />
        </Board>
        <VSpace size="large" />
        <Row justify="center">
          {/* <ExtraLives /> */}
        </Row>
      </BoardArea>

      <DebugArea>
        <DebugView playerCount={playerCount}/>
      </DebugArea>
    </Layout>
  );
});

const Layout = styled.div`
  margin-left: 16px;
  margin-right: 16px;

  display: grid;

  @media (min-width: 1280px) {
    grid-template-columns: 1fr 1fr;
    justify-items: center;
  }
  @media (max-width: 1280px) {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`;

const ScoreArea = styled.div``;

const EmptyArea = styled.div``;

const BoardArea = styled.div``;

const DebugArea = styled.div`
  @media (max-width: 1280px) {
    display: none;
  }
`;

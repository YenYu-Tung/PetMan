import { Row } from 'antd';
import { observer } from 'mobx-react-lite';
import React from 'react';
import styled from 'styled-components/macro';
import { Board } from '../../../components/Board';
import { Modal } from "../../../components/Modal";
import { VSpace } from '../../../components/Spacer';
import { useGameLoop } from '../../../model/useGameLoop';
import { ExtraLives } from '../../GamePage/components/ExtraLives';
import { GameOver } from '../../GamePage/components/GameOver';
import { GhostsGameView } from '../../GamePage/components/GhostsView';
import { MazeView } from '../../GamePage/components/MazeView';
import { PacManView } from '../../GamePage/components/PacManView';
import { PillsView } from '../../GamePage/components/PillsView';
import { useKeyboardActions } from '../../GamePage/components/useKeyboardActions';
import { PlayerStatus } from '../Room';

type Props = {
  players: Map<string, PlayerStatus>;
  history: string[];
  rank: number;
  dialogOpen: boolean;
  setDialog: (open: boolean) => void;
  userName: string;
  selectedPet: string | null;
}

export const GameRoom: React.FC<Props> = observer(({ players, history, rank, dialogOpen, setDialog, userName, selectedPet }) => {
  useGameLoop();
  useKeyboardActions();

  return (
    <div className="bg-white w-full h-full flex flex-col justify-center jersey px-8">

      <div className='w-full flex justify-between items-center h-full my-6 gap-6'>

        <div className="flex-1 flex flex-col justify-between h-full gap-8">
          <Modal rank={rank} dialogOpen={dialogOpen} setDialog={setDialog} userName={userName} />
          <div className="flex-1 flex flex-col justify-start h-full border-8 border-red rounded-3xl gap-2 p-2">
            {Array.from(history, (value, index) => (
              <span className="text-black text-3xl font-semibold border-2 border-black rounded p-2" key={index}>
                {value}
              </span>
            ))}
          </div>
        </div>

        <div className="w-3/5 h-full border-8 border-blue rounded-3xl flex justify-center items-center bg-black">
          {/* <GameBoard /> */}
          <BoardArea>
            <Board>
              <MazeView />
              <PillsView />
              <PacManView selectedPet={selectedPet}/>
              <GhostsGameView />
              <GameOver />
            </Board>
            <VSpace size="large" />
            <Row justify="center">
              <ExtraLives selectedPet={selectedPet} />
            </Row>
          </BoardArea>
        </div>

        <div className="flex-1 flex flex-col justify-start h-full border-8 border-yellow rounded-3xl gap-2 p-2">
          <span className='w-full text-center text-4xl text-yellow font-bold mb-2'>
            Score Board
          </span>
          {Array.from(players, ([name, value]) => (
            <span className="text-black text-3xl font-semibold border-2 border-black rounded p-2" key={name}>
              {value.isHost ? "*" : ""} {name}
            </span>
          ))}
        </div>


      </div>
    </div>

  );
});

const BoardArea = styled.div``;
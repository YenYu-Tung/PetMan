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
import FavoriteIcon from '@mui/icons-material/Favorite';


type Props = {
  players: Map<string, PlayerStatus>;
  history: string[];
  rank: number;
  dialogOpen: boolean;
  setDialog: (open: boolean) => void;
  userName: string;
  selectedPet: string | null;
}

const MAX_HISTORY_LENGTH = 25;

export const GameRoom: React.FC<Props> = observer(({ players, history, rank, dialogOpen, setDialog, userName, selectedPet }) => {
  useGameLoop();
  useKeyboardActions();

  const truncatedHistory = history.length > MAX_HISTORY_LENGTH ? history.slice(-MAX_HISTORY_LENGTH) : history;

  return (
    <div className="bg-white w-full h-full flex flex-col justify-center jersey px-8 py-4">

      <div className='w-full flex justify-between items-center h-full my-6 gap-2'>

        <div className="flex-1 flex flex-col justify-between h-full gap-2 truncate">
          <Modal rank={rank} dialogOpen={dialogOpen} setDialog={setDialog} userName={userName} selectedPet={selectedPet} />
          <div className="flex-1 flex flex-col justify-start h-full border-8 border-red rounded-3xl p-2 overflow-y-auto">
            <div className='flex flex-col gap-2'>
              {truncatedHistory.map((value, index) => (
                <span className="text-black text-lg font-semibold border-2 border-black rounded p-2 truncate" key={index}>
                  {value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-3/5 h-full border-8 border-blue rounded-3xl flex justify-center items-center bg-black">
          {/* <GameBoard /> */}
          <div className='w-full flex justify-center items-center gap-4'>
            <Board>
              <MazeView />
              <PillsView />
              <PacManView selectedPet={selectedPet}/>
              <GhostsGameView />
              <GameOver />
            </Board>
            <div className="flex flex-col items-start gap-2 pb-48">
              <span className='text-[#ff0000] text-2xl font-semibold'><FavoriteIcon className="text-[#ff0000]" sx={{ fontSize: 32 }} /> HP</span>              
              <ExtraLives selectedPet={selectedPet} />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-start h-full border-8 border-yellow rounded-3xl gap-2 p-2 truncate">
          <span className='w-full text-center text-4xl text-yellow font-bold mb-2'>
            Score Board
          </span>
          <div className='flex flex-1 flex-col gap-2 overflow-y-auto'>
            {Array.from(players, ([name, value]) => (
              <span className="flex w-full justify-between text-black text-xl font-semibold border-2 border-black rounded px-2 py-1 truncate shrink-0 items-center" key={name}>
                <span className='text-2xl max-w-32 truncate'>{value.name ? value.name : "Anonymous"}</span>
                <span>❤️ {value.remainLives} / 🗡️ {value.numKills}</span>                 
              </span>
            ))}
          </div>
        </div>


      </div>
    </div>

  );
});

const BoardArea = styled.div``;
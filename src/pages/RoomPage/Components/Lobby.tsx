import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useStore } from '../../../components/StoreContext';
import { PlayerStatus } from '../Room';
import { divide } from 'lodash';

type Props = {
  players: Map<string, PlayerStatus>;
  userName: string;
  isHost: boolean;
  selectedPet: string | null;
  setSelectedPet: (pet: string) => void;
}

export const Lobby: React.FC<Props> = observer(({ players, userName, isHost, selectedPet, setSelectedPet }) =>
{
  const store = useStore();
  let socket = store.socket;

  const handleSelectPet = (pet: string) => {
    setSelectedPet(pet);
  };

  const petImages = [
    { src: "/JN.PNG", alt: "JN", name: "JN" },
    { src: "/CL.PNG", alt: "CL", name: "CL" },
    { src: "/HC.PNG", alt: "HC", name: "HC" },
    { src: "/JM.PNG", alt: "JM", name: "JM" },
    { src: "/JS.PNG", alt: "JS", name: "JS" },
    { src: "/MK.PNG", alt: "MK", name: "MK" },
    { src: "/RJ.PNG", alt: "RJ", name: "RJ" }
  ];

  const handleExit = () => {
    window.location.href = '/';
  };

  const handleNavigate = () => {
    socket?.emit('start');
  };

  return (
    <div className="bg-white w-full h-full flex flex-col justify-center jersey px-8 py-4">

      <div className='w-full flex justify-between items-center h-full my-6 gap-6'>

        <div className="w-1/4 flex flex-col justify-between h-full gap-2">
          <button className="shadow hover:bg-green focus:outline-none text-black text-3xl font-bold py-1 w-full rounded-xl border-4 border-dark-green" type="button" onClick={handleExit}>
            HOME
          </button>
          <div className='flex flex-col w-full flex-1 border-8 border-red rounded-3xl gap-2 p-2 relative overflow-y-auto'>
            <span className='text-red text-2xl font-semibold absolute top-2 right-4'>{players.size}</span>
            <span className='text-black text-4xl w-full text-center font-bold'>Players</span>
            <div className='flex flex-1 flex-col gap-2 overflow-y-auto'>
              {Array.from(players, ([name, value]) => (
                <div className='flex gap-2 justify-start items-center  shrink-0'>
                  <span className={`text-4xl font-semibold truncate ${value.isHost ? 'text-red' : 'text-black'}`} key={name} >
                    {value.name ? value.name : "Anonymous"}
                  </span>
                  {value.isHost && <div className='px-1 text-black text-lg font-semibold  border-2 border-red rounded'>Host</div>}
                </div>
              ))}
            </div>
          </div>
          <div className='w-full h-[10%] bg-yellow/80 rounded-xl flex justify-center items-center truncate p-2'>
            <span className="text-black text-4xl font-bold inline-block my-auto truncate" >
              Hi {userName} !
            </span>
          </div>
        </div>

        <div className="w-[72%] flex flex-col justify-between h-full gap-2">
          <div className='flex flex-col w-full flex-1 bg-blue/80 rounded-3xl justify-between items-center px-2 py-4'>
            <div className='flex flex-col w-full gap-2 justify-center items-center'>
              <span className="text-white text-4xl font-semibold" >
                Pick Your Own
              </span>
              <span className="text-white text-6xl font-semibold" >
                Pet Man
              </span>
            </div>
            <div className='flex-1 w-11/12 bg-white/50 rounded-3xl justify-center items-center flex-wrap py-4 gap-6 px-24 2xl:px-20 grid grid-cols-4'>
              {petImages.map((pet, index) => (
                <img
                  key={index}
                  src={pet.src}
                  alt={pet.alt}
                  className={`w-full ${selectedPet === pet.name ? 'border-focus' : ''}`}
                  onClick={() => handleSelectPet(pet.name)}
                />
              ))}
            </div>

          </div>

          <span className='w-full text-center text-black text-xl font-semibold'>Only the Host can start the game</span>
          <button className={`shadow ${(players.size < 2 || !isHost) ? '' : 'hover:bg-green border-dark-green'} focus:outline-none text-black text-3xl font-bold py-1 w-72 rounded-xl mx-auto border-4`}
                  type="button"
                  onClick={() => { console.log(socket); handleNavigate(); }}
                  disabled={players.size < 2 || !isHost}
          >
            Start !
          </button>
        </div>

      </div>
    </div>

  );
});

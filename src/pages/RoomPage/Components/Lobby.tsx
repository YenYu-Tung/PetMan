import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useStore } from '../../../components/StoreContext';
import { PlayerStatus } from '../Room';

type Props = {
  players: Map<string, PlayerStatus>;
  userName: string;
  selectedPet: string | null;
  setSelectedPet: (pet: string) => void;
}

export const Lobby: React.FC<Props> = observer(({ players, userName, selectedPet, setSelectedPet }) => {

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
    <div className="bg-white w-full h-full flex flex-col justify-center jersey px-8">


      <div className='w-full flex justify-between items-center h-full my-6 gap-6'>

        <div className="w-1/4 flex flex-col justify-between h-full gap-8">
          <button className="shadow hover:bg-green focus:outline-none text-black text-5xl font-bold py-2 w-full rounded-3xl border-8 border-dark-green" type="button" onClick={handleExit}>
            EXIT
          </button>
          <div className='flex flex-col w-full flex-1 border-8 border-red rounded-3xl gap-2 p-2'>
            {Array.from(players, ([name, value]) => (
              <span className="text-black text-4xl font-semibold" key={name} >
                {value.isHost ? "*" : ""} {name}
              </span>
            ))}
          </div>
          <div className='w-full h-[10%] bg-yellow/80 rounded-xl flex justify-center items-center'>
            <span className="text-black text-4xl font-bold inline-block my-auto" >
              Hi {userName}!
            </span>
          </div>
        </div>

        <div className="w-[72%] flex flex-col justify-between h-full gap-8">
          <div className='flex flex-col w-full flex-1 bg-blue/80 rounded-3xl justify-center items-center gap-2'>
            <div className='flex flex-col w-full gap-4 justify-center items-center'>
              <span className="text-white text-6xl font-semibold" >
                Pick Your Own
              </span>
              <span className="text-white text-8xl font-semibold" >
                Pet Man
              </span>
            </div>
            <div className='w-11/12 h-[65%] bg-white/50 rounded-3xl justify-center items-center flex-wrap flex p-2 xl:px-16 gap-4'>
              {petImages.map((pet, index) => (
                <img
                  key={index}
                  src={pet.src}
                  alt={pet.alt}
                  className={`w-38 ${selectedPet === pet.name ? 'w-40 border-focus' : ''}`}
                  onClick={() => handleSelectPet(pet.name)}
                />
              ))}
            </div>

          </div>

          <button className={`shadow ${players.size < 2 ? '' : 'hover:bg-green'} focus:outline-none text-black text-5xl font-bold py-2 w-72 rounded-3xl mx-auto border-8 border-dark-green`}
                  type="button"
                  onClick={() => { console.log(socket); handleNavigate(); }}
                  disabled={players.size < 2}
          >
            Start !
          </button>
        </div>

      </div>
    </div>

  );
});

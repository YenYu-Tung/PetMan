import React, { FC, useState } from 'react';

export const Home: FC = () => {
  const [name, setName] = useState('');


  const [warning, setWarning] = useState('');

  const handleNavigate = () => {
    if (!name) {
      setWarning('Please enter your name!');
      return;
    }
    window.location.href = `/room?name=${encodeURIComponent(name)}`;
  };

  return (
    <div className="bg-white w-full h-full flex flex-col justify-center items-center jersey">
      <p className="text-8xl text-yellow text-center mb-2">Welcome To Pet Man!</p>
      <div className="w-2/5 aspect-[16/9] bg-red/80 rounded-3xl mx-auto p-2">
        <video
          src="/Pet_Man.mp4"
          loop
          autoPlay 
          muted 
          className='w-full h-full rounded-2xl'
          />
      </div>
      <div className="w-full mx-auto flex justify-center items-center">
        <form className="w-full mx-auto mt-2">
          {warning && (
            <div className="w-full text-center text-red text-base font-semibold">
              {warning}
            </div>
          )}
          <div className="w-full mb-4 flex justify-center gap-8">
            <span className="text-blue text-4xl font-bold inline-block my-auto underline underline-offset-8">
              Your Name:
            </span>
            <input
              className="bg-white border-4 border-yellow rounded-2xl p-2 text-black focus:outline-none focus:border-red text-3xl font-semibold focus:bg-yellow/5"
              id="inline-full-name"
              type="text"
              placeholder="Pet Man"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="w-full text-center">
            <button
              className="shadow hover:bg-green focus:shadow-outline focus:outline-none text-black text-3xl font-bold py-1 w-72 rounded-xl border-4 border-dark-green"
              type="button"
              onClick={handleNavigate}
            >
              Go!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

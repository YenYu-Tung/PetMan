import { useEffect, useRef } from 'react';
import { MilliSeconds } from './Types';

type AnimationStepFunc = (timestamp: MilliSeconds) => void;

export const useAnimationLoop = (animationStep: AnimationStepFunc) => {
  const requestRef = useRef(-1);

  const fps = 60; // lock the maximum framerate here
  const timeRef = useRef({ then: Date.now(), now: Date.now() });
  const fpsIntervalRef = useRef(1000 / fps);

  const animate = (timestamp: number) => {
    const now = Date.now();
    const elapsed = now - timeRef.current.then;

    // calc elapsed time since last loop
    if (elapsed < fpsIntervalRef.current) {
      requestAnimationFrame(animate)
      return;
    }

    // if enough time has elapsed, draw the next frame
    timeRef.current.then = now - (elapsed % fpsIntervalRef.current);
    animationStep(now);

    // request another frame
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line
  }, []);
};

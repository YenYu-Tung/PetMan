import React, { FC, CSSProperties } from 'react';
import classNames from 'classnames';
import { SCALE_FACTOR } from '../model/Coordinates';
import './Sprite.css';
import dead from './images/death_circle.png';

const otherImages = [
  { src: "./images/JN.png", alt: "JN", name: "JN" },
  { src: "./images/CL.png", alt: "CL", name: "CL" },
  { src: "./images/HC.png", alt: "HC", name: "HC" },
  { src: "./images/JM.png", alt: "JM", name: "JM" },
  { src: "./images/JS.png", alt: "JS", name: "JS" },
  { src: "./images/MK.png", alt: "MK", name: "MK" },
  { src: "./images/RJ.png", alt: "RJ", name: "RJ" }
];
const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * otherImages.length);
  return otherImages[randomIndex];
};

export const Sprite: FC<{
  name: string;
  x: number;
  y: number;
  className?: string | null;
  style?: CSSProperties;
  selectedPet?: string | null;
}> = ({ name: spriteName, x, y, className, style = {}, selectedPet }) => {
  const classes = className?.split(' ') || [];
  const isPacman = classes.includes('Sprite-pacman');
  const isDeadPacman = classes.includes('Sprite-dying-pacman');
  const isGhost = classes.some(cls => cls.includes('ghost'));
  const isBasicPill = classes.includes('basic-pill');
  const randomImage = getRandomImage();

  let backgroundImage;
  if (isPacman || isDeadPacman) {
    if (selectedPet) backgroundImage = `url(/${selectedPet}.PNG)`;
  }

  const appliedScale = isDeadPacman
    ? 1.3 * SCALE_FACTOR
    : isPacman
      ? 1.06 * SCALE_FACTOR
      : SCALE_FACTOR;

  return (
    <div
      className={classNames(
        'Sprite',
        !(isPacman || isDeadPacman) && `Sprite-${spriteName}`,
        className,
        isDeadPacman && 'dead-pacman'
      )}
      style={{
        ...style,
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: `scale(${appliedScale})`,
        transformOrigin: 'top left',
        ...(backgroundImage ? { backgroundImage, backgroundSize: 'cover' } : {}),
      }}
    />
  );
};

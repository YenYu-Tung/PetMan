import { observer } from 'mobx-react-lite';
import React from 'react';
import { useGame } from '../../../components/StoreContext';
import classNames from 'classnames';
import styled from 'styled-components/macro';
import { PacManSprite } from './PacManView';
import { times } from 'lodash';
import { SCALE_FACTOR } from '../../../model/Coordinates';

interface PacManViewProps {
  selectedPet: string | null;
}

export const ExtraLives = observer<{ className?: string, selectedPet: string | null }>(({ className, selectedPet }) => {
  const game = useGame();
  return (
    <Layout className={classNames('ExtraLives', className)}>      
      <span>
        {times(game.pacMan.extraLivesLeft, n => (
          <PacManSprite
            key={n}
            direction="DOWN"
            pacManAnimationPhase={1}
            x={0}
            y={n * 20 * SCALE_FACTOR}
            selectedPet={selectedPet}
          />
        ))}
      </span>
    </Layout>
  );
});

const Layout = styled.div`
  display: inline-flex;
  position: relative;
  justify-content: center;
  align-items: center;
  height: calc(16px * var(--SCALE_FACTOR));
`;

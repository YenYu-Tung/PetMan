import { Card, Space } from 'antd';
import React, { FC } from 'react';
import styled from 'styled-components/macro';
import { EnergizerDebugView } from './EnergizerDebugView';
import { GhostsDebugView } from './GhostsDebugView';
import { PacManDebugView } from './PacManDebugView';
import { PlayerDebugView } from './PlayerDebugView';
import { GameDebugView } from './GameDebugView';

interface Props {
  playerCount: number;
  className?: string
}

export const DebugView: FC<Props> = ({ playerCount, className }) => {
  return (
    <Layout className={className}>
      <CardInline>
        <Space direction="vertical" size="large">
          <PlayerDebugView playerCount={playerCount}/>
          <GameDebugView />
          <PacManDebugView />
          <GhostsDebugView />
          <EnergizerDebugView />
        </Space>
      </CardInline>
    </Layout>
  );
};

export const Layout = styled.div``;

export const CardInline = styled(Card)`
  display: inline-block;
`;

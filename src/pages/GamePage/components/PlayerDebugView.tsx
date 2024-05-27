// PlayerDebugView.tsx
import { Card, Col, Typography } from 'antd';
import { FC } from 'react';
import styled from 'styled-components/macro';

const { Text } = Typography;

interface Props {
  playerCount: number;
}

export const PlayerDebugView: FC<Props> = ({ playerCount }) => {
  return (
    <Layout className="PlayerDebugView">
      <Card title="Game" size="small" bordered={false}>
        <Col flex="0 0 auto">
          <Text>Current number of players: </Text>
          <h1 className='font-bold text-gray-400'>
            {playerCount}
          </h1>
        </Col>
      </Card>
    </Layout>
  );
};

const Layout = styled.div``;

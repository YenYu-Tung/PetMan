import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { GamePage } from './pages/GamePage/GamePage';
// import { MazePage } from './pages/MazePage/MazePage';
import { SpritePage } from './pages/SpritePage/SpritePage';
// import { WayFindingPage } from './pages/WayFindingPage/WayFindingPage';


import { Home } from './pages/Home';
import { Room } from './pages/RoomPage/Room';

export const AppRoutes: React.FC = () => {
  return (
    <Switch>
      <Route path="/" exact>
        <Home />
      </Route>
      {/* <Route path="/sprites">
        <SpritePage />
      </Route> */}
      {/* <Route path="/home">
        <Home />
      </Route> */}
      <Route path="/room">
        <Room />
      </Route>
      {/* <Route path="/maze">
        <MazePage />
      </Route>
      <Route path="/way-finding">
        <WayFindingPage />
      </Route> */}
    </Switch>
  );
};

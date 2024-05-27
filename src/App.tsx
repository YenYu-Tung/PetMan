import React, { FC, ComponentType } from 'react';
import 'antd/dist/reset.css';

import './GlobalStyles.css';
import { BrowserRouter, BrowserRouterProps } from 'react-router-dom';
import { AppRoutes } from './Routes';
import { AppMenu } from './components/AppMenu';
import { Store } from './model/Store';
import { StoreProvider } from './components/StoreContext';

const App: FC<{ store?: Store; Router?: ComponentType<BrowserRouterProps> }> = ({
  store = new Store(),
  Router = BrowserRouter,
}) => {
  return (
    <StoreProvider value={store}>
      <BrowserRouter>
        <div className="w-full h-full">
          {/* <AppMenu /> */}
          <AppRoutes />
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;

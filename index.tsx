import './src/lib.register';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { renderRoutes } from 'react-router-config';
import store, { mergeReducer } from './src/store';
import { IRouteProps } from './src/types';
import { moduleLoader } from './src/loader'
import { createHistory, router, IRouterConfig } from './src/route';

interface IConfig {
  mounted?: string,
  routes:IRouteProps[],
  routerConfig?: IRouterConfig
  AppContainer: React.FunctionComponent,
}

const bootstrap = (config: IConfig):void => {
  const { 
    routes,
    AppContainer,
    routerConfig = {},
    mounted = 'root'
  } = config;
  ReactDOM.render(
    <Provider store={store}>
        <AppContainer>
          <Router history={createHistory(routerConfig)}>
            {renderRoutes(routes)}
          </Router>
        </AppContainer>
    </Provider>,
    document.getElementById(mounted),
  );
};

export {
  store,
  router,
  mergeReducer,
  moduleLoader,
}

export default bootstrap
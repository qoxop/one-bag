
import { register } from './system.register';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { renderRoutes } from 'react-router-config';
import store, { mergeReducer } from './helpers/store';
import { IRouteProps } from './helpers/types';
import { moduleLoader } from './helpers/loader';
import { createAtomClass } from './helpers/style';
import { createHistory, router, IRouterConfig, getQuery, useQuery } from './helpers/route';
import './assets/index.less';
import './components';
import './utils';

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

// 注册模块
register.obj({
  'one-bag': {
    default: bootstrap,
    store,
    router,
    getQuery,
    useQuery,
    mergeReducer,
    moduleLoader,
    createAtomClass,
    register,
  }
});

export {
  store,
  router,
  getQuery,
  useQuery,
  mergeReducer,
  moduleLoader,
  createAtomClass,
  register
}

export default bootstrap;

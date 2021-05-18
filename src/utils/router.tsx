import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Route, Router } from 'react-router';
import qs from 'qs';
import { StandardModule, UIComponent } from "../types";
import { createBrowserHistory } from 'history';
import storageGenerator from './storage';
import { mergeReducer } from './redux';
import PageLoading from '../components/loading';
import { Reducer } from '@reduxjs/toolkit';

// @ts-ignore
const history = createBrowserHistory({ basename: __ROUTERBASE__ });

export const QueryFix = (() => {
  let names:string[] = [];
  return {
    get() {
      return names;
    },
    set(fixNames: string[]) {
      names = fixNames;
    }
  }
})();

export const createHistoryProxy = (base:string = '', fixParams: string[] = []) => {
  fixParams = QueryFix.get().concat(fixParams);
  const getNewQuery = (query: {[k:string]:any}) => {
    const oldQuery = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    const fixQuery = fixParams.reduce((pre, cur) => {
      if (oldQuery[cur]) {
        pre[cur] = oldQuery[cur]
      }
      return pre;
    }, {} as any);
    return { ...fixQuery, ...query }
  }
  return {
    push(location:{
      pathname:string;
      query?:any;
      state?:object;
    }) {
      const { pathname, query = {}, state } = location;
      const newQuery = getNewQuery(query)
      history.push({
        pathname: `${base}/${pathname}`.replace('//', '/'),
        search: `?${qs.stringify(newQuery)}`,
        state,
      });
    },
    replace(location:{
      pathname:string;
      query?:any;
      state?:any;
    }):void {
      const { pathname, query = {}, state } = location;
      const newQuery = getNewQuery(query)
      history.replace({
        pathname,
        search: `?${qs.stringify(newQuery)}`,
        state
      });
    },
    goBack():void {
      history.goBack();
    },
    go(delta:number):void {
      history.go(delta);
    },
    goForward():void {
      history.goForward();
    },
  }
}

export function AppRouter(props: {
  routes: {[path:string]: StandardModule}
}) {
  const { routes } = props;
  const routeNodes = useMemo(() => {
    const reducers: {key:string, reducer: Reducer}[] = [];
    const routerNodes:JSX.Element[] = [];
    Object.keys(routes).forEach(key => {
      const {reducer, Component} = routes[key]({
        pathkey: key,
        storage: {
          local: storageGenerator(localStorage, key),
          session: storageGenerator(sessionStorage, key),
        },
      });
      reducers.push({key, reducer});
      routerNodes.push(<Route key={key} path={key} component={Component} />)
    });
    mergeReducer(reducers);
    return routerNodes;
  }, [routes]);
  return <Router history={history}>
    {routeNodes}
  </Router>
}

async function getStandardModule(module: {key: string, url: string}): Promise<StandardModule> {
  let standardModule:StandardModule;
  if (System.has(module.url)) {
    standardModule = System.get(module.url).default;
  } else {
    standardModule = (await System.import(module.url)).default
  }
  return standardModule;
}

function getDynamicComponent(module: {key: string, url: string}, base:string) {
  return function DynamicModuleComponent(props: any) {
    const [Comp, setComp] = useState<UIComponent>(PageLoading);
    useLayoutEffect(() => {
      getStandardModule(module).then(m => {
        const { reducer, Component } = m({
          base,
          pathkey: module.key,
          storage: {
            local: storageGenerator(localStorage, module.key),
            session: storageGenerator(sessionStorage, module.key),
          },
        });
        setComp(() => Component);
        mergeReducer({
          key: module.key,
          reducer,
        });
      });
    }, []);
    return <Comp {...props} />
  } as UIComponent;
}

export const RenderDynamicRoutes = (dynamicRoutes: {
  key:string;
  url:string;
}[], base: string = '') => {
  const routeNodes = useMemo(() => {
    return dynamicRoutes.map(module => {
      const dcomp = getDynamicComponent(module, base);
      const keypath = `${base}/${module.key}`
      return <Route key={keypath} path={keypath} component={dcomp} />
    });
  }, [base, dynamicRoutes]);
  return (
    <React.Fragment>
      {routeNodes}
    </React.Fragment>
  )
}
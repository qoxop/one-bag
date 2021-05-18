import React from 'react';
import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

const initReducers = {
  version: () => '1.0.0',
}

/** 动态插入的 reducer */
const asyncReducers: {
  [k: string]: Reducer;
} = {};

/** redux store */
const store = configureStore({
  reducer: combineReducers(initReducers),
});

type IDispatch = typeof store.dispatch;

/**
 * 用于异步加载的模块动态插入 reducer
 * @param reducers
 */
function mergeReducer(reducers: Array<{
  key: string;
  reducer: Reducer;
}> | {
  key: string;
  reducer: Reducer;
}): void {
  let hasNew = false;
  if (reducers instanceof Array) {
    reducers.forEach((item) => {
      const { key, reducer } = item;
      if (!!key && !!reducer && !asyncReducers[key]) {
        hasNew = true;
        asyncReducers[key] = reducer;
      }
    });
  }
  else {
    const { key, reducer } = reducers;
    if (!!key && !!reducer && !asyncReducers[key]) {
      hasNew = true;
      asyncReducers[key] = reducer;
    }
  }
  if (hasNew) {
    store.replaceReducer(combineReducers({
      ...initReducers,
      ...asyncReducers,
    }));
  }
}

function ReduxProvider(props: { children: any}) {
  return <Provider store={store}>{props.children}</Provider>
}

export {
  store,
  mergeReducer,
  ReduxProvider,
  IDispatch,
};



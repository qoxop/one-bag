/**
 * redux 的初始化
 */
import {configureStore, combineReducers, Reducer, createSlice} from '@reduxjs/toolkit';

type IReducers = Array<{ key: string; reducer: Reducer;}> | { key: string; reducer: Reducer }

/** 动态插入的 reducer */
const asyncReducers: { [k: string]: Reducer } = {
  version: () => '1.0.1'
};

/**
 * 创建 store 对象
 */
const store = configureStore({
  reducer: combineReducers(asyncReducers),
});

/**
 * 用于异步加载的模块动态插入reducer
 * @param reducers
 */
export function mergeReducer(reducers: IReducers): void {
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
      ...asyncReducers,
    }));
  }
}

export default store;

/**
 * 路由的初始化
 */
import { BrowserHistoryBuildOptions, createBrowserHistory, createHashHistory, HashHistoryBuildOptions, History  } from 'history';
import qs from 'qs';
import { useLocation } from 'react-router';

type ILocation = {
  pathname:string;
  query?:any;
  state?:any;
  [k:string]: any,
}

interface IRouterConfig {
  type?: 'hash'|'browser',
  fixQuerys?: string[],
  enhancer?: (h: History) => History,
  options?: BrowserHistoryBuildOptions | HashHistoryBuildOptions,
}

interface IRouter {
  push(location: ILocation) : void,
  replace(location: ILocation) : void,
  goBack(): void,
  goForward(): void,
  go(n: number): void;
  history: History,
}

let history:History = null;

/**
 * 代理对象高级函数
 * @param name
 * @returns 
 */
function methodHoc(name:string) {
  return {
    get() {
      if (history && history[name]) {
        return history[name].bind(history);
      }
      throw new Error("history 未初始化, 或初始化失败");
    },
    set() {
      console.warn('不可设置～');
    }
  }
}

/**
 * 代理 router，用于检查 histroy 是否在最开始进行了初始化
 */
const router: IRouter = Object.defineProperties({} as any, {
  push: methodHoc('push'),
  replace: methodHoc('replace'),
  goBack: methodHoc('goBack'),
  go: methodHoc('go'),
  goForward: methodHoc('goForward'),
  history: {
    get() {
      if (history) {
        return history;
      }
      throw new Error("history 未初始化, 请不要在顶级作用域使用该对象");
    },
    set() {
      console.warn('不可设置～');
    },
    configurable: false
  }
});

/**
 * 合并新旧 query 对象，将某些参数固定
 * @param oldSearch 
 * @param newQuery 
 * @param fixQuerys 
 * @returns 
 */
function newQuery(oldSearch:string, newQuery: any, fixQuerys: string[] = []) {
  const oldQuery = qs.parse(oldSearch, { ignoreQueryPrefix: true });
  return qs.stringify({
    ...fixQuerys.reduce((pre, cur) => { // 将某些参数固定在 url 上
      if (typeof oldQuery[cur] !== 'undefined') {
        pre[cur] = oldQuery[cur];
      }
      return pre;
    }, {}),
    ...newQuery,
  })
}

/**
 * 创建 history 单例对象
 * @param config 
 * @returns 
 */
function createHistory(config: IRouterConfig) {
  if (history) {
    return history;
  }
  const { type, fixQuerys, enhancer, options = {}} = config;
  history = type === 'hash' ? createHashHistory(options) : createBrowserHistory(options);
  if (typeof enhancer === 'function') {
    history = enhancer(history);
  } else  {
    const oldHistory = history;
    const push = oldHistory.push.bind(oldHistory);
    const replace = oldHistory.replace.bind(oldHistory);
    history = Object.assign(Object.create(oldHistory), {
      push(location: ILocation):void {
        const { pathname, query = {}, state } = location;
        push({ pathname, state, search: `?${newQuery(oldHistory.location.search, query, fixQuerys)}` });
      },
      replace(location: ILocation):void {
        const { pathname, query = {}, state } = location;
        replace({  pathname, state, search: `?${newQuery(oldHistory.location.search, query, fixQuerys)}` });
      }
    });
  }
  return history;
}
function useQuery() {
  const location = useLocation();
  return qs.parse(location.search, { ignoreQueryPrefix: true });
}
function getQuery() {
  return qs.parse(history.location.search, { ignoreQueryPrefix: true })
}

export {
  router,
  useQuery,
  getQuery,
  createHistory,
  IRouterConfig
};
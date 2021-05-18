
import React from 'react';
import ReactDom from 'react-dom';
import App from './app';
import { StandardModule } from './types';
import { createHistoryProxy, QueryFix, RenderDynamicRoutes } from './utils/router';
import './utils/constants';

type IConfig = {
  element: Element | DocumentFragment | HTMLElement | null;
  queryFix?: string[];
  /**
   * 应用的根组件，位于 redux provider 之下，路由之上
   * 主要用于判断登录态
   * ？是否跳转到登录页面
   * ？是否重新向到对应的模块首页
   * ？检测可选模块(不同用户体系的动态模块)
   */
  RootContainer: any;
  routes: {[path:string]: StandardModule }
}

export {
  createHistoryProxy,
  RenderDynamicRoutes,
  StandardModule,
}

export default function (config: IConfig) {
  const { element, routes = {}, RootContainer } = config;
  QueryFix.set(config.queryFix || []);
  ReactDom.render(<App routes={routes} RootContainer={RootContainer} />, element);
}
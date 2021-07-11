/**
 * 动态组件模块加载，同时兼顾 reducer 注入
 */
import { Reducer } from 'redux';
import React, { useEffect, useState } from 'react';
import { IRouteComponentProps } from './types';
import { mergeReducer } from './store';

type IComponent = ((props?:IRouteComponentProps) => JSX.Element | any) | any

/**
 * 模块格式
 */
interface IModule {
  reducer?:any | {key:string; reducer:Reducer} | {key:string; reducer:Reducer}[];
  default:IComponent;
}

/**
 * 模块加载函数
 * @param getModule 
 * @param LoadingComponent 
 * @returns 
 */
function moduleLoader(
    getModule:() => Promise<IModule>,
    LoadingComponent:IComponent = () => null,
):IComponent {
  let ComponentCache:IComponent = null;
  return function DynamicComponent(props:IRouteComponentProps) {
    const [Render, setRender] = useState<IComponent>(() => (ComponentCache || LoadingComponent));
    useEffect(() => {
      if (!ComponentCache) {
        getModule().then(({ reducer, default: Defaultomponent }) => {
          setRender(() => (Defaultomponent));
          ComponentCache = Defaultomponent;
          if (reducer) {
            mergeReducer(reducer);
          }
        });
      }
    }, []);
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Render {...props} />;
  };
}

export {
  moduleLoader,
};

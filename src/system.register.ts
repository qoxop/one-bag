
/**
 * 共享模块注册器
 * 需要借助一个特殊的 webpack loader 将 moduleMap 的内容进行填充
 */

if (window['$__combo_config']?.webpackPublicPath) {
  // @ts-ignore 设置 webpack public path
  __webpack_public_path__ = window['$__combo_config'].webpackPublicPath;
}

const moduleMap = {/*! Module-Map-Replace */};

/**
 * 将一个模块变量注册成 systemjs 模块
 * @param m
 * @returns 
 */
function getVarRegister(m: any): any[] {
  return [ [], (_export:any) => ({ setters: [], execute: () => { _export(m) } }) ]
}

const resolve = System.constructor.prototype.resolve;
const instantiate = System.constructor.prototype.instantiate;

/**
 * 自定义 Systemjs 模块路径解析
 */
System.constructor.prototype.resolve = function(id:string, parentURL:string) {
  if (moduleMap && moduleMap[id]) {
    return id;
  }
  return resolve.call(this, id, parentURL)
}

/**
 * 自定义模块加载方法
 */
System.constructor.prototype.instantiate = function (url:string, firstParentUrl:string) {
  if (moduleMap && moduleMap[url]) {
    return new Promise(function (resolve, reject) {
      if (typeof moduleMap[url] === 'function') { // 异步模块
        moduleMap[url]().then((m:any) => resolve(getVarRegister(m))).catch(reject);
      } else { // 同步模块
        resolve(getVarRegister(moduleMap[url]));
      }
    });
  }
  return instantiate.call(this, url, firstParentUrl)
}
/**
 * 模块注册器
 * @param module
 */
export const register = (module: {name: string, value: { default?: any, [key: string]: any }}) => {
  if (!moduleMap[module.name]) {
    moduleMap[module.name] = module.value;
  }
}
type IGetItemRes < T > = {
  value: T | string;
  save: (t: T) => void;
  remove: () => void;
  err?: any;
}

type IGetStringRes = IGetItemRes < string >

export type IStorageGeneratorReturnType = {
  setItem: <T = unknown>(key: string, data: T) => void;
  removeItem: (key: string) => void;
  getString: (key: string, defaultString?: string) => IGetStringRes;
  getItem: <T = unknown>(key: string, defaultValue?: T) => IGetItemRes<T>;
}

export default function storageGenerator(storage: (typeof localStorage), prefix: string): IStorageGeneratorReturnType {
  const fullKey = (key: string) => (`${prefix}-${key}`);
  /**
   * 设置一个storage项，自动添加前缀
   * @param key
   * @param data
   */
  function setItem < T = unknown > (key: string, data: T): void {
    if (typeof data === 'string') {
      storage.setItem(fullKey(key), data);
    } else {
      storage.setItem(fullKey(key), JSON.stringify(data));
    }
  }

  /**
   * 删除一个storage项，自动添加前缀
   * @param key
   * @param data
   */
  function removeItem(key: string): void {
    storage.removeItem(fullKey(key));
  }

  /**
   * 获取某个storage项的值,自动jsonParse, 自动添加前缀
   * @param key  键值
   * @param defaultValue 默认值
   */
  function getItem < T = unknown > (key: string, defaultValue ? : T): IGetItemRes < T > {
    const jsonString = storage.getItem(fullKey(key));
    const save = (data: T) => setItem(key, data);
    const remove = () => removeItem(key);
    if (!jsonString) {
      return {
        value: defaultValue,
        save,
        remove,
      };
    }
    try {
      return {
        value: JSON.parse(jsonString),
        save,
        remove,
      };
    } catch (err) {
      return {
        value: jsonString,
        save,
        remove,
        err,
      };
    }
  }

  /**
   * 从storage获取一个字符串，如果没有返回空字符串
   * @param key
   * @param defaultString
   */
  function getString(key: string, defaultString = ''): IGetStringRes {
    const str = storage.getItem(fullKey(key)) || defaultString;
    const save = (data: string) => setItem(key, data);
    const remove = () => removeItem(key);
    return {
      value: str,
      save,
      remove,
    };
  }

  return {
    setItem,
    removeItem,
    getString,
    getItem,
  };
}

/**
 * 动态 css 原子类
 */
const cache = {
    'pd': {o: {}, f: (i) => (`.pd-${i}{padding:${i}px !important;}`)},
    'pt': {o: {}, f: (i) => (`.pt-${i}{padding-top:${i}px !important;}`)},
    'pb': {o: {}, f: (i) => (`.pb-${i}{padding-bottom:${i}px !important;}`)},
    'pl': {o: {}, f: (i) => (`.pl-${i}{padding-left:${i}px !important;}`)},
    'pr': {o: {}, f: (i) => (`.pr-${i}{padding-right:${i}px !important;}`)},
    'plr': {o: {}, f: (i) => (`.plr-${i}{padding-left:${i}px !important;padding-right:${i}px !important;}`)},
    'ptb': {o: {}, f: (i) => (`.ptb-${i}{padding-top:${i}px !important;padding-bottom:${i}px !important;}`)},
    'mg': {o: {}, f: (i) => (`.mg-${i}{margin:${i}px !important;}`)},
    'mt': {o: {}, f: (i) => (`.mt-${i}{margin-top:${i}px !important;}`)},
    'mb': {o: {}, f: (i) => (`.mb-${i}{margin-bottom:${i}px !important;}`)},
    'ml': {o: {}, f: (i) => (`.ml-${i}{margin-left:${i}px !important;}`)},
    'mr': {o: {}, f: (i) => (`.mr-${i}{margin-right:${i}px !important;}`)},
    'mlr': {o: {}, f: (i) => (`.mlr-${i}{margin-left:${i}px !important;margin-right:${i}px !important;}`)},
    'mtb': {o: {}, f: (i) => (`.mtb-${i}{margin-top:${i}px !important;margin-bottom:${i}px !important;}`)},
    'h': {o: {}, f: (i) => (`.h-${i}{height: ${i}px !important;}`)},
    'min-h': {o: {}, f: (i) => (`.min-h-${i}{min-height: ${i}px !important;}`)},
    'max-h': {o: {}, f: (i) => (`.max-h-${i}{max-height: ${i}px !important;}`)},
    'hp': {o: {}, f: (i) => (`.hp-${i}{height: ${i}% !important;}`)},
    'min-hp': {o: {}, f: (i) => (`.min-hp-${i}{min-height: ${i}% !important;}`)},
    'max-hp': {o: {}, f: (i) => (`.max-hp-${i}{max-height: ${i}% !important;}`)},
    'w': {o: {}, f: (i) => (`.w-${i}{width: ${i}px !important;}`)},
    'min-w': {o: {}, f: (i) => (`.min-w-${i}{min-width: ${i}px !important;}`)},
    'max-w': {o: {}, f: (i) => (`.max-w-${i}{max-width: ${i}px !important;}`)},
    'wp': {o: {}, f: (i) => (`.wp-${i}{width: ${i}% !important;}`)},
    'min-wp': {o: {}, f: (i) => (`.min-wp-${i}{min-width: ${i}% !important;}`)},
    'max-wp': {o: {}, f: (i) => (`.max-wp-${i}{max-width: ${i}% !important;}`)},
    'top': {o: {}, f: (i) => (`.top-${i}{top:${i}px !important;}`)},
    'bottom': {o: {}, f: (i) => (`.bottom-${i}{bottom:${i}px !important;}`)},
    'left': {o: {}, f: (i) => (`.left-${i}{left:${i}px !important;}`)},
    'right': {o: {}, f: (i) => (`.right-${i}{right:${i}px !important;}`)},
    'f': {o: {}, f: (i) => (`.f${i}{font-size:${i}px !important;}`)},
    'lh': {o: {}, f: (i) => (`.lh${i}{line-height:${i}px !important;}`)},
    'lhp': {o:[], f: (i) => (`.lhp${(i + '').replace('.', '-')}{line-height:${i} !important;}`)},
}

type IConfig = {
    [k in keyof typeof cache]?: { r?: number[]; a?: number[]; };
};

/**
 * 创建 css 原子类
 * @param config
 */
export function createAtomClass(config: IConfig) {
    let cssStr = '';
    for (const key in config) {
        const item = config[key];
        const cacheItem = cache[key];
        if (!cacheItem) {
            continue;
        }
        const {r, a} = item;
        if (r && r.length > 1) {
            const [start, end, n = 1] = r;
            for (let i = (+start); i <= (+end); i += (+n)) {
                if (!cacheItem.o[i]) { // 避免重复生成样式
                    cacheItem.o[i] = 1;
                    cssStr += cacheItem.f(+i);
                }
            }
        }
        if (a && a.length) {
            for (const i of (a as number[]) ) {
                if (!cacheItem.o[i]) { // 避免重复生成样式
                    cacheItem.o[i] = 1;
                    cssStr += cacheItem.f(+i);
                }
            }
        }
    }
    let style = document.querySelector('style#dynamic-atom-css-elem');
    let needAttach = false;
    if (!style || style.tagName.toUpperCase() !== 'STYLE') {
        needAttach = true;
        style = document.createElement('style');
        style.setAttribute('id', 'dynamic-atom-css-elem');
    }
    style.appendChild(document.createTextNode(cssStr));
    if (needAttach) {
        document.head.appendChild(style);
    }
}


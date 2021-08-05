import { register } from 'src/system.register';

register.obj({
    '@one-bag/components/modal': () => import('./modal'),
    '@one-bag/components/button': () => import('./button'),
    '@one-bag/components/layout': () => import('./layout'),
    '@one-bag/components/menu': () => import('./menu')
});

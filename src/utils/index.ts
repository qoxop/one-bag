import { register } from 'src/system.register';

register.obj({
    '@system/utils/request': () => import('./request'),
})

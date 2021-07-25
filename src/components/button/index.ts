import { register } from '../../system.register';

register.obj({
    '@qoxop/react-combo/components/button': () => {
        import('antd/lib/button/style/index.js');
        return import('antd/lib/button');
    }
})

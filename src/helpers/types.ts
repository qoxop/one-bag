import { RouteComponentProps, StaticContext } from 'react-router';
import * as H from 'history';

export type IRouteProps = {
    key?:string;
    path?:string | string[];
    component:React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
    routes?:IRouteProps[] | (() => Promise<IRouteProps[]>);
    location?:H.Location;
    exact?:boolean;
    sensitive?:boolean;
    strict?:boolean;
    breadcrumbs?:string[];
};

export interface IRouteComponentProps<
    Params extends { [K in keyof Params]?:string } = unknown,
    C extends StaticContext = StaticContext,
    S = H.LocationState
> extends RouteComponentProps<Params, C, S> {
    route:IRouteProps;
}

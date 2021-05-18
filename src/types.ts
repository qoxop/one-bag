import { RouteComponentProps, StaticContext } from "react-router";
import { Reducer } from "redux";

export type UIComponent = React.ComponentType<RouteComponentProps<any, StaticContext, unknown>> | React.ComponentType<any>;

export type StandardModule = (metadata: {
  pathkey:string;
  storage: {
    local: any;
    session: any;
  },
  base?:string; // 父级路径
}) => {
  Component: UIComponent;
  reducer?: Reducer;
}

import React from 'react';
import { StandardModule } from './types';
import { AppRouter } from './utils/router';
import { ReduxProvider } from './utils/redux';

export default function App(props: {
  routes: {[path:string]: StandardModule};
  RootContainer: any;
}) {
  const {routes, RootContainer} = props;
  return <ReduxProvider>
    <RootContainer>
      <AppRouter routes={routes} />
    </RootContainer>
  </ReduxProvider>
}

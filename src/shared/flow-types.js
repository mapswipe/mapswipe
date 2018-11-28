// @flow
// type definitions. This should be safe to import everywhere

import { NavigationRoute } from 'react-navigation';

export type NavigationState = {
  index: number,
  routes: Array<NavigationRoute>,
};

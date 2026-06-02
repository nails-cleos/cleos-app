import { ActivatedRouteSnapshot } from '@angular/router';

export const getActiveRoute = <TRoute extends { firstChild?: TRoute | null }>(route: TRoute): TRoute => {
  let activeRoute = route;

  while (activeRoute.firstChild) {
    activeRoute = activeRoute.firstChild;
  }

  return activeRoute;
};

export const getActiveActivatedRoute = (snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot =>
  getActiveRoute(snapshot);

type RouterStateWithParams = {
  root: {
    params: Record<string, string>;
    firstChild?: RouterStateWithParams['root'] | null;
  };
};

export const getRouteParams = (routerState: RouterStateWithParams): Record<string, string> =>
  getActiveRoute(routerState.root).params as Record<string, string>;

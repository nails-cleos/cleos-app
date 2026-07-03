import { Injectable, Type } from '@angular/core';
import { RouterStateSnapshot } from '@angular/router';
import { MinimalRouterStateSerializer, MinimalRouterStateSnapshot, RouterStateSerializer } from '@ngrx/router-store';
import { getActiveActivatedRoute } from './router-state.utils';

export type AppRouterStateSnapshot = MinimalRouterStateSnapshot & {
  activeComponent?: Type<unknown>;
  navigationKey?: string;
};

@Injectable()
export class AppRouterStateSerializer implements RouterStateSerializer<AppRouterStateSnapshot> {
  private readonly serializer = new MinimalRouterStateSerializer();

  serialize(routerState: RouterStateSnapshot): AppRouterStateSnapshot {
    const serializedState = this.serializer.serialize(routerState);
    const activeRoute = getActiveActivatedRoute(routerState.root);

    return {
      ...serializedState,
      activeComponent: activeRoute.routeConfig?.component as Type<unknown> | undefined,
      navigationKey: activeRoute.data['navigationKey'],
    };
  }
}

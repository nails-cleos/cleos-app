import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { BlockAgendaComponent } from './block-agenda/block-agenda.component';
import { UnavailableListComponent } from './list/unavailable-list.component';
import { UnavailableComponent } from './unavailable.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { UnavailableService } from '../services/unavailable.service';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { UnavailableEffects } from '../store/effects/unavailable.effects';
import { UNAVAILABLE_FEATURE_KEY, unavailableReducer } from '../store/reducers/unavailable.reducers';
import { UnavailableNavigationEffects } from './unavailable-navigation.effects';

const providers = [
  provideFeatureTranslations('unavailable'),
  UnavailableService,
  UserService,
  provideState(UNAVAILABLE_FEATURE_KEY, unavailableReducer),
  provideEffects(UnavailableEffects, UnavailableNavigationEffects),
];

const children: Routes = [
  { path: '', component: UnavailableListComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.roomAdmin, Role.professional] } },
  { path: 'add', component: UnavailableComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.roomAdmin, Role.professional] } },
  { path: ':id', component: UnavailableComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.roomAdmin, Role.professional] } },
  { path: 'block-agenda/add', component: BlockAgendaComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.roomAdmin, Role.professional] } },
  { path: 'block-agenda/:id', component: BlockAgendaComponent, canActivate: [authGuard], data: { roles: [Role.admin, Role.roomAdmin, Role.professional] } },
];

export const UNAVAILABLE_ROUTES: Routes = [{ path: '', providers, children }];

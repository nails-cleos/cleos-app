import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { UnavailableListComponent } from './list/unavailable-list.component';
import { BlockAgendaCreatePageComponent } from './block-agenda/block-agenda-create-page.component';
import { BlockAgendaDetailsPageComponent } from './block-agenda/block-agenda-details-page.component';
import { UnavailableCreatePageComponent } from './unavailable-create-page.component';
import { UnavailableDetailsPageComponent } from './unavailable-details-page.component';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [provideFeatureTranslations('unavailable')];

const children: Routes = [
  {
    path: '',
    component: UnavailableListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.roomAdmin, Role.professional] },
  },
  {
    path: 'add',
    component: UnavailableCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.roomAdmin, Role.professional] },
  },
  {
    path: ':id',
    component: UnavailableDetailsPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.roomAdmin, Role.professional] },
  },
  {
    path: 'block-agenda/add',
    component: BlockAgendaCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.roomAdmin, Role.professional] },
  },
  {
    path: 'block-agenda/:id',
    component: BlockAgendaDetailsPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.roomAdmin, Role.professional] },
  },
];

export const UNAVAILABLE_ROUTES: Routes = [{ path: '', providers, children }];

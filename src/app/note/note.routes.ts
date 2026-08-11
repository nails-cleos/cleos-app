import { Routes } from '@angular/router';
import { Role } from '../interfaces/token';
import { authGuard } from '../services/auth-guard.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { NoteCreatePageComponent } from './note-create-page.component';
import { NoteDetailsPageComponent } from './note-details-page.component';

const providers = [provideFeatureTranslations('note')];

const children: Routes = [
  {
    path: 'add',
    component: NoteCreatePageComponent,
    canActivate: [authGuard],
    data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.roomAdmin],
    },
  },
  {
    path: ':id',
    component: NoteDetailsPageComponent,
    canActivate: [authGuard],
    data: {
      roles: [Role.admin, Role.manager, Role.professional, Role.roomAdmin],
    },
  },
];

export const NOTE_ROUTES: Routes = [{ path: '', providers, children }];

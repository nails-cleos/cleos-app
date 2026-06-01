import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { Role } from '../interfaces/token';
import { authGuard } from '../services/auth-guard.service';
import { NoteService } from '../services/note.service';
import { UserService } from '../services/user.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { NoteEffects } from '../store/effects/note.effects';
import { NOTE_FEATURE_KEY, noteReducer } from '../store/reducers/note.reducers';
import { NoteCreatePageComponent } from './note-create-page.component';
import { NoteDetailsPageComponent } from './note-details-page.component';
import { NoteNavigationEffects } from './note-navigation.effects';

const providers = [
  provideFeatureTranslations('note'),
  NoteService,
  UserService,
  provideState(NOTE_FEATURE_KEY, noteReducer),
  provideEffects(NoteEffects, NoteNavigationEffects),
];

const children: Routes = [
  {
    path: 'add',
    component: NoteCreatePageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager, Role.professional, Role.roomAdmin] },
  },
  {
    path: ':id',
    component: NoteDetailsPageComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin, Role.manager, Role.professional, Role.roomAdmin] },
  },
];

export const NOTE_ROUTES: Routes = [{ path: '', providers, children }];

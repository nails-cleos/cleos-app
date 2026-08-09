import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { DocumentListComponent } from './list/document-list.component';
import { provideFeatureTranslations } from '../shared/feature-providers';

const providers = [provideFeatureTranslations('document')];

const children: Routes = [
  {
    path: '',
    component: DocumentListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.admin] },
  },
];

export const DOCUMENT_ROUTES: Routes = [{ path: '', providers, children }];

import { Routes } from '@angular/router';
import { authGuard } from '../services/auth-guard.service';
import { Role } from '../interfaces/token';
import { DocumentListComponent } from './list/document-list.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { DocumentService } from '../services/document.service';
import { OfficeService } from '../services/office.service';
import { provideFeatureTranslations } from '../shared/feature-providers';
import { DocumentEffects } from '../store/effects/document.effects';
import { DOCUMENT_FEATURE_KEY, documentReducer } from '../store/reducers/document.reducers';
import { DocumentNavigationEffects } from './document-navigation.effects';

const providers = [
  provideFeatureTranslations('document'),
  DocumentService,
  OfficeService,
  provideState(DOCUMENT_FEATURE_KEY, documentReducer),
  provideEffects(DocumentEffects, DocumentNavigationEffects),
];

const children: Routes = [
  { path: '', component: DocumentListComponent, canActivate: [authGuard], data: { roles: [Role.admin] } },
];

export const DOCUMENT_ROUTES: Routes = [{ path: '', providers, children }];

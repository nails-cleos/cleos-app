import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { cleanMain, getAllCatalogue, setCurrentLang } from '../store/main.actions';
import { cleanCatalogue, getAllCatalogs } from '../store/catalogue.actions';
import { MainContentService } from '../services/main-content.service';
import { navigation } from '../store/router-navigation.operator';
import { CatalogComponent } from './catalog/catalog.component';
import { MainContentComponent } from './main-content/main-content.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { MainTreatmentComponent } from './treatment/main-treatment.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';

@Injectable()
export class MainNavigationEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly mainContent: MainContentService = inject(MainContentService);

  loadHomePage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(MainContentComponent, {
        run: ({ payload }) => {
          this.mainContent.configure(false, 'close', true);
          return [
            cleanMain(),
            setCurrentLang({ lang: this.getLangFromUrl(payload.routerState.url) }),
            getAllCatalogue(),
          ];
        },
      }),
    ));

  loadCatalogPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(CatalogComponent, {
        run: ({ payload }) => {
          this.mainContent.configure(false, 'open');
          return [
            setCurrentLang({ lang: this.getLangFromUrl(payload.routerState.url) }),
            cleanCatalogue(),
            getAllCatalogs(),
          ];
        },
      }),
    ));

  loadTreatmentPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(MainTreatmentComponent, {
        run: ({ payload }) => {
          this.mainContent.configure(false, 'open');
          return [setCurrentLang({ lang: this.getLangFromUrl(payload.routerState.url) })];
        },
      }),
    ));

  loadPrivacyPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(PrivacyComponent, {
        run: ({ payload }) => {
          this.mainContent.configure(false, 'open');
          return [setCurrentLang({ lang: this.getLangFromUrl(payload.routerState.url) })];
        },
      }),
    ));

  loadTermsPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROUTER_NAVIGATED),
      navigation(TermsAndConditionsComponent, {
        run: ({ payload }) => {
          this.mainContent.configure(false, 'open');
          return [setCurrentLang({ lang: this.getLangFromUrl(payload.routerState.url) })];
        },
      }),
    ));

  private getLangFromUrl(url: string): string {
    return url.split('?')[0].split('#')[0].split('/')[1] || 'en-GB';
  }
}

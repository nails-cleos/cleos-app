import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { RouterNavigatedAction, ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { cleanMain, getAllCatalogue, setCurrentLang } from '../store/actions/main.actions';
import { MainContentService } from '../services/main-content.service';
import { CatalogComponent } from './catalog/catalog.component';
import { MainContentComponent } from './main-content/main-content.component';
import { MainNavigationEffects } from './main-navigation.effects';
import { PrivacyComponent } from './privacy/privacy.component';

describe('MainNavigationEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: MainNavigationEffects;
  let mainContentSpy: jasmine.SpyObj<MainContentService>;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    mainContentSpy = jasmine.createSpyObj<MainContentService>('MainContentService', ['configure']);

    TestBed.configureTestingModule({
      providers: [
        MainNavigationEffects,
        provideMockActions(() => actions$),
        { provide: MainContentService, useValue: mainContentSpy },
      ],
    });

    effects = TestBed.inject(MainNavigationEffects);
  });

  const routerNavigated = (url: string, activeComponent: unknown): RouterNavigatedAction<any> =>
    ({
      type: ROUTER_NAVIGATED,
      payload: {
        event: {} as any,
        routerState: { url, activeComponent } as any,
      },
    }) as RouterNavigatedAction<any>;

  it('should configure and load the home page state', async () => {
    actions$.next(routerNavigated('/en-GB/home', MainContentComponent));

    const result = await firstValueFrom(
      effects.loadHomePage$.pipe(take(3), toArray()),
    );

    expect(result).toEqual([
      cleanMain(),
      setCurrentLang({ lang: 'en-GB' }),
      getAllCatalogue(),
    ]);
    expect(mainContentSpy.configure).toHaveBeenCalledWith(false, 'close', true);
  });

  it('should configure and load the catalog page state', async () => {
    actions$.next(routerNavigated('/nl/home/catalogs', CatalogComponent));

    const result = await firstValueFrom(
      effects.loadCatalogPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([
      setCurrentLang({ lang: 'nl' }),
    ]);
    expect(mainContentSpy.configure).toHaveBeenCalledWith(false, 'open');
  });

  it('should configure legal pages and keep current language in sync', async () => {
    actions$.next(routerNavigated('/es/home/privacy', PrivacyComponent));

    const result = await firstValueFrom(
      effects.loadPrivacyPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([
      setCurrentLang({ lang: 'es' }),
    ]);
    expect(mainContentSpy.configure).toHaveBeenCalledWith(false, 'open');
  });
});

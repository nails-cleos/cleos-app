import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ROUTER_NAVIGATED, RouterNavigatedAction } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { cleanTreatment, getAllColors, getAllTreatmentsGroup } from '../store/actions/treatment.actions';
import { TreatmentListComponent } from './list/treatment-list.component';
import { TreatmentGroupSortingComponent } from './sorting/treatment-group-sorting.component';
import { TreatmentSortingComponent } from './sorting/treatment-sorting.component';
import { TreatmentCreatePageComponent } from './treatment-create-page.component';
import { TreatmentEditPageComponent } from './treatment-edit-page.component';
import { TreatmentNavigationEffects } from './treatment-navigation.effects';
import { TreatmentViewPageComponent } from './treatment-view-page.component';

describe('TreatmentNavigationEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: TreatmentNavigationEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);

    TestBed.configureTestingModule({
      providers: [
        TreatmentNavigationEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject(TreatmentNavigationEffects);
  });

  const routerNavigated = (activeComponent: unknown): RouterNavigatedAction<any> =>
    ({
      type: ROUTER_NAVIGATED,
      payload: {
        event: {} as any,
        routerState: {
          activeComponent,
          root: { params: {}, firstChild: undefined, queryParams: {} },
        } as any,
      },
    }) as RouterNavigatedAction<any>;

  it('should clean treatment state on the list page', async () => {
    actions$.next(routerNavigated(TreatmentListComponent));

    const result = await firstValueFrom(
      effects.loadTreatmentListPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanTreatment()]);
  });

  it('should load treatment group sorting page dependencies', async () => {
    actions$.next(routerNavigated(TreatmentGroupSortingComponent));

    const result = await firstValueFrom(
      effects.loadTreatmentGroupSortingPage$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([cleanTreatment(), getAllTreatmentsGroup()]);
  });

  it('should load treatment create page dependencies', async () => {
    actions$.next(routerNavigated(TreatmentCreatePageComponent));

    const result = await firstValueFrom(
      effects.loadTreatmentCreatePage$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([cleanTreatment(), getAllColors()]);
  });

  it('should load treatment edit page dependencies', async () => {
    actions$.next(routerNavigated(TreatmentEditPageComponent));

    const result = await firstValueFrom(
      effects.loadTreatmentEditPage$.pipe(take(2), toArray()),
    );

    expect(result).toEqual([cleanTreatment(), getAllColors()]);
  });

  it('should clean treatment state on the treatment view page', async () => {
    actions$.next(routerNavigated(TreatmentViewPageComponent));

    const result = await firstValueFrom(
      effects.loadTreatmentViewPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanTreatment()]);
  });

  it('should clean treatment state on the treatment sorting page', async () => {
    actions$.next(routerNavigated(TreatmentSortingComponent));

    const result = await firstValueFrom(
      effects.loadTreatmentSortingPage$.pipe(take(1), toArray()),
    );

    expect(result).toEqual([cleanTreatment()]);
  });
});

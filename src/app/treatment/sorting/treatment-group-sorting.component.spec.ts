import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { clean, getAllTreatmentsGroup, sortGroupTreatment } from '../../store/treatment.actions';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { TreatmentGroupSortingComponent } from './treatment-group-sorting.component';
import { TranslateModule } from '@ngx-translate/core';
import { ISorted } from '../../util/drag-drop-sorting/drag-drop-sorting.component';

describe('TreatmentGroupSortingComponent', () => {
  let component: TreatmentGroupSortingComponent;
  let fixture: ComponentFixture<TreatmentGroupSortingComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<any>>;

  beforeEach(async () => {
    state$ = new Subject();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [TreatmentGroupSortingComponent, TranslateModule.forRoot()],
      providers: [{ provide: Store, useValue: storeSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentGroupSortingComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => state$.complete());

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should dispatch Clean and GetAllTreatmentsGroup on init', () => {
    fixture.detectChanges();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllTreatmentsGroup());
  });

  it('should dispatch SortGroupTreatment when sorted() is called', () => {
    const groups: ISorted[] = [{ key: '1', order: 1 }];
    component.sorted(groups);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(sortGroupTreatment({ groups }));
  });

  it('should update items when state emits data', () => {
    fixture.detectChanges();
    const mockGroups: ITreatmentGroupAll[] = [
      { id: '1', name: 'Group 1', order: 2 },
      { id: '2', name: 'Group 2', order: 1 },
    ];

    state$.next({ data: mockGroups });
    fixture.detectChanges();

    expect(component.items?.length).toBe(2);
    expect(component.items?.[0].key).toBe('1');
    expect(component.items?.[1].key).toBe('2');
  });

  it('should clean and get treatments again if response is true', () => {
    fixture.detectChanges();
    state$.next({ response: true, data: [] });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllTreatmentsGroup());
  });

  it('should unsubscribe on destroy', () => {
    fixture.detectChanges();
    const spyUnsub = spyOn((component as any).subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(spyUnsub).toHaveBeenCalled();
  });
});

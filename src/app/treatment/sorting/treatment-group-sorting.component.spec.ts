import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreatmentGroupSortingComponent } from './treatment-group-sorting.component';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { ItemSorting } from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { TranslateModule } from '@ngx-translate/core';
import { TreatmentState } from '../../store/reducers/treatment.reducers';
import { getAllTreatmentsGroup, sortGroupTreatment } from '../../store/actions/treatment.actions';

describe('TreatmentGroupSortingComponent', () => {
  let component: TreatmentGroupSortingComponent;
  let fixture: ComponentFixture<TreatmentGroupSortingComponent>;

  let treatmentGroupList$: Subject<ITreatmentGroupAll[]>;
  let response$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<TreatmentState>>;

  const mockTreatmentGroupList: ITreatmentGroupAll[] = [
    {
      id: '1',
      name: 'TreatmentGroup 1',
      description: '1 treatmentGroup',
      order: 1,
    },
    {
      id: '2',
      name: 'TreatmentGroup 2',
      description: '2 treatmentGroup',
      order: 2,
    },
  ];

  beforeEach(async () => {
    treatmentGroupList$ = new Subject<ITreatmentGroupAll[]>();
    response$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);

    // Define order of .pipe() calls
    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return treatmentGroupList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [TreatmentGroupSortingComponent, TranslateModule.forRoot()],
      providers: [{ provide: Store, useValue: storeSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentGroupSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    treatmentGroupList$.complete();
    response$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute itemsSignal from treatmentGroupListSignal', () => {
    treatmentGroupList$.next(mockTreatmentGroupList);
    fixture.detectChanges();

    const result = component.itemsSignal();

    expect(result).toEqual([
      new ItemSorting('1', 'TreatmentGroup 1', 1),
      new ItemSorting('2', 'TreatmentGroup 2', 2),
    ]);
  });

  it('should dispatch sortTreatmentGroup when sorted() is called', () => {
    const sorted = [
      { order: 1, key: 'key1' },
      { order: 2, key: 'key2' },
    ];

    component.sorted(sorted);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(sortGroupTreatment({ groups: sorted }));
  });

  it('should dispatch getTreatmentGroupList when responseSignal emits', () => {
    storeSpy.dispatch.calls.reset();

    response$.next({ success: true });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllTreatmentsGroup());
  });
});

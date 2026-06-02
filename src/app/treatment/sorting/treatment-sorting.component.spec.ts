import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreatmentSortingComponent } from './treatment-sorting.component';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { ITreatmentAll, ITreatmentGroupAll } from '../../interfaces/treatment';
import { ItemSorting } from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { TranslateModule } from '@ngx-translate/core';
import { TreatmentState } from '../../store/reducers/treatment.reducers';
import { getTreatmentGroup, sortTreatment } from '../../store/actions/treatment.actions';
import { ServiceType } from '../../interfaces/room';

describe('TreatmentSortingComponent', () => {
  let component: TreatmentSortingComponent;
  let fixture: ComponentFixture<TreatmentSortingComponent>;

  let treatmentGroup$: BehaviorSubject<ITreatmentGroupAll | undefined>;
  let response$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store<TreatmentState>>;

  const mockTreatmentList: ITreatmentAll[] = [
    {
      id: '1',
      key: 'Key 1',
      name: 'Treatment 1',
      description: '1 treatment',
      duration: 'PT15M',
      type: ServiceType.treatment,
      price: 15,
      order: 1,
      group: {
        id: 'g1',
        name: 'Group 1',
      },
    },
    {
      id: '2',
      key: 'Key 2',
      name: 'Treatment 2',
      description: '2 treatment',
      duration: 'PT1H30M',
      type: ServiceType.treatment,
      price: 35,
      order: 2,
      group: {
        id: 'g1',
        name: 'Group 1',
      },
    },
  ];

  beforeEach(async () => {
    treatmentGroup$ = new BehaviorSubject<ITreatmentGroupAll | undefined>(undefined);
    response$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return treatmentGroup$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [TreatmentSortingComponent, TranslateModule.forRoot()],
      providers: [{ provide: Store, useValue: storeSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentSortingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'g1');
    fixture.detectChanges();
  });

  afterEach(() => {
    treatmentGroup$.complete();
    response$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute itemsSignal from treatmentGroupListSignal', () => {
    const treatmentGroup: ITreatmentGroupAll = {
      id: 'g1',
      name: 'Group 1',
      treatments: mockTreatmentList,
    };
    treatmentGroup$.next(treatmentGroup);
    fixture.detectChanges();

    const result = component.itemsSignal();

    expect(result).toEqual([
      new ItemSorting('1', 'Treatment 1', 1),
      new ItemSorting('2', 'Treatment 2', 2),
    ]);
  });

  it('should dispatch sortTreatment when sorted() is called', () => {
    const sorted = [
      { order: 1, key: 'key1' },
      { order: 2, key: 'key2' },
    ];

    component.sorted(sorted);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(sortTreatment({ treatments: sorted }));
  });

  it('should dispatch getTreatmentList when responseSignal emits', () => {
    storeSpy.dispatch.calls.reset();

    response$.next({ success: true });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getTreatmentGroup({ id: 'g1', path: 'sorting' }));
  });
});

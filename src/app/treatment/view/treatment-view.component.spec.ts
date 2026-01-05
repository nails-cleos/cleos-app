import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TreatmentViewComponent } from './treatment-view.component';
import { Store } from '@ngrx/store';
import { getAllTreatmentsHistory, treatmentSelected } from '../../store/treatment.actions';
import { TranslateModule } from '@ngx-translate/core';
import { ITreatmentAll, ITreatmentGroupAll } from '../../interfaces/treatment';
import { ServiceType } from '../../interfaces/room';

describe('TreatmentViewComponent', () => {
  let component: TreatmentViewComponent;
  let fixture: ComponentFixture<TreatmentViewComponent>;
  let storeSpy: jasmine.SpyObj<Store<any>>;

  const treatmentId$ = new BehaviorSubject('t1');
  const treatmentGroup$ = new BehaviorSubject<any>(undefined);
  const histories$ = new BehaviorSubject<any>(undefined);

  const mockTreatment: ITreatmentAll = {
    key: '',
    id: 't1',
    name: 'Mock Treatment',
    price: 100,
    primary: true,
    group: {
      id: 'g1',
      name: 'Mock Group',
    },
    type: ServiceType.treatment,
    duration: '00:30',
  };

  const mockTreatmentGroup: ITreatmentGroupAll = {
    name: 'Group 1',
    id: 'group1',
    treatments: [
      {
        id: 't1', name: 'Treatment 1',
        group: { id: 'group1', name: 'Group 1' },
        duration: '',
        key: '',
        price: 0,
        type: ServiceType.treatment,
      },
      {
        id: 't2', name: 'Treatment 2',
        group: { id: 'group1', name: 'Group 1' },
        duration: '',
        key: '',
        price: 0,
        type: ServiceType.treatment,
      },
    ],
  };

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return treatmentId$.asObservable();
        case 2:
          return treatmentGroup$.asObservable();
        case 3:
          return histories$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [TreatmentViewComponent, TranslateModule.forRoot()],
      providers: [{ provide: Store, useValue: storeSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute treatmentGroup with showHistory', () => {
    treatmentGroup$.next({
      id: 'group1',
      treatments: [
        { id: 't1', name: 'Treatment 1' },
        { id: 't2', name: 'Treatment 2' },
      ],
    });
    histories$.next([mockTreatment]);
    component['treatmentId'] = 't1';
    fixture.detectChanges();
    const group = component.treatmentGroup();
    expect(group?.treatments?.find(t => t.id === 't1')?.showHistory).toBe(true);
    expect(group?.treatments?.find(t => t.id === 't1')?.history).toEqual([mockTreatment]);
  });

  it('edit() should dispatch treatmentSelected', () => {
    treatmentGroup$.next(mockTreatmentGroup);
    component.edit();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(treatmentSelected({
      selected: mockTreatmentGroup,
      path: 'edit',
    }));
  });

  it('getHistory() should dispatch getAllTreatmentsHistory', () => {
    treatmentGroup$.next({
      id: 'group1',
      treatments: [
        { id: 't1', name: 'Treatment 1' },
        { id: 't2', name: 'Treatment 2' },
      ],
    });
    fixture.detectChanges();
    component.getHistory('t2', 1);
    expect(component['treatmentId']).toBe('t2');
    expect(component.expandedPanelIndex).toBe(1);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllTreatmentsHistory({
      id: 'group1',
      treatmentId: 't2',
    }));
  });
});

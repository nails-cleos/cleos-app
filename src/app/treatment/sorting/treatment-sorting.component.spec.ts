import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreatmentSortingComponent } from './treatment-sorting.component';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { clean, getTreatmentGroup, sortTreatment } from '../../store/treatment.actions';
import { ITreatmentAll } from '../../interfaces/treatment';
import { Store } from '@ngrx/store';
import { ServiceType } from '../../interfaces/room';
import { ISorted } from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { AppState } from '../../store/app.states';

describe('TreatmentSortingComponent', () => {
  let component: TreatmentSortingComponent;
  let fixture: ComponentFixture<TreatmentSortingComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;

  beforeEach(async () => {
    state$ = new Subject();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [TreatmentSortingComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '123' } } } },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentSortingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch Clean and GetTreatmentGroup on init', () => {
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: '[Treatment] Clean' }),
    );
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: '[Treatment] Find treatment group by id', id: '123', path: 'sorting' }),
    );
  });

  it('should dispatch SortTreatment when sorted() is called', () => {
    const treatments: ISorted[] = [{ key: 'treatment 1', order: 1 }];
    component.sorted(treatments);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(sortTreatment({ treatments }));
  });

  it('should update items when state emits treatments', () => {
    fixture.detectChanges();

    const treatments: ITreatmentAll[] = [{
      id: '1',
      key: 'key1',
      name: 'Key 1',
      duration: 'PT30M',
      order: 5,
      group: { id: '1', name: 'Group 1' },
      price: 10,
      type: ServiceType.treatment,
    }];
    state$.next({ response: false, selected: { treatments } });

    expect(component.items?.length).toBe(1);
    expect(component.items?.[0].name).toBe('Key 1');
  });

  it('should call clean and getTreatments again when response = true', () => {
    fixture.detectChanges();

    state$.next({ response: true, selected: { treatments: [] } });

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getTreatmentGroup({ id: '123', path: 'sorting' }));
  });

  it('should unsubscribe on destroy', () => {
    const subSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    (component as any).subscription = subSpy;

    component.ngOnDestroy();
    expect(subSpy.unsubscribe).toHaveBeenCalled();
  });
});

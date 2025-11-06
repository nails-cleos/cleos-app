import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalSortingComponent } from './additional-sorting.component';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { IAdditionalAll } from '../../interfaces/additional';
import { ItemSorting } from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { ServiceType } from '../../interfaces/room';
import { sortAdditional, clean } from '../../store/additional.actions';
import { AppState } from '../../store/app.states';

describe('AdditionalSortingComponent', () => {
  let component: AdditionalSortingComponent;
  let fixture: ComponentFixture<AdditionalSortingComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;

  const mockAdditionalList: IAdditionalAll[] = [
    {
      id: '1',
      key: 'Key 1',
      name: 'Additional 1',
      description: '1 additional',
      duration: 'PT15M',
      type: ServiceType.additional,
      price: 15,
    },
    {
      id: '2',
      key: 'Key 2',
      name: 'Additional 2',
      description: '2 additional',
      duration: 'PT1H30M',
      type: ServiceType.additional,
      price: 35,
    },
    {
      id: '3',
      key: 'Key 3',
      name: 'Additional 3',
      description: '3 additional',
      duration: 'PT45M',
      type: ServiceType.additional,
      price: 20,
    },
  ];

  beforeEach(async () => {
    state$ = new Subject();

    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [AdditionalSortingComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => state$.complete());

  it('should create', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
  });

  it('should dispatch Clean action on initialization', () => {
    // Reset to check only the initialization call
    storeSpy.dispatch.calls.reset();
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should call getAdditionalList on initialization', () => {
    spyOn(component as any, 'getAdditionalList');

    component.ngOnInit();

    expect(component['getAdditionalList']).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();
    const subscription = component['subscription'];
    spyOn(subscription!, 'unsubscribe');

    component.ngOnDestroy();

    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });

  it('should dispatch SortAdditional action when sorted is called', () => {
    const sorted = [
      { order: 1, key: 'key 1' },
      { order: 2, key: 'key 2' },
    ];

    component.sorted(sorted);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(sortAdditional({ additionalList: sorted }));
  });

  it('should update items when state changes', () => {
    state$.next({
      data: mockAdditionalList,
    });
    expect(component.items).toEqual(mockAdditionalList.map((additional: IAdditionalAll) => new ItemSorting(
      additional.id, additional.name, additional.order)));
  });

  it('should clean and get additional list on response', () => {
    spyOn(component as any, 'clean');
    spyOn(component as any, 'getAdditionalList');

    state$.next({
      response: true,
    });

    expect(component['clean']).toHaveBeenCalled();
    expect(component['getAdditionalList']).toHaveBeenCalled();
  });
});

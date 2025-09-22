import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalSortingComponent } from './additional-sorting.component';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromActionsAdditional from '../../store/additional.actions';
import { IAdditionalAll } from '../../interfaces/additional';
import { ItemSorting } from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { ServiceType } from '../../interfaces/room';

describe('AdditionalSortingComponent', () => {
  let component: AdditionalSortingComponent;
  let fixture: ComponentFixture<AdditionalSortingComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let stateSubject: Subject<any>;

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
    stateSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [AdditionalSortingComponent],
      providers: [
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch Clean action on initialization', () => {
    // Reset to check only the initialization call
    mockStore.dispatch.calls.reset();
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsAdditional.Clean));
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

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsAdditional.SortAdditional));
  });

  it('should update items when state changes', () => {
    stateSubject.next({
      data: mockAdditionalList,
    });
    expect(component.items).toEqual(mockAdditionalList.map((additional: IAdditionalAll) => new ItemSorting(
      additional.id, additional.name, additional.order)));
  });

  it('should clean and get additional list on response', () => {
    spyOn(component as any, 'clean');
    spyOn(component as any, 'getAdditionalList');

    stateSubject.next({
      response: true,
    });

    expect(component['clean']).toHaveBeenCalled();
    expect(component['getAdditionalList']).toHaveBeenCalled();
  });
});

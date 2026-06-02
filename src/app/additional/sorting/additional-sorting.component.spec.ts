import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdditionalSortingComponent } from './additional-sorting.component';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { IAdditionalAll } from '../../interfaces/additional';
import { ItemSorting } from '../../util/drag-drop-sorting/drag-drop-sorting.component';
import { getAdditionalList, sortAdditional } from '../../store/actions/additional.actions';
import { ServiceType } from '../../interfaces/room';
import { TranslateModule } from '@ngx-translate/core';
import { AdditionalState } from '../../store/reducers/additional.reducers';

describe('AdditionalSortingComponent', () => {
  let component: AdditionalSortingComponent;
  let fixture: ComponentFixture<AdditionalSortingComponent>;

  let additionalList$: Subject<IAdditionalAll[]>;
  let response$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AdditionalState>>;

  const mockAdditionalList: IAdditionalAll[] = [
    {
      id: '1',
      key: 'Key 1',
      name: 'Additional 1',
      description: '1 additional',
      duration: 'PT15M',
      type: ServiceType.additional,
      price: 15,
      order: 1,
    },
    {
      id: '2',
      key: 'Key 2',
      name: 'Additional 2',
      description: '2 additional',
      duration: 'PT1H30M',
      type: ServiceType.additional,
      price: 35,
      order: 2,
    },
  ];

  beforeEach(async () => {
    additionalList$ = new Subject<IAdditionalAll[]>();
    response$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);

    // Define order of .pipe() calls
    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return additionalList$.asObservable();
        case 2:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [AdditionalSortingComponent, TranslateModule.forRoot()],
      providers: [{ provide: Store, useValue: storeSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    additionalList$.complete();
    response$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute itemsSignal from additionalListSignal', () => {
    additionalList$.next(mockAdditionalList);
    fixture.detectChanges();

    const result = component.itemsSignal();

    expect(result).toEqual([
      new ItemSorting('1', 'Additional 1', 1),
      new ItemSorting('2', 'Additional 2', 2),
    ]);
  });

  it('should dispatch sortAdditional when sorted() is called', () => {
    const sorted = [
      { order: 1, key: 'key1' },
      { order: 2, key: 'key2' },
    ];

    component.sorted(sorted);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(sortAdditional({ additionalList: sorted }));
  });

  it('should dispatch getAdditionalList when responseSignal emits', () => {
    storeSpy.dispatch.calls.reset();

    response$.next({ success: true });
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAdditionalList());
  });
});

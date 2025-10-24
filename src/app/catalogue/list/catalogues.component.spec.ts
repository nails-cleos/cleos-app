import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef, QueryList } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ICatalogueAll } from '../../interfaces/catalogue';
import {
  catalogueSelected,
  clean,
  deleteCatalogue,
  getAllCatalogues,
  updateCatalogueOrder,
} from '../../store/catalogue.actions';
import { CataloguesComponent } from './catalogues.component';
import { AppState } from '../../store/app.states';

describe('CataloguesComponent', () => {
  let component: CataloguesComponent;
  let fixture: ComponentFixture<CataloguesComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let dialogSpy: jasmine.Spy<any>;

  const mockCatalogues: ICatalogueAll[] = [
    {
      id: '1',
      name: 'Red Catalogue',
      description: 'Red catalogue description',
      order: 1,
      contentType: 'image/jpeg',
      blob: 'base64-blob-data',
      image: 'data:image/jpeg;base64,base64-blob-data',
      home: true,
      catalog: true,
    },
    {
      id: '2',
      name: 'Blue Catalogue',
      description: 'Blue catalogue description',
      order: 2,
      contentType: 'image/png',
      blob: 'base64-blob-data-2',
      image: 'data:image/jpeg;base64,base64-blob-data-2',
      home: false,
      catalog: true,
    },
  ];

  beforeEach(async () => {
    state$ = new Subject();

    const paramMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: paramMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    breakpointObserverSpy.observe.and.returnValue(state$.asObservable());
    paramMapSpy.get.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [CataloguesComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CataloguesComponent);
    component = fixture.componentInstance;

    dialogSpy = spyOn(component.dialog, 'open');
  });

  afterEach(() => state$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty catalogues array', () => {
    expect(component.catalogues).toEqual([]);
  });

  it('should have isHandset$ observable defined', () => {
    expect(component.isHandset$).toBeDefined();
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
  });

  it('should dispatch GetAllCatalogues action on initialization', () => {
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllCatalogues());
  });

  it('should update catalogues when state changes with data', () => {
    component.ngOnInit();

    state$.next({
      data: mockCatalogues,
    });

    expect(component.catalogues).toEqual(mockCatalogues);
  });

  it('should update catalogues with image data when blob is present', () => {
    const cataloguesWithBlob = [
      {
        ...mockCatalogues[0],
        blob: 'test-blob-data',
      },
    ];

    component.ngOnInit();

    state$.next({
      data: cataloguesWithBlob,
    });

    expect(component.catalogues[0].image).toBe('data:image/jpeg;base64,test-blob-data');
  });

  it('should clean and get catalogues on response', () => {
    spyOn(component as any, 'clean');
    spyOn(component as any, 'getCatalogues');

    component.ngOnInit();

    state$.next({
      response: true,
    });

    expect(component['clean']).toHaveBeenCalled();
    expect(component['getCatalogues']).toHaveBeenCalled();
  });

  it('should dispatch CatalogueSelected action when edit is called', () => {
    const testCatalogue = mockCatalogues[0];

    component.edit(testCatalogue);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(catalogueSelected({ selected: testCatalogue }));
  });

  it('should dispatch UpdateCatalogueOrder action when finish is called', () => {
    component.catalogues = mockCatalogues;

    void component.finish;

    expect(storeSpy.dispatch).toHaveBeenCalledWith(updateCatalogueOrder({ catalogues: mockCatalogues }));
  });

  it('should handle drag and drop correctly', () => {
    component.catalogues = [...mockCatalogues];
    const dragDropEvent = {
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<{ title: string; poster: string }[]>;

    component.drop(dragDropEvent);

    expect(component.catalogues[0]).toEqual(mockCatalogues[1]);
    expect(component.catalogues[1]).toEqual(mockCatalogues[0]);
  });

  it('should unsubscribe from subscription on destroy', () => {
    const subscription = jasmine.createSpy('subscription');
    component['subscription'] = { unsubscribe: subscription } as any;

    component.ngOnDestroy();

    expect(subscription).toHaveBeenCalled();
  });

  it('should handle missing subscription on destroy', () => {
    component['subscription'] = undefined;

    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should set up drops array after view init', () => {
    const mockDropList = {} as CdkDropList;
    const mockQueryList = {
      changes: state$.asObservable(),
      toArray: jasmine.createSpy('toArray').and.returnValue([mockDropList]),
    } as unknown as QueryList<CdkDropList>;

    component.dropsQuery = mockQueryList;

    component.ngAfterViewInit();

    // Use Promise.resolve to wait for the async operation
    return Promise.resolve().then(() => {
      expect(component.drops).toEqual([mockDropList]);
    });
  });

  it('should update drops array when query changes', () => {
    const mockDropList1 = {} as CdkDropList;
    const mockDropList2 = {} as CdkDropList;
    const mockQueryList = {
      changes: state$.asObservable(),
      toArray: jasmine.createSpy('toArray').and.returnValue([mockDropList1, mockDropList2]),
    } as unknown as QueryList<CdkDropList>;

    component.dropsQuery = mockQueryList;
    component.ngAfterViewInit();

    state$.next(null);

    expect(component.drops).toEqual([mockDropList1, mockDropList2]);
  });


  it('should select catalogue state in constructor', () => {
    expect(storeSpy.select).toHaveBeenCalled();
  });

  it('should handle state with no data gracefully', () => {
    component.ngOnInit();

    state$.next({
      data: null,
    });

    expect(component.catalogues).toEqual([]);
  });

  it('should handle empty catalogues array', () => {
    component.ngOnInit();

    state$.next({
      data: [],
    });

    expect(component.catalogues).toEqual([]);
  });

  it('should call delete method without errors', () => {
    component.ngOnInit();
    const testCatalogue = mockCatalogues[0];

    dialogSpy.and.returnValue({
      afterClosed: () => of(testCatalogue),
    });

    component.delete(testCatalogue);

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'CATALOGUE.DELETED.TITLE',
          content: 'CATALOGUE.DELETED.CONTENT',
          value: testCatalogue,
        },
      }));

    expect(storeSpy.dispatch).toHaveBeenCalledWith(deleteCatalogue(
      { id: testCatalogue.id!, name: testCatalogue.name! },
    ));
  });
});

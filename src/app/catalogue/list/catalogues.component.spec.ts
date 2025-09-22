import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef, QueryList } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ActivatedRoute } from '@angular/router';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as fromActionsCatalogue from '../../store/catalogue.actions';
import { CataloguesComponent } from './catalogues.component';

describe('CataloguesComponent', () => {
  let component: CataloguesComponent;
  let fixture: ComponentFixture<CataloguesComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let stateSubject: Subject<any>;

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
    stateSubject = new Subject();

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open'], {
      openDialogs: [],
      afterOpened: new Subject(),
      afterAllClosed: new Subject(),
    });
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: {}, queryParams: {} },
      params: new Subject(),
      queryParams: new Subject(),
    });

    mockStore.select.and.returnValue(stateSubject.asObservable());
    mockBreakpointObserver.observe.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        CataloguesComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
        DragDropModule,
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CataloguesComponent);
    component = fixture.componentInstance;
  });

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

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsCatalogue.Clean));
  });

  it('should dispatch GetAllCatalogues action on initialization', () => {
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsCatalogue.GetAllCatalogues));
  });

  it('should update catalogues when state changes with data', () => {
    component.ngOnInit();

    stateSubject.next({
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

    stateSubject.next({
      data: cataloguesWithBlob,
    });

    expect(component.catalogues[0].image).toBe('data:image/jpeg;base64,test-blob-data');
  });

  it('should clean and get catalogues on response', () => {
    spyOn(component as any, 'clean');
    spyOn(component as any, 'getCatalogues');

    component.ngOnInit();

    stateSubject.next({
      response: true,
    });

    expect(component['clean']).toHaveBeenCalled();
    expect(component['getCatalogues']).toHaveBeenCalled();
  });

  it('should dispatch CatalogueSelected action when edit is called', () => {
    const testCatalogue = mockCatalogues[0];

    component.edit(testCatalogue);

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsCatalogue.CatalogueSelected));
  });

  it('should call delete method without errors', () => {
    const testCatalogue = mockCatalogues[0];

    expect(() => component.delete(testCatalogue)).not.toThrow();
  });

  it('should dispatch UpdateCatalogueOrder action when finish is called', () => {
    component.catalogues = mockCatalogues;

    void component.finish;

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsCatalogue.UpdateCatalogueOrder));
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
      changes: stateSubject.asObservable(),
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
      changes: stateSubject.asObservable(),
      toArray: jasmine.createSpy('toArray').and.returnValue([mockDropList1, mockDropList2]),
    } as unknown as QueryList<CdkDropList>;

    component.dropsQuery = mockQueryList;
    component.ngAfterViewInit();

    stateSubject.next(null);

    expect(component.drops).toEqual([mockDropList1, mockDropList2]);
  });


  it('should select catalogue state in constructor', () => {
    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should handle state with no data gracefully', () => {
    component.ngOnInit();

    stateSubject.next({
      data: null,
    });

    expect(component.catalogues).toEqual([]);
  });

  it('should handle empty catalogues array', () => {
    component.ngOnInit();

    stateSubject.next({
      data: [],
    });

    expect(component.catalogues).toEqual([]);
  });
});
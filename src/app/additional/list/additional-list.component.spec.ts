import { signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

import { IAdditional } from '../additional';
import { MOBILE_PAGE_SIZE, PAGE_SIZE } from '../../interfaces/pagination';
import { AdditionalStore } from '../../store/additional.store';
import { AdditionalListComponent } from './additional-list.component';

describe('AdditionalListComponent', () => {
  let component: AdditionalListComponent;
  let fixture: ComponentFixture<AdditionalListComponent>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let routerSpy: jasmine.SpyObj<Router>;
  let translate: TranslateService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let additionalStoreSpy: {
    data: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadPage: jasmine.Spy;
    clearResponse: jasmine.Spy;
    delete: jasmine.Spy;
  };

  const mockAdditional: IAdditional[] = [
    { id: '1', name: 'Additional 1', description: 'Desc 1', duration: 'PT15M' },
    { id: '2', name: 'Additional 2', description: 'Desc 2', duration: 'PT30M' },
  ];

  const mockPagination = {
    content: mockAdditional,
    totalElements: 2,
  };

  let breakpoint$: BehaviorSubject<any>;

  beforeEach(async () => {
    breakpoint$ = new BehaviorSubject<any>({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    additionalStoreSpy = {
      data: signal<any>({ kind: 'pagination', value: mockPagination }),
      response: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadPage: jasmine.createSpy('loadPage'),
      clearResponse: jasmine.createSpy('clearResponse'),
      delete: jasmine.createSpy('delete'),
    };

    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [AdditionalListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AdditionalStore, useValue: additionalStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.use('en-GB');

    fixture = TestBed.createComponent(AdditionalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    breakpoint$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dataSourceSignal correctly', () => {
    additionalStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
    fixture.detectChanges();

    const data = component.dataSourceSignal() as any;
    expect(data?.length).toBe(2);
    expect(data?.[0].hour).toBeDefined();
    expect(data?.[0].minute).toBeDefined();
  });

  it('should compute resultsLengthSignal correctly', () => {
    additionalStoreSpy.data.set({ kind: 'pagination', value: mockPagination });
    fixture.detectChanges();

    expect(component.resultsLengthSignal()).toBe(2);
  });

  it('should set mobile page size when small breakpoint matches', () => {
    breakpoint$.next({
      matches: true,
      breakpoints: {
        [Breakpoints.XSmall]: true,
        [Breakpoints.Small]: true,
      },
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(MOBILE_PAGE_SIZE);
  });

  it('should keep default page size when breakpoint does not match', () => {
    breakpoint$.next({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    });
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(PAGE_SIZE);
  });

  it('should call loadPage when paginatorPageIndex changes', () => {
    additionalStoreSpy.loadPage.calls.reset();
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    expect(additionalStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 1,
      sort: 'order',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should clear response and reset paginator when responseSignal emits', () => {
    const paginator = component['paginator']();

    paginator!.pageIndex = 1;
    paginator!.page.emit({ pageIndex: 1, previousPageIndex: 0, pageSize: PAGE_SIZE, length: 2 });
    fixture.detectChanges();

    additionalStoreSpy.clearResponse.calls.reset();
    additionalStoreSpy.loadPage.calls.reset();

    additionalStoreSpy.response.set({ success: true } as any);
    fixture.detectChanges();

    expect(additionalStoreSpy.clearResponse).toHaveBeenCalled();
    expect(additionalStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 0,
      sort: 'order',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should navigate when edit is called', () => {
    const item = mockAdditional[0];
    component.edit(item);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['en-GB', 'additional', item.id]);
  });

  it('should call delete when dialog returns a result', () => {
    const item = mockAdditional[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(additionalStoreSpy.delete).toHaveBeenCalledWith(item.id!, item.name!);
  });
});

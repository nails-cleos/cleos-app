import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ITreatmentGroupAll } from '../treatment';
import { MOBILE_PAGE_SIZE, PAGE_SIZE, Pagination } from '@app/interfaces/pagination';
import { TreatmentStore } from '@app/store/treatment.store';
import { TreatmentListComponent } from './treatment-list.component';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';
import { provideTranslateService } from '@ngx-translate/core';

describe('TreatmentListComponent', () => {
  let component: TreatmentListComponent;
  let fixture: ComponentFixture<TreatmentListComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let treatmentStoreSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    data: ReturnType<typeof signal<any>>;
    response: ReturnType<typeof signal<any>>;
    clean: jasmine.Spy;
    loadPage: jasmine.Spy;
    delete: jasmine.Spy;
  };

  const mockTreatments: ITreatmentGroupAll[] = [
    { id: '1', name: 'Treatment Red', description: 'Red treatment' },
    { id: '2', name: 'Treatment Blue', description: 'Blue treatment' },
    { id: '3', name: 'Treatment Green', description: 'Green treatment' },
  ];

  const mockPagination: Pagination<ITreatmentGroupAll> = {
    content: mockTreatments,
    totalElements: 3,
    totalPages: 1,
    number: 0,
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    treatmentStoreSpy = {
      isLoading: signal(false),
      data: signal({ kind: 'pagination', value: mockPagination }),
      response: signal(undefined),
      clean: jasmine.createSpy('clean'),
      loadPage: jasmine.createSpy('loadPage'),
      delete: jasmine.createSpy('delete'),
    };

    breakpointObserverSpy.observe.and.returnValue(of({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
      },
    }));

    await TestBed.configureTestingModule({
      imports: [TreatmentListComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: TreatmentStore, useValue: treatmentStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TreatmentListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the first page on init', () => {
    expect(treatmentStoreSpy.clean).toHaveBeenCalled();
    expect(treatmentStoreSpy.loadPage).toHaveBeenCalledWith({
      page: 0,
      sort: 'order',
      direction: 'asc',
      size: PAGE_SIZE,
    });
  });

  it('should compute dataSourceSignal correctly', () => {
    expect(component.dataSourceSignal()?.length).toBe(3);
  });

  it('should compute resultsLengthSignal correctly', () => {
    expect(component.resultsLengthSignal()).toBe(3);
  });

  it('should set mobile page size when small breakpoint matches', () => {
    breakpointObserverSpy.observe.and.returnValue(of({
      matches: true,
      breakpoints: {
        [Breakpoints.XSmall]: true,
        [Breakpoints.Small]: true,
      },
    }));

    fixture = TestBed.createComponent(TreatmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.pageSizeSignal()).toBe(MOBILE_PAGE_SIZE);
  });

  it('should call delete when dialog returns a result', () => {
    const item = mockTreatments[0];
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(item),
    } as any);

    component.delete(item);

    expect(dialogSpy.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: {
          title: 'TREATMENT.DELETED.TITLE',
          content: 'TREATMENT.DELETED.CONTENT',
          value: item,
          variant: 'warning',
        },
      }));

    expect(treatmentStoreSpy.delete).toHaveBeenCalledWith(item.id!, item.name!);
  });
});

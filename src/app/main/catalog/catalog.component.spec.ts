import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogComponent } from './catalog.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { MainContentService } from '../main-content.service';
import { clean, getAllCatalogs } from '../../store/catalogue.actions';
import { AppState } from '../../store/app.states';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;

  let state$: Subject<any>;
  let breakpoint$: Subject<BreakpointState>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let mainContentServiceSpy: jasmine.SpyObj<MainContentService>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    state$ = new Subject<any>();
    breakpoint$ = new Subject<BreakpointState>();

    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    mainContentServiceSpy = jasmine.createSpyObj('MainContentService', ['configure']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    storeSpy.select.and.returnValue(state$.asObservable());
    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: MainContentService, useValue: mainContentServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    state$.complete();
    breakpoint$.complete();
  });

  it('should dispatch Clean and GetAllCatalogs on init', () => {
    fixture.detectChanges();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllCatalogs());
  });

  it('should unsubscribe on destroy', () => {
    component.subscription = new Subscription();
    spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should add catalogues with image and configure mainContent', () => {
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:fake-url');

    const fakeBase64 = 'ZmFrZUJhc2U2NA==';
    const fakeItem = { blob: fakeBase64, contentType: 'text/plain' };

    fixture.detectChanges();

    state$.next({ data: [fakeItem] });

    expect(component.catalogues.length).toBe(1);
    expect(component.catalogues[0].image).toBe('blob:fake-url');
    expect(mainContentServiceSpy.configure).toHaveBeenCalledWith(false, 'open');
  });

  it('should emit true when matches is true', (done) => {
    const fixture = TestBed.createComponent(CatalogComponent);
    const component = fixture.componentInstance;

    component.isHandset$.subscribe((value) => {
      expect(value).toBeTrue();
      done();
    });

    breakpoint$.next({ matches: true } as BreakpointState);
  });

  it('should emit false when matches is false', (done) => {
    const fixture = TestBed.createComponent(CatalogComponent);
    const component = fixture.componentInstance;

    component.isHandset$.subscribe((value) => {
      expect(value).toBeFalse();
      done();
    });

    breakpoint$.next({ matches: false } as BreakpointState);
  });
});

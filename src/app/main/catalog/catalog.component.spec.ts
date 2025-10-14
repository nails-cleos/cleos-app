import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogComponent } from './catalog.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { MainContentService } from '../main-content.service';
import { clean, getAllCatalogs } from '../../store/catalogue.actions';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let breakpointSubject: Subject<BreakpointState>;
  let storeMock: any;
  let mainContentMock: any;
  let stateSubject: Subject<any>;
  let breakpointObserverMock: any;

  beforeEach(async () => {
    stateSubject = new Subject<any>();
    breakpointSubject = new Subject<BreakpointState>();
    breakpointObserverMock = {
      observe: jasmine.createSpy().and.returnValue(breakpointSubject.asObservable()),
    };

    storeMock = {
      select: jasmine.createSpy().and.returnValue(stateSubject.asObservable()),
      dispatch: jasmine.createSpy(),
    };

    mainContentMock = jasmine.createSpyObj('MainContentService', ['configure']);

    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: MainContentService, useValue: mainContentMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
  });

  it('should dispatch Clean and GetAllCatalogs on init', () => {
    fixture.detectChanges();
    expect(storeMock.dispatch).toHaveBeenCalledWith(clean());
    expect(storeMock.dispatch).toHaveBeenCalledWith(getAllCatalogs());
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

    stateSubject.next({ data: [fakeItem] });

    expect(component.catalogues.length).toBe(1);
    expect(component.catalogues[0].image).toBe('blob:fake-url');
    expect(mainContentMock.configure).toHaveBeenCalledWith(false, 'open');
  });

  it('should emit true when matches is true', (done) => {
    const fixture = TestBed.createComponent(CatalogComponent);
    const component = fixture.componentInstance;

    component.isHandset$.subscribe((value) => {
      expect(value).toBeTrue();
      done();
    });

    breakpointSubject.next({ matches: true } as BreakpointState);
  });

  it('should emit false when matches is false', (done) => {
    const fixture = TestBed.createComponent(CatalogComponent);
    const component = fixture.componentInstance;

    component.isHandset$.subscribe((value) => {
      expect(value).toBeFalse();
      done();
    });

    breakpointSubject.next({ matches: false } as BreakpointState);
  });
});

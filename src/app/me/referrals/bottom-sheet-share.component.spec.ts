import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomSheetShareComponent } from './bottom-sheet-share.component';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('BottomSheetShareComponent', () => {
  let component: BottomSheetShareComponent;
  let fixture: ComponentFixture<BottomSheetShareComponent>;

  let breakpointObserver$: Subject<BreakpointState>;

  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  const mockData = { code: 'ABC123' };

  beforeEach(async () => {
    breakpointObserver$ = new Subject<BreakpointState>();

    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.and.returnValue(breakpointObserver$.asObservable());

    await TestBed.configureTestingModule({
      imports: [BottomSheetShareComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: mockData },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
        provideHttpClient(),
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');
    translateService.setTranslation('en-GB', {
      ME: {
        REFERRAL: {
          LINK: 'Use my referral link: {{url}} (code: {{code}})',
        },
      },
    });

    fixture = TestBed.createComponent(BottomSheetShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize url, image, code, and message', () => {
    const expectedUrl = environment.appServer;
    expect(component.url).toBe(expectedUrl);
    expect(component.image).toBe(`${expectedUrl}/assets/icons/icon-512x512.png`);
    expect(component.code).toBe(`${expectedUrl}/auth?code=${mockData.code}`);

    expect(component.message)
      .toContain(`Use my referral link: http://localhost:4300/auth?code=ABC123 (code: ${mockData.code})`);
  });

  it('should set show to 7 by default', () => {
    expect(component.show).toBe(7);
  });

  it('should change show to 5 when breakpoint matches small or xsmall', () => {
    expect(component.show).toBe(7); // default
    breakpointObserver$.next({ matches: true, breakpoints: { [Breakpoints.XSmall]: true } });
    expect(component.show).toBe(5);
  });

  it('should not change show when breakpoint does not match', () => {
    component.show = 7;
    breakpointObserver$.next({ matches: false, breakpoints: {} });
    expect(component.show).toBe(7);
  });
});

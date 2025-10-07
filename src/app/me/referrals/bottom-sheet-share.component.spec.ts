import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomSheetShareComponent } from './bottom-sheet-share.component';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('BottomSheetShareComponent', () => {
  let component: BottomSheetShareComponent;
  let fixture: ComponentFixture<BottomSheetShareComponent>;

  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let breakpointObserverSubject: Subject<BreakpointState>;
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  const mockData = { code: 'ABC123' };

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslateService.instant.and.callFake((key: string, params?: any) => {
      return `translated: ${key} with ${JSON.stringify(params)}`;
    });

    breakpointObserverSubject = new Subject<BreakpointState>();
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    mockBreakpointObserver.observe.and.returnValue(breakpointObserverSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [BottomSheetShareComponent],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: mockData },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
        provideHttpClient(),
      ],
    }).compileComponents();

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
    expect(mockTranslateService.instant).toHaveBeenCalledWith('ME.REFERRAL.LINK', {
      code: mockData.code,
      url: component.code,
    });
    expect(component.message).toContain('translated: ME.REFERRAL.LINK');
  });

  it('should set show to 7 by default', () => {
    expect(component.show).toBe(7);
  });

  it('should change show to 5 when breakpoint matches small or xsmall', () => {
    expect(component.show).toBe(7); // default
    breakpointObserverSubject.next({ matches: true, breakpoints: { [Breakpoints.XSmall]: true } });
    expect(component.show).toBe(5);
  });

  it('should not change show when breakpoint does not match', () => {
    component.show = 7;
    breakpointObserverSubject.next({ matches: false, breakpoints: {} });
    expect(component.show).toBe(7);
  });
});

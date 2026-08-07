import { BackButtonDirective } from './back-button.directive';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationService } from '../services/navigation.service';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DEFAULT_LOCALE } from '../util/dates';

@Component({
  template: `
    <button
      appBackButton
      [form]="form"
      [date]="date"
      [step]="step"></button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BackButtonDirective],
})
class HostComponent {
  form?: FormGroup;
  date?: Date;
  step?: number;
}

describe('BackButtonDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostComp: HostComponent;
  let directive: BackButtonDirective;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let dialogSpy: jasmine.Spy<any>;
  let translateService: TranslateService;

  beforeEach(() => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComp = fixture.componentInstance;

    hostComp.date = new Date(2026, 2, 20);
    hostComp.step = 1;
    hostComp.form = new FormGroup({ test: new FormControl('') });

    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(BackButtonDirective));
    directive = debugEl.injector.get(BackButtonDirective);

    translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    dialogSpy = spyOn(directive.dialog, 'open');
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should call navigation.back when form is pristine', () => {
    hostComp.form?.markAsPristine(); // ensure pristine

    dialogSpy.and.returnValue({ afterClosed: () => of(hostComp.form) });

    directive.onClick();

    expect(navigationServiceSpy.back).toHaveBeenCalledWith(hostComp.date, hostComp.step);
  });

  it('should call navigation.back when no form is provided', () => {
    hostComp.form = undefined;

    directive.onClick();

    expect(navigationServiceSpy.back).toHaveBeenCalledWith(hostComp.date, hostComp.step);
  });

  it('should show dialog when form is dirty', () => {
    hostComp.form?.markAsDirty();

    translateService.setTranslation(DEFAULT_LOCALE, {
      COMMON: { BACK: { TITLE: 'Back Title', CONTENT: 'Back Content' } },
    });

    dialogSpy.and.returnValue({ afterClosed: () => of(hostComp.form) });

    directive.onClick();

    expect(translateService.instant('COMMON.BACK.TITLE')).toBe('Back Title');
    expect(translateService.instant('COMMON.BACK.CONTENT')).toBe('Back Content');
  });
});

import { BackButtonDirective } from './back-button.directive';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationService } from '../services/navigation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <button
      appBackButton
      [form]="form"
      [date]="date"
      [step]="step"></button>`,
  imports: [BackButtonDirective],
})
class HostComponent {
  form: FormGroup | undefined = undefined;
  date: Date | undefined = undefined;
  step: number | undefined = undefined;
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
      imports: [HostComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComp = fixture.componentInstance;
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(BackButtonDirective));
    directive = debugEl.injector.get(BackButtonDirective);

    translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    dialogSpy = spyOn(directive.dialog, 'open');
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should call navigation.back when form is pristine', () => {
    const form = new FormGroup({
      test: new FormControl(''),
    });
    hostComp.form = form;
    hostComp.date = new Date();
    hostComp.step = 1;
    fixture.detectChanges();

    dialogSpy.and.returnValue({
      afterClosed: () => of(form),
    });

    directive.onClick();

    expect(navigationServiceSpy.back).toHaveBeenCalledWith(hostComp.date, hostComp.step);
  });

  it('should call navigation.back when no form is provided', () => {
    hostComp.date = new Date();
    hostComp.step = 2;
    fixture.detectChanges();

    directive.onClick();

    dialogSpy.and.returnValue({
      afterClosed: () => of(directive.form()),
    });

    expect(navigationServiceSpy.back).toHaveBeenCalledWith(hostComp.date, hostComp.step);
  });

  it('should show dialog when form is dirty', () => {
    const form = new FormGroup({
      test: new FormControl(''),
    });
    form.markAsDirty();
    hostComp.form = form;
    fixture.detectChanges();

    translateService.setTranslation('en-GB', {
      COMMON: {
        BACK: {
          TITLE: 'Back Title',
          CONTENT: 'Back Content',
        },
      },
    });

    dialogSpy.and.returnValue({
      afterClosed: () => of(form),
    });

    directive.onClick();

    expect(translateService.instant('COMMON.BACK.TITLE')).toBe('Back Title');
    expect(translateService.instant('COMMON.BACK.CONTENT')).toBe('Back Content');
  });
});

import { BackButtonDirective } from './back-button.directive';
import { TestBed } from '@angular/core/testing';
import { NavigationService } from '../services/navigation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { of } from 'rxjs';

describe('BackButtonDirective', () => {
  let directive: BackButtonDirective;

  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let dialogSpy: jasmine.Spy<any>;

  let translateService: TranslateService;

  beforeEach(() => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        BackButtonDirective,
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    });

    directive = TestBed.inject(BackButtonDirective);

    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');

    dialogSpy = spyOn(directive.dialog, 'open');
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should call navigation.back when form is pristine', () => {
    const form = new UntypedFormGroup({
      test: new UntypedFormControl(''),
    });
    directive.form = form;
    directive.date = new Date();
    directive.step = 1;

    dialogSpy.and.returnValue({
      afterClosed: () => of(form),
    });

    directive.onClick();

    expect(navigationServiceSpy.back).toHaveBeenCalledWith(directive.date, directive.step);
  });

  it('should call navigation.back when no form is provided', () => {
    directive.date = new Date();
    directive.step = 2;

    directive.onClick();

    dialogSpy.and.returnValue({
      afterClosed: () => of(directive.form),
    });

    expect(navigationServiceSpy.back).toHaveBeenCalledWith(directive.date, directive.step);
  });

  it('should show dialog when form is dirty', () => {
    const form = new UntypedFormGroup({
      test: new UntypedFormControl(''),
    });
    form.markAsDirty();
    directive.form = form;

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

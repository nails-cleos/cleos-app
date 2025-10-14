import { BackButtonDirective } from './back-button.directive';
import { TestBed } from '@angular/core/testing';
import { NavigationService } from '../services/navigation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

describe('BackButtonDirective', () => {
  let directive: BackButtonDirective;
  let mockNavigationService: jasmine.SpyObj<NavigationService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let translateService: TranslateService;

  beforeEach(() => {
    mockNavigationService = jasmine.createSpyObj('NavigationService', ['back']);

    const mockDialogRef = {
      afterClosed: () => ({
        subscribe: jasmine.createSpy('subscribe'),
      }),
    };

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue(mockDialogRef as any);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        BackButtonDirective,
        { provide: NavigationService, useValue: mockNavigationService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });

    directive = TestBed.inject(BackButtonDirective);

    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
    translateService.use('en-GB');
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

    directive.onClick();

    expect(mockNavigationService.back).toHaveBeenCalledWith(directive.date, directive.step);
  });

  it('should call navigation.back when no form is provided', () => {
    directive.date = new Date();
    directive.step = 2;

    directive.onClick();

    expect(mockNavigationService.back).toHaveBeenCalledWith(directive.date, directive.step);
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

    directive.onClick();

    expect(translateService.instant('COMMON.BACK.TITLE')).toBe('Back Title');
    expect(translateService.instant('COMMON.BACK.CONTENT')).toBe('Back Content');
  });
});

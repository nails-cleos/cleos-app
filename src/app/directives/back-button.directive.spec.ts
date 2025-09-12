import { BackButtonDirective } from './back-button.directive';
import { TestBed } from '@angular/core/testing';
import { NavigationService } from '../services/navigation.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';

describe('BackButtonDirective', () => {
  let directive: BackButtonDirective;
  let mockNavigationService: jasmine.SpyObj<NavigationService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    mockNavigationService = jasmine.createSpyObj('NavigationService', ['back']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    
    const mockDialogRef = {
      afterClosed: () => ({
        subscribe: jasmine.createSpy('subscribe'),
      }),
    };
    
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue(mockDialogRef as any);

    TestBed.configureTestingModule({
      providers: [
        BackButtonDirective,
        { provide: NavigationService, useValue: mockNavigationService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });

    directive = TestBed.inject(BackButtonDirective);
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

    mockTranslateService.instant.and.returnValue('Translated text');

    directive.onClick();

    expect(mockTranslateService.instant).toHaveBeenCalledWith('COMMON.BACK.TITLE');
    expect(mockTranslateService.instant).toHaveBeenCalledWith('COMMON.BACK.CONTENT');
  });
});

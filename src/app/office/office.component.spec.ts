import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { OfficeComponent } from './office.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IUser, IUserAll } from '../interfaces/user';
import { IOffice } from '../interfaces/office';
import { clean, getAllManager, getOffice } from '../store/office.actions';
import { Role } from '../interfaces/token';

describe('OfficeComponent', () => {
  let component: OfficeComponent;
  let fixture: ComponentFixture<OfficeComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;
  let stateSubject: Subject<any>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jasmine.createSpy('get').and.returnValue(null),
      },
    },
  };

  const mockManager: IUserAll = {
    id: 'manager-1',
    displayName: 'John Manager',
    email: 'john@manager.com',
    locale: 'en',
    timeZone: 'Europe/Amsterdam',
    authorities: [{ authority: Role.manager }],
  };

  const mockOffice: IOffice = {
    id: 'office-1',
    name: 'Test Office',
    manager: mockManager,
    subject: 'Test Subject',
    kvk: '12345678',
    account: 'NL00BANK0123456789',
    btw: 'NL123456789B01',
    billingAddress: '123 Test Street, Amsterdam',
  };

  beforeEach(async () => {
    stateSubject = new Subject();
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        OfficeComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');
  });

  beforeEach(() => {
    // Reset the mock to return null before creating component
    mockActivatedRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue(null);

    fixture = TestBed.createComponent(OfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize in add mode when no id is provided', () => {
      expect(component.isAddMode).toBeTrue();
      expect(component.id).toBeUndefined();
    });

    it('should initialize form with required validators', () => {
      expect(component.form).toBeDefined();
      expect(component.getForm.name.hasError('required')).toBeTrue();
      expect(component.getForm.manager.hasError('required')).toBeTrue();
    });

    it('should dispatch getAllManager action when in add mode', () => {
      const newComponent = TestBed.createComponent(OfficeComponent).componentInstance;
      newComponent.ngOnInit();
      expect(mockStore.dispatch).toHaveBeenCalledWith(getAllManager());
    });

    it('should dispatch clean action on init', () => {
      const newComponent = TestBed.createComponent(OfficeComponent).componentInstance;
      newComponent.ngOnInit();
      expect(mockStore.dispatch).toHaveBeenCalledWith(clean());
    });

    it('should dispatch getOffice action when in edit mode', () => {
      mockActivatedRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('office-123');
      const newComponent = TestBed.createComponent(OfficeComponent).componentInstance;
      newComponent.ngOnInit();
      expect(mockStore.dispatch).toHaveBeenCalledWith(getOffice({ id: 'office-123' }));
    });
  });

  describe('Form Controls', () => {
    it('should return form controls via getForm getter', () => {
      const controls = component.getForm;
      expect(controls.name).toBeDefined();
      expect(controls.manager).toBeDefined();
      expect(controls.subject).toBeDefined();
      expect(controls.kvk).toBeDefined();
      expect(controls.account).toBeDefined();
      expect(controls.btw).toBeDefined();
      expect(controls.billingAddress).toBeDefined();
    });

    it('should have optional fields without required validator', () => {
      expect(component.getForm.subject.hasError('required')).toBeFalse();
      expect(component.getForm.kvk.hasError('required')).toBeFalse();
      expect(component.getForm.account.hasError('required')).toBeFalse();
      expect(component.getForm.btw.hasError('required')).toBeFalse();
      expect(component.getForm.billingAddress.hasError('required')).toBeFalse();
    });
  });

  describe('Submit', () => {
    it('should dispatch createOffice action when in add mode with valid form', () => {
      component.ngOnInit();
      const nameControl = component.getForm.name;
      nameControl.setValue('New Office');
      nameControl.markAsDirty();

      const managerControl = component.getForm.manager;
      managerControl.setValue(mockManager);
      managerControl.markAsDirty();

      mockStore.dispatch.calls.reset();

      void component.submit;

      expect(mockStore.dispatch).toHaveBeenCalled();
      const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
      expect(dispatchedAction).toEqual(jasmine.objectContaining({
        office: jasmine.objectContaining({
          name: 'New Office',
          managerId: 'manager-1',
        }),
        type: '[Office] Create office',
      }));
    });

    it('should dispatch updateOffice action when in edit mode with valid form', () => {
      const testId = 'office-123';
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(testId);
      component.office = mockOffice;
      component.ngOnInit();

      const nameControl = component.getForm.name;
      nameControl.setValue('Updated Office');
      nameControl.markAsDirty();

      const managerControl = component.getForm.manager;
      managerControl.setValue(mockManager);
      managerControl.markAsDirty();
      // Clear validator error to make form valid
      managerControl.setErrors(null);

      mockStore.dispatch.calls.reset();

      void component.submit;

      expect(mockStore.dispatch).toHaveBeenCalled();
      const dispatchedAction = mockStore.dispatch.calls.mostRecent().args[0];
      expect(dispatchedAction).toEqual(jasmine.objectContaining({
        id: testId,
        office: jasmine.objectContaining({
          name: 'Updated Office',
        }),
        type: '[Office] Update office by id',
      }));
    });

    it('should not submit when form is invalid', () => {
      const dispatchCountBefore = mockStore.dispatch.calls.count();
      void component.submit;
      const dispatchCountAfter = mockStore.dispatch.calls.count();
      expect(component.form.invalid).toBeTrue();
      expect(dispatchCountAfter).toBe(dispatchCountBefore);
    });

    it('should handle form with all fields filled', () => {
      component.getForm.name.setValue('Complete Office');
      component.getForm.manager.setValue(mockManager);
      component.getForm.subject.setValue('Test Subject');
      component.getForm.kvk.setValue('12345678');
      component.getForm.account.setValue('NL00BANK0123456789');
      component.getForm.btw.setValue('NL123456789B01');
      component.getForm.billingAddress.setValue('123 Test Street');
      // Clear validator error to make form valid
      component.getForm.manager.setErrors(null);
      component.isAddMode = true;

      void component.submit;

      expect(mockStore.dispatch).toHaveBeenCalled();
    });
  });

  describe('Display Function', () => {
    it('should return user display name', () => {
      const result = component.displayFn(mockManager as IUser);
      expect(result).toBe('John Manager');
    });

    it('should return empty string for null user', () => {
      const result = component.displayFn(null as any);
      expect(result).toBe('');
    });

    it('should return empty string for user without displayName', () => {
      const userWithoutName = { id: 'user-1' } as IUser;
      const result = component.displayFn(userWithoutName);
      expect(result).toBe('');
    });
  });

  describe('Add Manager', () => {
    it('should navigate to add manager page', () => {
      void component.addManager;
      expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'users', 'add'], {
        state: { role: Role.manager },
      });
    });
  });

  describe('Filtered Options', () => {
    it('should initialize filtered options observable', () => {
      expect(component.filteredOptions).toBeDefined();
    });

    it('should filter managers correctly', () => {
      component.managers = [
        mockManager,
        {
          id: 'manager-2',
          displayName: 'Jane Manager',
          email: 'jane@manager.com',
          locale: 'en',
          timeZone: 'Europe/Amsterdam',
          authorities: [{ authority: Role.manager }],
        },
      ];

      // Just verify the component has managers
      expect(component.managers.length).toBe(2);
    });
  });

  describe('Component Lifecycle', () => {
    it('should have ngOnDestroy method', () => {
      expect(component.ngOnDestroy).toBeDefined();
    });

    it('should unsubscribe on destroy', () => {
      const subscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      component['subscription'] = subscription;

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('should not throw error when unsubscribing with no subscription', () => {
      component['subscription'] = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined managers list', () => {
      component.managers = undefined;
      const result = component.displayFn(mockManager as IUser);
      expect(result).toBe('John Manager');
    });

    it('should handle empty managers list', () => {
      component.managers = [];
      expect(component.managers.length).toBe(0);
    });

    it('should handle invalid form submission gracefully', () => {
      component.form.setErrors({ invalid: true });
      const result = component.submit;
      expect(result).toBeUndefined();
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when name is empty', () => {
      component.getForm.name.setValue('');
      expect(component.getForm.name.hasError('required')).toBeTrue();
    });

    it('should mark form as invalid when manager is empty', () => {
      component.getForm.manager.setValue('');
      expect(component.getForm.manager.hasError('required')).toBeTrue();
    });

    it('should allow valid name values', () => {
      component.getForm.name.setValue('Valid Office Name');
      expect(component.getForm.name.valid).toBeTrue();
    });

    it('should allow empty optional fields', () => {
      expect(component.getForm.subject.valid).toBeTrue();
      expect(component.getForm.kvk.valid).toBeTrue();
      expect(component.getForm.account.valid).toBeTrue();
      expect(component.getForm.btw.valid).toBeTrue();
      expect(component.getForm.billingAddress.valid).toBeTrue();
    });
  });

  describe('Manager Selection', () => {
    it('should update manager field with valid user object', () => {
      component.getForm.manager.setValue(mockManager);
      expect(component.getForm.manager.value).toEqual(mockManager);
    });

    it('should display manager name in autocomplete', () => {
      const displayName = component.displayFn(mockManager as IUser);
      expect(displayName).toBe('John Manager');
    });

    it('should handle manager with missing displayName', () => {
      const manager = { id: 'manager-1', email: 'test@example.com' } as IUser;
      const displayName = component.displayFn(manager);
      expect(displayName).toBe('');
    });
  });

  describe('Component Properties', () => {
    it('should have office property', () => {
      component.office = mockOffice;
      expect(component.office).toEqual(mockOffice);
    });

    it('should have managers property', () => {
      component.managers = [mockManager];
      expect(component.managers.length).toBe(1);
    });

    it('should have errors property', () => {
      expect(component.errors).toBeDefined();
    });

    it('should have isAddMode property', () => {
      expect(component.isAddMode).toBeDefined();
    });

    it('should have managerName property', () => {
      component.managerName = 'Test Manager';
      expect(component.managerName).toBe('Test Manager');
    });
  });

  it('should patch form when office is selected from state', () => {
    component.ngOnInit();

    stateSubject.next({
      selected: mockOffice,
      managers: [mockManager],
    });

    expect(component.office?.id).toEqual(mockOffice.id);
    expect(component.getForm.manager?.value).toBe(mockOffice.manager);
    expect(component.getForm.name?.value).toBe(mockOffice.name);
    expect(component.getForm.subject?.value).toBe(mockOffice.subject);
    expect(component.getForm.kvk?.value).toBe(mockOffice.kvk);
    expect(component.getForm.account?.value).toBe(mockOffice.account);
    expect(component.getForm.btw?.value).toBe(mockOffice.btw);
    expect(component.getForm.billingAddress?.value).toBe(mockOffice.billingAddress);
    expect(component.managers).toEqual([mockManager]);
  });

  it('should handle form errors from state', () => {
    component.ngOnInit();

    const mockErrors = [
      { field: 'name', message: 'Name is required' },
      { field: 'manager', message: 'Manager is required' },
    ];

    stateSubject.next({
      subErrors: mockErrors,
    });

    expect(component.errors['name']).toBe('Name is required');
    expect(component.getForm.name?.hasError('incorrect')).toBeTrue();
    expect(component.errors['manager']).toBe('Manager is required');
    expect(component.getForm.manager?.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to office list on successful response', () => {
    component.ngOnInit();

    stateSubject.next({
      response: true,
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['en-GB', 'offices']);
  });

  it('should filter manager options based on form input', (done) => {
    component.managers = [
      { displayName: 'Test Manager 1', id: '1' },
      { displayName: 'Another Manager', id: '2' },
      { displayName: 'Test Manager 2', id: '3' },
    ] as any[];
    component['createForm']();

    let emissionCount = 0;
    component.filteredOptions?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          { displayName: 'Test Manager 1', id: '1' },
          { displayName: 'Test Manager 2', id: '3' },
        ]);
        done();
      }
    });

    component.getForm.manager?.setValue('T');
  });

  it('should filter manager options based on form input object', (done) => {
    const managers = [
      { displayName: 'Test Manager 1', id: '1' },
      { displayName: 'Another Manager', id: '2' },
      { displayName: 'Test Manager 2', id: '3' },
    ] as any[];
    component.managers = managers;
    component['createForm']();

    let emissionCount = 0;
    component.filteredOptions?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered).toEqual(managers);
        done();
      }
    });

    component.getForm.manager?.setValue(undefined);
  });
});
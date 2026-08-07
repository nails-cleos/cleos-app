import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import { IOfficeAll } from './office';
import { Role } from '../interfaces/token';
import { IUser, IUserAll } from '../user/user';
import { NavigationService } from '../services/navigation.service';
import { OfficeStore } from '../store/office.store';
import { OfficeComponent } from './office.component';
import { ICommon } from '../interfaces/common';
import { DEFAULT_LOCALE } from '../util/dates';

describe('OfficeComponent', () => {
  let component: OfficeComponent;
  let fixture: ComponentFixture<OfficeComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let officeStoreSpy: {
    subErrors: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
  };

  const mockManager: Partial<IUser> = {
    id: 'mgr-1',
  };

  const mockOffice: Partial<IOfficeAll> = {
    id: '1',
    name: 'Test Office',
    manager: mockManager,
  };

  const config: ICommon = {
    title: 'OFFICE.TITLE',
    button: { icon: 'add_business', label: 'COMMON.BUTTON.CREATE' },
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back', 'navigate'],
      { language: DEFAULT_LOCALE },
    );
    officeStoreSpy = {
      subErrors: signal<any>(undefined),
      isLoading: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [OfficeComponent],
      providers: [
        provideTranslateService(),
        { provide: OfficeStore, useValue: officeStoreSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);

    fixture = TestBed.createComponent(OfficeComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form when selectedOffice emits', () => {
    fixture.componentRef.setInput('office', mockOffice);
    fixture.detectChanges();

    expect(component.office()?.id).toBe('1');
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
    ];

    officeStoreSpy.subErrors.set(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['name']).toBe('Name required');
    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
  });

  it('should not call store when form invalid on submit', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.name.setValue('');
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should call create when in add mode and form valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    component.getForm.name.setValue('New Office');
    component.getForm.name.markAsDirty();
    component.getForm.manager.setValue(mockManager as IUser);
    component.getForm.manager.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'New Office',
      managerId: mockManager.id,
    }));
  });

  it('should call update when in edit mode and form valid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    fixture.componentRef.setInput('id', 'abc-123');
    fixture.detectChanges();
    fixture.componentRef.setInput('office', mockOffice);
    fixture.detectChanges();

    component.getForm.name.setValue('Updated Office');
    component.getForm.name.markAsDirty();
    component.getForm.subject.setValue('Updated subject');
    component.getForm.subject.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      subject: 'Updated subject',
      name: 'Updated Office',
    }));
  });

  it('should filter managers correctly', () => {
    const managers: IUserAll[] = [
      { id: 'p1', displayName: 'Alice', email: '', locale: '', timeZone: '', authorities: [] },
      { id: 'p2', displayName: 'Bob', email: '', locale: '', timeZone: '', authorities: [] },
    ];
    const result = component['filter']('A', managers);
    expect(result?.length).toBe(1);
    expect(result?.[0].displayName).toBe('Alice');
  });

  it('should navigate to add manager page', () => {
    component.addManager();
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(['users', 'add'], { state: { role: Role.manager } });
  });
});

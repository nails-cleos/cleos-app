import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { IOfficeAll } from '../interfaces/office';
import { Role } from '../interfaces/token';
import { IUser, IUserAll } from '../interfaces/user';
import { NavigationService } from '../services/navigation.service';
import { OfficeStore } from '../store/office.store';
import { OfficeComponent } from './office.component';

describe('OfficeComponent', () => {
  let component: OfficeComponent;
  let fixture: ComponentFixture<OfficeComponent>;

  let officeStoreSpy: {
    selected: ReturnType<typeof signal>;
    managers: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadManagers: jasmine.Spy;
    loadById: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
  };
  let navigateSpy: jasmine.Spy;

  const mockManager: Partial<IUser> = {
    id: 'mgr-1',
  };

  const mockOffice: Partial<IOfficeAll> = {
    id: '1',
    name: 'Test Office',
    manager: mockManager,
  };

  beforeEach(async () => {
    officeStoreSpy = {
      selected: signal<any>(undefined),
      managers: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadManagers: jasmine.createSpy('loadManagers'),
      loadById: jasmine.createSpy('loadById'),
      create: jasmine.createSpy('create'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [OfficeComponent, TranslateModule.forRoot()],
      providers: [
        { provide: OfficeStore, useValue: officeStoreSpy },
        { provide: NavigationService, useValue: jasmine.createSpyObj('NavigationService', ['back']) },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(OfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load office when officeId emits a value', () => {
    officeStoreSpy.loadById.calls.reset();
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(officeStoreSpy.loadById).toHaveBeenCalledWith('123');
  });

  it('should patch form when selectedOffice emits', () => {
    officeStoreSpy.selected.set(mockOffice);
    fixture.detectChanges();

    const officeSignalValue: any = component.officeSignal();
    expect(officeSignalValue.id).toBe('1');
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
    officeStoreSpy.create.calls.reset();
    officeStoreSpy.update.calls.reset();

    component.getForm.name.setValue('');
    fixture.detectChanges();

    component.submit();

    expect(officeStoreSpy.create).not.toHaveBeenCalled();
    expect(officeStoreSpy.update).not.toHaveBeenCalled();
  });

  it('should call create when in add mode and form valid', () => {
    officeStoreSpy.create.calls.reset();

    component.getForm.name.setValue('New Office');
    component.getForm.name.markAsDirty();
    component.getForm.manager.setValue(mockManager as IUser);
    component.getForm.manager.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(officeStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'New Office',
      managerId: mockManager.id,
    }));
  });

  it('should call update when in edit mode and form valid', () => {
    officeStoreSpy.update.calls.reset();

    fixture.componentRef.setInput('id', 'abc-123');
    fixture.detectChanges();
    officeStoreSpy.selected.set(mockOffice);
    fixture.detectChanges();

    component.getForm.name.setValue('Updated Office');
    component.getForm.name.markAsDirty();
    component.getForm.subject.setValue('Updated subject');
    component.getForm.subject.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    expect(officeStoreSpy.update).toHaveBeenCalledWith('abc-123', jasmine.objectContaining({
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
    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'users', 'add'], { state: { role: Role.manager } });
  });
});

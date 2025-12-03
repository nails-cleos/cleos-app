import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { OfficeComponent } from './office.component';
import { getOffice } from '../store/office.actions';
import { IOfficeAll } from '../interfaces/office';
import { IUser, IUserAll } from '../interfaces/user';
import { Role } from '../interfaces/token';
import { OfficeState } from '../store/reducers/office.reducers';

describe('OfficeComponent', () => {
  let component: OfficeComponent;
  let fixture: ComponentFixture<OfficeComponent>;

  let storeSpy: jasmine.SpyObj<Store<OfficeState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let navigateSpy: jasmine.Spy;

  let officeId$: BehaviorSubject<any>;
  let selectedOffice$: BehaviorSubject<any>;
  let allManagers$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let response$: BehaviorSubject<any>;

  const mockManager: Partial<IUser> = {
    id: 'mgr-1',
  };

  const mockOffice: Partial<IOfficeAll> = {
    id: '1',
    name: 'Test Office',
    manager: mockManager,
  };

  beforeEach(async () => {
    officeId$ = new BehaviorSubject<any>(null);
    selectedOffice$ = new BehaviorSubject<any>(undefined);
    allManagers$ = new BehaviorSubject<any>(undefined);
    subErrors$ = new BehaviorSubject<any>(undefined);
    response$ = new BehaviorSubject<any>(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return officeId$.asObservable();
        case 2:
          return selectedOffice$.asObservable();
        case 3:
          return allManagers$.asObservable();
        case 4:
          return subErrors$.asObservable();
        case 5:
          return response$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [OfficeComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    // Spy router.navigate
    const router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en-GB');
    translate.use('en-GB');

    fixture = TestBed.createComponent(OfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getOffice when officeId emits a value', () => {
    // reset calls
    storeSpy.dispatch.calls.reset();

    // emit an id (simulate edit mode)
    officeId$.next('123');
    fixture.detectChanges();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(getOffice({ id: '123' }));
  });

  it('should patch form when selectedOffice emits', () => {
    selectedOffice$.next(mockOffice);
    fixture.detectChanges();

    const officeSignalValue: any = component.officeSignal();
    expect(officeSignalValue.id).toBe('1');
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'name', message: 'Name required' },
    ];

    subErrors$.next(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['name']).toBe('Name required');
    expect(component.getForm.name.hasError('incorrect')).toBeTrue();
  });

  it('should navigate to office list when response emits', () => {
    response$.next(true);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['en-GB', 'offices']);
  });

  it('should not dispatch when form invalid on submit', () => {
    storeSpy.dispatch.calls.reset();

    // ensure form invalid
    (component.getForm.name as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch createOffice when in add mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    const nameControl = component.getForm.name;
    nameControl.setValue('New Office');
    nameControl.markAsDirty();
    const managerControl = component.getForm.manager;
    managerControl.setValue(mockManager);
    managerControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];
    expect(dispatched).toEqual(jasmine.objectContaining({
      office: jasmine.objectContaining({
        name: 'New Office',
        managerId: mockManager.id,
      }),
      type: '[Office] Create office',
    }));
  });

  it('should dispatch updateOffice when in edit mode and form valid', () => {
    storeSpy.dispatch.calls.reset();

    // simulate edit mode
    officeId$.next('abc-123');
    fixture.detectChanges();
    selectedOffice$.next(mockOffice);
    fixture.detectChanges();

    const nameControl = component.getForm.name;
    nameControl.setValue('Updated Office');
    nameControl.markAsDirty();
    const subjectControl = component.getForm.subject;
    subjectControl.setValue('Updated subject');
    subjectControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBeTrue();
    const dispatched = storeSpy.dispatch.calls.mostRecent().args[0];

    expect(dispatched).toEqual(jasmine.objectContaining({
      id: 'abc-123',
      office: jasmine.objectContaining({
        subject: 'Updated subject',
        name: 'Updated Office',
      }),
      type: '[Office] Update office by id',
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

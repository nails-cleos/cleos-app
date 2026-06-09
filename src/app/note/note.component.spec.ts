import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NoteComponent } from './note.component';
import { IUser, IUserAll } from '../user/user';
import { INoteAll } from './note';
import { FrequencyEnum } from '../util/helper';
import { ICommon, IError } from '../interfaces/common';
import { backendFormatDate, getNowTimeZone } from '../util/dates';
import { addDays } from 'date-fns';
import { provideAppDateAdapter } from '../util/adapter/app-date.provider';
import { NavigationService } from '../services/navigation.service';
import { NoteStore } from '../store/note.store';
import { signal } from '@angular/core';

describe('NoteComponent', () => {
  let component: NoteComponent;
  let fixture: ComponentFixture<NoteComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let noteStoreSpy: {
    navigationParams: ReturnType<typeof navigationParamsSignal.asReadonly>;
    professionals: ReturnType<typeof allProfessionalsSignal.asReadonly>;
    subErrors: ReturnType<typeof subErrorsSignal.asReadonly>;
    clearError: jasmine.Spy;
    setNavigationParams: jasmine.Spy;
    loadProfessionals: jasmine.Spy;
  };

  const navigationParamsSignal = signal<any>(undefined);
  const allProfessionalsSignal = signal<any>(undefined);
  const subErrorsSignal = signal<any>(undefined);

  const mockProfessional: IUserAll = {
    id: 'p1',
    displayName: 'Dr. Smith',
    email: '',
    locale: 'en',
    timeZone: '',
    authorities: [],
  };

  const mockNote: INoteAll = {
    id: 'note1',
    description: 'Test Note',
    professional: mockProfessional,
    date: '2024-01-01',
    repeat: FrequencyEnum.none,
    completed: false,
    deleted: false,
  };

  const config: ICommon = {
    title: 'NOTE.TITLE',
    button: { icon: 'add_note', label: 'COMMON.BUTTON.CREATE' },
  };

  beforeEach(async () => {
    navigationParamsSignal.set(undefined);
    allProfessionalsSignal.set(undefined);
    subErrorsSignal.set(undefined);

    noteStoreSpy = {
      navigationParams: navigationParamsSignal.asReadonly(),
      professionals: allProfessionalsSignal.asReadonly(),
      subErrors: subErrorsSignal.asReadonly(),
      clearError: jasmine.createSpy('clearError'),
      setNavigationParams: jasmine.createSpy('setNavigationParams'),
      loadProfessionals: jasmine.createSpy('loadProfessionals'),
    };

    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'currentNavigation']);

    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    await TestBed.configureTestingModule({
      imports: [NoteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NoteStore, useValue: noteStoreSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        provideAppDateAdapter(),
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(NoteComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form when selectedNote emits', () => {
    fixture.componentRef.setInput('note', mockNote);
    fixture.detectChanges();

    expect(component.getForm.description.value).toBe(mockNote.description);
    expect(component.getForm.professional.value).toEqual(mockNote.professional);
    expect(component.getForm.repeat.value).toBe(FrequencyEnum.none);
  });

  it('should handle subErrors and set form errors', () => {
    const error: IError = { field: 'description', message: 'Required' };
    subErrorsSignal.set([error]);
    fixture.detectChanges();

    expect(component.errors()['description']).toBe('Required');
    expect(component.getForm.description.hasError('incorrect')).toBeTrue();
  });

  it('should submit a new note in add mode', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('New Test');
    descriptionControl.markAsDirty();

    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessional);
    professionalControl.markAsDirty();

    const date = getNowTimeZone();
    const dateControl = component.getForm.date;
    dateControl.setValue(date);
    dateControl.markAsDirty();

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue(FrequencyEnum.none);
    repeatControl.markAsDirty();

    component.submit();

    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      description: 'New Test',
      professionalId: 'p1',
      repeat: FrequencyEnum.none,
      date: backendFormatDate(date),
    }));
  });

  it('should submit updated note in edit mode', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);

    const mockProfessional: IUserAll = {
      id: 'p2',
      displayName: 'Dr. Jones',
      email: '',
      locale: 'en',
      timeZone: '',
      authorities: [],
    };
    fixture.componentRef.setInput('id', 'note1');
    fixture.componentRef.setInput('note', mockNote);
    fixture.detectChanges();

    const date = addDays(getNowTimeZone(), 5);

    const descriptionControl = component.getForm.description;
    descriptionControl.setValue('Updated Test');
    descriptionControl.markAsDirty();

    const professionalControl = component.getForm.professional;
    professionalControl.setValue(mockProfessional);
    professionalControl.markAsDirty();

    const dateControl = component.getForm.date;
    dateControl.setValue(date);
    dateControl.markAsDirty();

    const repeatControl = component.getForm.repeat;
    repeatControl.setValue(FrequencyEnum.everyDay);
    repeatControl.markAsDirty();

    component.submit();

    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      description: 'Updated Test',
      professionalId: 'p2',
      date: backendFormatDate(date),
      repeat: FrequencyEnum.everyDay,
    }));
  });

  it('should not submit when form invalid', () => {
    const emitSpy = jasmine.createSpy('emit');
    component.submitData.subscribe(emitSpy);
    component.getForm.description.setValue('');
    component.submit();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should display user displayName correctly', () => {
    const user: IUser = { displayName: 'Test User', id: 'u1' } as any;
    expect(component.displayFn(user)).toBe('Test User');
  });

  it('should clear professional field on backspace', () => {
    const mockProfessional: IUserAll = {
      id: 'p1',
      displayName: 'Dr. Smith',
      email: '',
      locale: 'en',
      timeZone: '',
      authorities: [],
    };
    component.getForm.professional.setValue(mockProfessional);
    component.keyDownHandler({ code: 'Backspace' } as KeyboardEvent);
    expect(component.getForm.professional.value).toBeUndefined();
  });

  it('should filter professionals correctly', () => {
    const profs: IUserAll[] = [
      { id: 'p1', displayName: 'Alice', email: '', locale: '', timeZone: '', authorities: [] },
      { id: 'p2', displayName: 'Bob', email: '', locale: '', timeZone: '', authorities: [] },
    ];
    const result = component['filter']('A', profs);
    expect(result?.length).toBe(1);
    expect(result?.[0].displayName).toBe('Alice');
  });
});

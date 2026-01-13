import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { NoteComponent } from './note.component';
import { IUser, IUserAll } from '../interfaces/user';
import { INote, INoteAll } from '../interfaces/note';
import { FrequencyEnum } from '../util/helper';
import { IError } from '../interfaces/common';
import { backendFormatDate, getNowTimeZone } from '../util/dates';
import { addDays } from 'date-fns';

describe('NoteComponent', () => {
  let component: NoteComponent;
  let fixture: ComponentFixture<NoteComponent>;
  let storeSpy: jasmine.SpyObj<Store<any>>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  let noteId$: BehaviorSubject<any>;
  let navigationParams$: BehaviorSubject<any>;
  let selectedNote$: BehaviorSubject<any>;
  let allProfessionals$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;

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

  beforeEach(async () => {
    noteId$ = new BehaviorSubject(undefined);
    navigationParams$ = new BehaviorSubject(undefined);
    selectedNote$ = new BehaviorSubject(undefined);
    allProfessionals$ = new BehaviorSubject(undefined);
    subErrors$ = new BehaviorSubject(undefined);

    let pipeCallIndex = 0;
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return noteId$.asObservable();
        case 2:
          return navigationParams$.asObservable();
        case 3:
          return selectedNote$.asObservable();
        case 4:
          return allProfessionals$.asObservable();
        case 5:
          return subErrors$.asObservable();
        default:
          return of(undefined);
      }
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [NoteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(NoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in add mode when no noteId', () => {
    noteId$.next(null);
    expect(component.isAddModeSignal()).toBeTrue();
  });

  it('should patch form when selectedNote emits', () => {
    selectedNote$.next(mockNote);
    fixture.detectChanges();

    expect(component.getForm.description.value).toBe(mockNote.description);
    expect(component.getForm.professional.value).toEqual(mockNote.professional);
    expect(component.getForm.repeat.value).toBe(FrequencyEnum.none);
  });

  it('should handle subErrors and set form errors', () => {
    const error: IError = { field: 'description', message: 'Required' };
    subErrors$.next([error]);
    fixture.detectChanges();

    expect(component.errors()['description']).toBe('Required');
    expect(component.getForm.description.hasError('incorrect')).toBeTrue();
  });

  it('should submit a new note in add mode', () => {
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

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      note: jasmine.objectContaining({
        description: 'New Test',
        professionalId: 'p1',
        repeat: FrequencyEnum.none,
        date: backendFormatDate(date),
      }),
      type: '[Note] Create note',
    }));
  });

  it('should submit updated note in edit mode', () => {
    const mockProfessional: IUserAll = {
      id: 'p2',
      displayName: 'Dr. Jones',
      email: '',
      locale: 'en',
      timeZone: '',
      authorities: [],
    };
    noteId$.next('note1');
    selectedNote$.next(mockNote);
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

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      note: jasmine.objectContaining(
        {
          description: 'Updated Test',
          professionalId: 'p2',
          date: backendFormatDate(date),
          repeat: FrequencyEnum.everyDay,
        }),
      type: '[Note] Update note by id',
    }));
  });

  it('should not submit when form invalid', () => {
    component.getForm.description.setValue('');
    component.submit();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should call deleteNote on delete', () => {
    const mockProfessional: IUserAll = {
      id: 'p1',
      displayName: 'Dr. Smith',
      email: '',
      locale: 'en',
      timeZone: '',
      authorities: [],
    };
    const mockNote: INote = {
      id: 'note1',
      description: 'desc',
      professional: mockProfessional,
      date: '2024-01-01',
      repeat: FrequencyEnum.none,
    };
    spyOn(component, 'noteSignal').and.returnValue(mockNote as any);

    spyOn(component['dialog'], 'open').and.returnValue({ afterClosed: () => of(mockNote) } as any);

    component.delete();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      id: 'note1',
      description: 'desc',
    }));
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

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteDetailsPageComponent } from './note-details-page.component';
import { NoteStore } from '../store/note.store';
import { INoteAll } from './note';
import { NoteComponent } from './note.component';
import { IUserAll } from '../user/user';
import { FrequencyEnum } from '../util/helper';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UserStore } from '../store/user.store';
import { provideTranslateService } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';

describe('NoteDetailsPageComponent', () => {
  let component: NoteDetailsPageComponent;
  let fixture: ComponentFixture<NoteDetailsPageComponent>;
  let dialogSpy: Pick<MatDialog, 'open'> & {
    open: ReturnType<typeof vi.fn>;
  };

  let noteStoreSpy: {
    navigationParams: ReturnType<typeof signal>;
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    delete: Mock;
    clean: Mock;
    loadById: Mock;
    update: Mock;
  };

  let userStoreSpy: {
    professionals: ReturnType<typeof signal>;
    loadProfessionals: Mock;
  };

  const id = '123';

  const mockProfessional: IUserAll = {
    id: 'p1',
    displayName: 'Dr. Smith',
    email: '',
    locale: 'en',
    timeZone: '',
    authorities: [],
  };

  const mockNote: Partial<INoteAll> = {
    id,
    description: 'Test Description',
    professional: mockProfessional,
    date: '2024-01-01',
    repeat: FrequencyEnum.none,
  };

  beforeEach(async () => {
    noteStoreSpy = {
      navigationParams: signal<any>(undefined),
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      delete: vi.fn().mockName('delete'),
      clean: vi.fn().mockName('clean'),
      loadById: vi.fn().mockName('loadById'),
      update: vi.fn().mockName('update'),
    };
    userStoreSpy = {
      professionals: signal<any>(undefined),
      loadProfessionals: vi.fn().mockName('loadProfessionals'),
    };
    dialogSpy = {
      open: vi.fn().mockName('MatDialog.open'),
    };

    await TestBed.configureTestingModule({
      imports: [NoteDetailsPageComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: NoteStore, useValue: noteStoreSpy },
        { provide: UserStore, useValue: userStoreSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(NoteDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load note when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(noteStoreSpy.clean).toHaveBeenCalled();
    expect(noteStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected note to the shared form', () => {
    noteStoreSpy.selected.set(mockNote);
    fixture.detectChanges();

    const noteComponent = fixture.debugElement.children[0]
      .componentInstance as NoteComponent;

    expect(noteComponent.note()).toEqual(
      expect.objectContaining({
        id,
        description: 'Test Description',
        professional: mockProfessional,
      }),
    );
  });

  it('should call update when note is received', () => {
    fixture.detectChanges();

    component.submit(mockNote);

    expect(noteStoreSpy.update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        description: 'Test Description',
        professional: mockProfessional,
      }),
    );
  });

  it('should call deleteNote on delete', () => {
    vi.spyOn(component, 'note').mockReturnValue(mockNote as any);

    dialogSpy.open.mockReturnValue({ afterClosed: () => of(mockNote) } as any);

    component.delete();

    expect(noteStoreSpy.delete).toHaveBeenCalledWith(id, mockNote.description);
  });
});

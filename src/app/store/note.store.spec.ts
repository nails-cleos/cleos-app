import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { NoteStore } from './note.store';
import { NoteService } from '../services/note.service';

describe('NoteStore', () => {
  let store: InstanceType<typeof NoteStore>;
  let noteServiceSpy: {
    getNote: Mock;
    createNote: Mock;
    updateNote: Mock;
    deleteNote: Mock;
    completeNote: Mock;
  };
  let translateSpy: {
    instant: Mock;
  };

  beforeEach(() => {
    noteServiceSpy = {
      getNote: vi.fn().mockName('NoteService.getNote'),
      createNote: vi.fn().mockName('NoteService.createNote'),
      updateNote: vi.fn().mockName('NoteService.updateNote'),
      deleteNote: vi.fn().mockName('NoteService.deleteNote'),
      completeNote: vi.fn().mockName('NoteService.completeNote'),
    };

    translateSpy = {
      instant: vi.fn().mockName('TranslateService.instant'),
    };
    translateSpy.instant.mockImplementation(
      (key: string, params?: Record<string, string>) =>
        `${key}:${params?.['description'] ?? ''}`,
    );

    TestBed.configureTestingModule({
      providers: [
        NoteStore,
        { provide: NoteService, useValue: noteServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(NoteStore);
  });

  it('should load note by id', () => {
    const note = { id: 'n1' } as any;
    noteServiceSpy.getNote.mockReturnValue(of(note));

    store.loadById('n1');

    expect(noteServiceSpy.getNote).toHaveBeenCalledWith('n1');
    expect(store.selected()).toEqual(note);
    expect(store.isLoading()).toBe(false);
  });

  it('should create note and set response', () => {
    noteServiceSpy.createNote.mockReturnValue(
      of({ id: '1', name: 'Meeting' } as any),
    );

    store.create({ name: 'Meeting' } as any);

    expect(noteServiceSpy.createNote).toHaveBeenCalledWith(expect.any(Object));

    expect(translateSpy.instant).toHaveBeenCalledWith('NOTE.CREATED.MESSAGE', {
      description: 'Meeting',
    });

    expect(store.response()).toEqual({
      message: 'NOTE.CREATED.MESSAGE:Meeting',
      path: 'notes/1',
      redirect: 'reservation/calendar',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should update note and set response', () => {
    noteServiceSpy.updateNote.mockReturnValue(
      of({ id: '2', name: 'Updated Note' } as any),
    );

    store.update('2', { name: 'Updated Note' } as any);

    expect(noteServiceSpy.updateNote).toHaveBeenCalledWith(
      '2',
      expect.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith('NOTE.UPDATED.MESSAGE', {
      description: 'Updated Note',
    });

    expect(store.response()).toEqual({
      message: 'NOTE.UPDATED.MESSAGE:Updated Note',
      path: 'notes/2',
      redirect: 'reservation/calendar',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should delete note and show warning toast', () => {
    noteServiceSpy.deleteNote.mockReturnValue(of(void 0));

    store.delete('n1', 'Lunch note');

    expect(noteServiceSpy.deleteNote).toHaveBeenCalledWith('n1');

    expect(translateSpy.instant).toHaveBeenCalledWith('NOTE.UPDATED.MESSAGE', {
      description: 'Lunch note',
    });

    expect(store.response()).toEqual({
      message: 'NOTE.UPDATED.MESSAGE:Lunch note',
      toastType: 'warning',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should complete note and set response', () => {
    noteServiceSpy.completeNote.mockReturnValue(
      of({ id: '3', name: 'Done note' } as any),
    );

    store.complete('3');

    expect(noteServiceSpy.completeNote).toHaveBeenCalledWith('3');

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'NOTE.COMPLETED.MESSAGE',
      { description: 'Done note' },
    );

    expect(store.response()).toEqual({
      message: 'NOTE.COMPLETED.MESSAGE:Done note',
      path: 'notes/3',
      redirect: 'reservation/calendar',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should map HTTP error into store error state', () => {
    noteServiceSpy.getNote.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'NOTE.ERROR' },
          }),
      ),
    );

    store.loadById('missing');

    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'SERVER_ERROR',
        message: 'COMMON.ERROR.TRY_LATER',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should reset store on clean()', () => {
    noteServiceSpy.getNote.mockReturnValue(of({ id: '1' } as any));

    store.loadById('1');
    store.clean();

    expect(store.selected()).toBeUndefined();
    expect(store.response()).toBeUndefined();
    expect(store.error()).toBeUndefined();
  });

  it('should clear response and error', () => {
    noteServiceSpy.getNote.mockReturnValue(of({ id: '1' } as any));

    store.loadById('1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});

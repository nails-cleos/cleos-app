import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { INoteAll } from '../../interfaces/note';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { NOTE_FEATURE_KEY, NoteState } from '../reducers/note.reducers';
import { IUserAll } from '../../interfaces/user';

const selectNoteState = createFeatureSelector<NoteState>(NOTE_FEATURE_KEY);

const selectedNote = createSelector(
  selectNoteState,
  (state: NoteState) => state?.selected,
);
export const getSelectedNotePipe = pipe(
  select(selectedNote),
  filter((val): val is INoteAll => val !== undefined),
);

const selectAllProfessionals = createSelector(
  selectNoteState,
  (state: NoteState) => state?.professionals,
);
export const getAllProfessionalsPipe = pipe(
  select(selectAllProfessionals),
  filter((val): val is IUserAll[] => val !== undefined),
);

const selectNoteNavigationParams = createSelector(
  selectNoteState,
  (state: NoteState) => state?.noteNavigationParams,
);
export const getNavigationParamsPipe = pipe(
  select(selectNoteNavigationParams),
  filter((val): val is { professional?: IUserAll; date?: Date } => val !== undefined),
);

const selectSubErrors = createSelector(
  selectNoteState,
  (state: NoteState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

export const selectNoteResponse = createSelector(
  selectNoteState,
  (state: NoteState) => state?.response,
);
export const getNoteResponsePipe = pipe(
  select(selectNoteResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectNoteError = createSelector(
  selectNoteState,
  (state: NoteState) => state?.error,
);

export const selectNoteIsLoading = createSelector(
  selectNoteState,
  (state: NoteState) => state?.isLoading,
);

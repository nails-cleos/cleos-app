import { All, NoteActionTypes } from '../note.actions';
import { INote } from '../../interfaces/note';
import { IUser } from '../../interfaces/user';
import { IError, IResponseSuccess } from '../../interfaces/common';

export interface State {
  response?: IResponseSuccess;
  data?: INote;
  professionals?: IUser[];
  errorMessage?: string;
  error?: IError;
  subErrors?: IError[];
  selected?: INote;
  isLoading: boolean;
}

export const initialState: State = {
  data: undefined,
  professionals: undefined,
  errorMessage: undefined,
  error: undefined,
  subErrors: undefined,
  selected: undefined,
  response: undefined,
  isLoading: false,
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case NoteActionTypes.getNote: {
      return {
        ...state,
        data: {} as INote,
        errorMessage: undefined,
        subErrors: undefined,
        selected: undefined,
        response: undefined,
      };
    }
    case NoteActionTypes.getAllProfessional: {
      return {
        ...state,
        professionals: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case NoteActionTypes.noteSuccess: {
      return {
        ...state,
        professionals: action.data,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case NoteActionTypes.noteSaveSuccess: {
      return {
        ...state,
        response: action,
        selected: undefined,
        errorMessage: undefined,
        subErrors: undefined,
        isLoading: false,
      };
    }
    case NoteActionTypes.noteSelected: {
      return {
        ...state,
        selected: action.selected,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
      };
    }
    case NoteActionTypes.noteFailure: {
      return {
        ...state,
        errorMessage: action.error.message,
        error: action.error,
        subErrors: action.error.subErrors,
        response: undefined,
        isLoading: false,
      };
    }
    case NoteActionTypes.updateNote:
    case NoteActionTypes.createNote:
    case NoteActionTypes.deleteNote:
    case NoteActionTypes.completeNote: {
      return {
        ...state,
        errorMessage: undefined,
        subErrors: undefined,
        response: undefined,
        isLoading: true,
      };
    }
    case NoteActionTypes.clean: {
      return initialState;
    }
    default: {
      return state;
    }
  }
};

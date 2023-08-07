import { All, NoteActionTypes } from '../note.actions';
import { INote } from '../../interfaces/note';
import { IUser } from '../../interfaces/user';

export interface State {
  data: INote | null;
  professionals: IUser[] | null;
  errorMessage: string | null;
  error: any;
  subErrors: any;
  selected: INote | null;
  message: string | null;
  isLoading: boolean;
}

export const initialState: State = {
  data: null,
  professionals: null,
  errorMessage: null,
  error: null,
  subErrors: null,
  selected: null,
  message: null,
  isLoading: false
};

export const reducer = (state = initialState, action: All): State => {
  switch (action.type) {
    case NoteActionTypes.noteFind: {
      return {
        ...state,
        data: {} as INote,
        errorMessage: null,
        subErrors: null,
        selected: null,
        message: null
      };
    }
    case NoteActionTypes.getAllProfessional: {
      return {
        ...state,
        professionals: null,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case NoteActionTypes.noteSuccess: {
      return {
        ...state,
        data: action.payload,
        professionals: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case NoteActionTypes.noteSaveSuccess: {
      return {
        ...state,
        message: action.payload.message,
        selected: null,
        errorMessage: null,
        subErrors: null,
        isLoading: false
      };
    }
    case NoteActionTypes.noteSelected: {
      return {
        ...state,
        selected: action.payload,
        errorMessage: null,
        subErrors: null,
        message: null
      };
    }
    case NoteActionTypes.noteFailure: {
      return {
        ...state,
        errorMessage: action.payload.error.message,
        error: action.payload.error,
        subErrors: action.payload.error.subErrors,
        message: null,
        isLoading: false
      };
    }
    case NoteActionTypes.noteUpdate:
    case NoteActionTypes.noteSave:
    case NoteActionTypes.noteDelete:
    case NoteActionTypes.noteComplete: {
      return {
        ...state,
        errorMessage: null,
        subErrors: null,
        message: null,
        isLoading: true
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

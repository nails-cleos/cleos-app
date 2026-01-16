import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess } from '../interfaces/common';

enum StatementActionTypes {
  uploadStatement = '[Statement] Upload statement',
  statementSaveSuccess = '[Statement] Save Success',
  statementFailure = '[Statement] Failure',
  clean = '[Statement] Clean'
}

export const statementFailure = createAction(
  StatementActionTypes.statementFailure,
  props<{ error: IError }>(),
);

export const uploadStatement = createAction(
  StatementActionTypes.uploadStatement,
  props<{ officeId: string; blob: Blob; fileName: string }>(),
);

export const statementSaveSuccess = createAction(
  StatementActionTypes.statementSaveSuccess,
  props<IResponseSuccess>(),
);

export const cleanStatement = createAction(StatementActionTypes.clean);

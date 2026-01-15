import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { IStatement } from '../interfaces/statement';
import { Pagination } from '../interfaces/pagination';

enum StatementActionTypes {
  getStatementsPage = '[Statement] Get statements page',
  statementSuccess = '[Statement] Success',
  statementView = '[Statement] Statement view',
  uploadStatement = '[Statement] Upload statement',
  statementSaveSuccess = '[Statement] Save Success',
  statementFailure = '[Statement] Failure',
  clean = '[Statement] Clean'
}

export const getStatementsPage = createAction(
  StatementActionTypes.getStatementsPage,
  props<{ officeId: string } & PageRequest>(),
);

export const statementView = createAction(
  StatementActionTypes.statementView,
  props<{ id: string; fileName: string; driveToken?: string }>(),
);

export const statementSuccess = createAction(
  StatementActionTypes.statementSuccess,
  props<{ page: Pagination<IStatement> }>(),
);

export const statementFailure = createAction(
  StatementActionTypes.statementFailure,
  props<{ error: IError }>(),
);

export const uploadStatement = createAction(
  StatementActionTypes.uploadStatement,
  props<{ officeId: string; blob: Blob; fileName: string; driveToken?: string }>(),
);

export const statementSaveSuccess = createAction(
  StatementActionTypes.statementSaveSuccess,
  props<IResponseSuccess>(),
);

export const cleanStatement = createAction(StatementActionTypes.clean);

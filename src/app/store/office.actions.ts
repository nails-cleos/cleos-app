import { createAction, props } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { IOffice } from '../interfaces/office';
import { IUser } from '../interfaces/user';

enum OfficeActionTypes {
  getOfficesPage = '[Office] Get offices page',
  getAllManager = '[Office] Get all manager',
  officeSuccess = '[Office] Success',
  managerSuccess = '[Office] Manager Success',
  createOffice = '[Office] Create office',
  updateOffice = '[Office] Update office by id',
  officeSaveSuccess = '[Office] Save success',
  officeFailure = '[Office] Failure',
  officeSelected = '[Office] Selected',
  getOffice = '[Office] Find office by id',
  deleteOffice = '[Office] Delete office by id',
  clean = '[Office] Clean',
}

export const getOfficesPage = createAction(
  OfficeActionTypes.getOfficesPage,
  props<PageRequest>(),
);

export const getAllManager = createAction(
  OfficeActionTypes.getAllManager,
);

export const officeSuccess = createAction(
  OfficeActionTypes.officeSuccess,
  props<{ data: Pagination<IOffice> }>(),
);

export const managerSuccess = createAction(
  OfficeActionTypes.managerSuccess,
  props<{ managers: IUser[] }>(),
);

export const createOffice = createAction(
  OfficeActionTypes.createOffice,
  props<{ office: IOffice }>(),
);

export const updateOffice = createAction(
  OfficeActionTypes.updateOffice,
  props<{ id: string; office: IOffice }>(),
);

export const officeSaveSuccess = createAction(
  OfficeActionTypes.officeSaveSuccess,
  props<ResponseSuccess>(),
);

export const officeFailure = createAction(
  OfficeActionTypes.officeFailure,
  props<{ error: IError }>(),
);

export const officeSelected = createAction(
  OfficeActionTypes.officeSelected,
  props<{ selected?: IOffice }>(),
);

export const getOffice = createAction(
  OfficeActionTypes.getOffice,
  props<{ id: string }>(),
);

export const deleteOffice = createAction(
  OfficeActionTypes.deleteOffice,
  props<{ id: string; name: string }>(),
);

export const clean = createAction(OfficeActionTypes.clean);

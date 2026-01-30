import { createAction, props } from '@ngrx/store';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { IOffice, IOfficeAll } from '../interfaces/office';
import { IUserAll } from '../interfaces/user';

enum OfficeActionTypes {
  getOfficesPage = '[Office] Get offices page',
  getAllManager = '[Office] Get all manager',
  getAllMyOffices = '[Office] Success',
  officeSuccess = '[Office] Get all my offices',
  managerSuccess = '[Office] Manager Success',
  createOffice = '[Office] Create office',
  updateOffice = '[Office] Update office by id',
  officeSaveSuccess = '[Office] Save success',
  officeFailure = '[Office] Failure',
  officeSelected = '[Office] Selected',
  getOffice = '[Office] Find office by id',
  deleteOffice = '[Office] Delete office by id',
  setCurrentOfficeId = '[Office] set current office id',
  clean = '[Office] Clean',
}

export const getOfficesPage = createAction(
  OfficeActionTypes.getOfficesPage,
  props<PageRequest>(),
);

export const getAllManager = createAction(
  OfficeActionTypes.getAllManager,
);

export const getAllMyOffices = createAction(
  OfficeActionTypes.getAllMyOffices,
);

export const officeSuccess = createAction(
  OfficeActionTypes.officeSuccess,
  props<{ data: Pagination<IOffice>| IOfficeAll[] }>(),
);

export const managerSuccess = createAction(
  OfficeActionTypes.managerSuccess,
  props<{ managers: IUserAll[] }>(),
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
  props<IResponseSuccess>(),
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

export const setCurrentOfficeId = createAction(
  OfficeActionTypes.setCurrentOfficeId,
  props<{ officeId: string }>(),
);

export const cleanOffice = createAction(OfficeActionTypes.clean);

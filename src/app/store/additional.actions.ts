import { createAction, props } from '@ngrx/store';
import { IAdditional, IAdditionalAll } from '../interfaces/additional';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { ITreatmentGroup } from '../interfaces/treatment';
import { IError, IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';

enum AdditionalActionTypes {
  getAdditionalPage = '[Additional] Get additional page',
  getAdditionalList = '[Additional] Get additional list',
  additionalSuccess = '[Additional] Success',
  createAdditional = '[Additional] create additional',
  updateAdditional = '[Additional] Update additional by id',
  sortAdditional = '[Additional] Sort additional',
  additionalSaveSuccess = '[Additional] Save Success',
  additionalFailure = '[Additional] Failure',
  additionalSelected = '[Additional] Selected',
  getAdditional = '[Additional] Find additional by id',
  deleteAdditional = '[Additional] Delete additional by id',
  getAllTreatmentsGroup = '[Additional] Get all treatments group',
  findGroupsSuccess = '[Additional] Find treatment groups success',
  clean = '[Additional] Clean'
}

export const getAdditionalPage = createAction(
  AdditionalActionTypes.getAdditionalPage,
  props<PageRequest>(),
);

export const getAdditionalList = createAction(
  AdditionalActionTypes.getAdditionalList,
);

export const additionalSuccess = createAction(
  AdditionalActionTypes.additionalSuccess,
  props<{ data: Pagination<IAdditional> | IAdditionalAll[] }>(),
);

export const createAdditional = createAction(
  AdditionalActionTypes.createAdditional,
  props<{ additional: IAdditional }>(),
);

export const updateAdditional = createAction(
  AdditionalActionTypes.updateAdditional,
  props<{ id: string; additional: IAdditional }>(),
);

export const sortAdditional = createAction(
  AdditionalActionTypes.sortAdditional,
  props<{ additionalList: ISorted[] }>(),
);

export const additionalSaveSuccess = createAction(
  AdditionalActionTypes.additionalSaveSuccess,
  props<IResponseSuccess>(),
);

export const additionalFailure = createAction(
  AdditionalActionTypes.additionalFailure,
  props<{ error: IError }>(),
);

export const additionalSelected = createAction(
  AdditionalActionTypes.additionalSelected,
  props<{ selected?: IAdditional }>(),
);

export const getAdditional = createAction(
  AdditionalActionTypes.getAdditional,
  props<{ id: string }>(),
);

export const deleteAdditional = createAction(
  AdditionalActionTypes.deleteAdditional,
  props<{ id: string; name: string }>(),
);

export const getAllTreatmentsGroup = createAction(
  AdditionalActionTypes.getAllTreatmentsGroup,
);

export const findGroupsSuccess = createAction(
  AdditionalActionTypes.findGroupsSuccess,
  props<{ groups: ITreatmentGroup[] }>(),
);

export const clean = createAction(
  AdditionalActionTypes.clean,
);

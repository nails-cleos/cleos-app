import { Action } from '@ngrx/store';
import { IAdditional, IAdditionalAll } from '../interfaces/additional';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { ITreatmentGroup } from '../interfaces/treatment';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';

export enum AdditionalActionTypes {
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

export class GetAdditionalPage extends PageRequest implements Action {
  readonly type = AdditionalActionTypes.getAdditionalPage;
}

export class GetAdditionalList implements Action {
  readonly type = AdditionalActionTypes.getAdditionalList;
}

export class AdditionalSuccess implements Action {
  readonly type = AdditionalActionTypes.additionalSuccess;

  constructor(public data: Pagination<IAdditional> | IAdditionalAll[]) {
  }
}

export class CreateAdditional implements Action {
  readonly type = AdditionalActionTypes.createAdditional;

  constructor(public additional: IAdditional) {
  }
}

export class UpdateAdditional implements Action {
  readonly type = AdditionalActionTypes.updateAdditional;

  constructor(public id: string, public additional: IAdditional) {
  }
}

export class SortAdditional implements Action {
  readonly type = AdditionalActionTypes.sortAdditional;

  constructor(public additionalList: ISorted[]) {
  }
}

export class AdditionalSaveSuccess extends ResponseSuccess implements Action {
  readonly type = AdditionalActionTypes.additionalSaveSuccess;
}

export class AdditionalFailure implements Action {
  readonly type = AdditionalActionTypes.additionalFailure;

  constructor(public error: IError) {
  }
}

export class AdditionalSelected implements Action {
  readonly type = AdditionalActionTypes.additionalSelected;

  constructor(public selected?: IAdditional) {
  }
}

export class GetAdditional implements Action {
  readonly type = AdditionalActionTypes.getAdditional;

  constructor(public id: string) {
  }
}

export class DeleteAdditional implements Action {
  readonly type = AdditionalActionTypes.deleteAdditional;

  constructor(public id: string, public name: string) {
  }
}

export class GetAllTreatmentsGroup implements Action {
  readonly type = AdditionalActionTypes.getAllTreatmentsGroup;
}

export class FindGroupsSuccess implements Action {
  readonly type = AdditionalActionTypes.findGroupsSuccess;

  constructor(public groups: ITreatmentGroup[]) {
  }
}

export class Clean implements Action {
  readonly type = AdditionalActionTypes.clean;
}

export type All =
  | GetAdditionalPage
  | GetAdditionalList
  | CreateAdditional
  | UpdateAdditional
  | SortAdditional
  | AdditionalSuccess
  | AdditionalSaveSuccess
  | AdditionalFailure
  | GetAdditional
  | AdditionalSelected
  | DeleteAdditional
  | GetAllTreatmentsGroup
  | FindGroupsSuccess
  | Clean;

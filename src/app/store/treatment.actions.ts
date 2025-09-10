import { Action } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { ITreatmentAll, ITreatmentGroup } from '../interfaces/treatment';
import { IColor } from '../interfaces/color';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { Pagination } from '../interfaces/pagination';

export enum TreatmentActionTypes {
  getTreatmentsPage = '[Treatment] Get treatments page',
  getAllTreatmentsGroup = '[Treatment] Get all treatments group',
  getAllColors = '[Treatment] Get all colors',
  treatmentSuccess = '[Treatment] Success',
  colorSuccess = '[Treatment] color Success',
  createTreatment = '[Treatment] Create treatment',
  updateTreatmentGroup = '[Treatment] Update treatment group by id',
  sortTreatment = '[Treatment] Sort treatment',
  sortGroupTreatment = '[Treatment] Sort group treatment',
  treatmentSaveSuccess = '[Treatment] Save Success',
  treatmentFailure = '[Treatment] Failure',
  treatmentSelected = '[Treatment] Selected',
  getTreatmentGroup = '[Treatment] Find treatment group by id',
  deleteTreatmentGroup = '[Treatment] Delete treatment group by id',
  getAllTreatmentsHistory = '[Treatment] Get all treatments history',
  treatmentHistorySuccess = '[Treatment] History success',
  clean = '[Treatment] Clean'
}

export class GetTreatmentsPage extends PageRequest implements Action {
  readonly type = TreatmentActionTypes.getTreatmentsPage;
}

export class GetAllTreatmentsGroup implements Action {
  readonly type = TreatmentActionTypes.getAllTreatmentsGroup;
}

export class GetAllColors implements Action {
  readonly type = TreatmentActionTypes.getAllColors;
}

export class TreatmentSuccess implements Action {
  readonly type = TreatmentActionTypes.treatmentSuccess;

  constructor(public data: ITreatmentGroup[] | Pagination<ITreatmentGroup>) {
  }
}

export class CreateTreatment implements Action {
  readonly type = TreatmentActionTypes.createTreatment;

  constructor(public treatment: ITreatmentGroup) {
  }
}

export class UpdateTreatmentGroup implements Action {
  readonly type = TreatmentActionTypes.updateTreatmentGroup;

  constructor(public id: string, public treatment: ITreatmentGroup) {
  }
}

export class SortGroupTreatment implements Action {
  readonly type = TreatmentActionTypes.sortGroupTreatment;

  constructor(public groups: ISorted[]) {
  }
}

export class SortTreatment implements Action {
  readonly type = TreatmentActionTypes.sortTreatment;

  constructor(public treatments: ISorted[]) {
  }
}

export class ColorSuccess implements Action {
  readonly type = TreatmentActionTypes.colorSuccess;

  constructor(public colors: IColor[]) {
  }
}

export class TreatmentSaveSuccess extends ResponseSuccess implements Action {
  readonly type = TreatmentActionTypes.treatmentSaveSuccess;
}

export class TreatmentFailure implements Action {
  readonly type = TreatmentActionTypes.treatmentFailure;

  constructor(public error: IError) {
  }
}

export class TreatmentSelected implements Action {
  readonly type = TreatmentActionTypes.treatmentSelected;

  constructor(public selected?: ITreatmentGroup, public path?: string) {
  }
}

export class GetTreatmentGroup implements Action {
  readonly type = TreatmentActionTypes.getTreatmentGroup;

  constructor(public id: string, public path: string) {
  }
}

export class DeleteTreatmentGroup implements Action {
  readonly type = TreatmentActionTypes.deleteTreatmentGroup;

  constructor(public id: string, public name: string) {
  }
}

export class GetAllTreatmentsHistory implements Action {
  readonly type = TreatmentActionTypes.getAllTreatmentsHistory;

  constructor(public id: string, public treatmentId: string) {
  }
}

export class TreatmentHistorySuccess implements Action {
  readonly type = TreatmentActionTypes.treatmentHistorySuccess;

  constructor(public history: ITreatmentAll[]) {
  }
}

export class Clean implements Action {
  readonly type = TreatmentActionTypes.clean;
}

export type All =
  | GetTreatmentsPage
  | GetAllTreatmentsGroup
  | GetAllColors
  | CreateTreatment
  | UpdateTreatmentGroup
  | SortTreatment
  | SortGroupTreatment
  | TreatmentSuccess
  | ColorSuccess
  | TreatmentSaveSuccess
  | TreatmentFailure
  | GetTreatmentGroup
  | TreatmentSelected
  | DeleteTreatmentGroup
  | GetAllTreatmentsHistory
  | TreatmentHistorySuccess
  | Clean;

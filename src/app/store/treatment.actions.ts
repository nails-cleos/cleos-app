import { Action } from '@ngrx/store';

export enum TreatmentActionTypes {
  getTreatmentsPage = '[Treatment] Get treatments page',
  getAllTreatmentsGroup = '[Treatment] Get all treatments group',
  getAllColors = '[Treatment] Get all colors',
  treatmentSuccess = '[Treatment] Success',
  colorSuccess = '[Treatment] color Success',
  createTreatment = '[Treatment] Create treatment',
  updateTreatmentGroupById = '[Treatment] Update treatment group by id',
  sortTreatment = '[Treatment] Sort treatment',
  sortGroupTreatment = '[Treatment] Sort group treatment',
  treatmentSaveSuccess = '[Treatment] Save Success',
  treatmentFailure = '[Treatment] Failure',
  treatmentSelected = '[Treatment] Selected',
  findTreatmentGroupById = '[Treatment] Find treatment group by id',
  deleteTreatmentGroupById = '[Treatment] Delete treatment group by id',
  getAllTreatmentsHistory = '[Treatment] Get all treatments history',
  treatmentHistorySuccess = '[Treatment] History success',
  clean = '[Treatment] Clean'
}

export class GetTreatmentsPage implements Action {
  readonly type = TreatmentActionTypes.getTreatmentsPage;

  constructor(public payload: any) {
  }
}

export class GetAllTreatmentsGroup implements Action {
  readonly type = TreatmentActionTypes.getAllTreatmentsGroup;
}

export class GetAllColors implements Action {
  readonly type = TreatmentActionTypes.getAllColors;
}

export class TreatmentSuccess implements Action {
  readonly type = TreatmentActionTypes.treatmentSuccess;

  constructor(public payload: any) {
  }
}

export class CreateTreatment implements Action {
  readonly type = TreatmentActionTypes.createTreatment;

  constructor(public payload: any) {
  }
}

export class UpdateTreatmentGroupById implements Action {
  readonly type = TreatmentActionTypes.updateTreatmentGroupById;

  constructor(public payload: any) {
  }
}

export class SortGroupTreatment implements Action {
  readonly type = TreatmentActionTypes.sortGroupTreatment;

  constructor(public payload: any) {
  }
}

export class SortTreatment implements Action {
  readonly type = TreatmentActionTypes.sortTreatment;

  constructor(public payload: any) {
  }
}

export class ColorSuccess implements Action {
  readonly type = TreatmentActionTypes.colorSuccess;

  constructor(public payload: any) {
  }
}

export class TreatmentSaveSuccess implements Action {
  readonly type = TreatmentActionTypes.treatmentSaveSuccess;

  constructor(public payload: any) {
  }
}

export class TreatmentFailure implements Action {
  readonly type = TreatmentActionTypes.treatmentFailure;

  constructor(public payload: any) {
  }
}

export class TreatmentSelected implements Action {
  readonly type = TreatmentActionTypes.treatmentSelected;

  constructor(public payload: any) {
  }
}

export class FindTreatmentGroupById implements Action {
  readonly type = TreatmentActionTypes.findTreatmentGroupById;

  constructor(public payload: any) {
  }
}

export class DeleteTreatmentGroupById implements Action {
  readonly type = TreatmentActionTypes.deleteTreatmentGroupById;

  constructor(public payload: any) {
  }
}

export class GetAllTreatmentsHistory implements Action {
  readonly type = TreatmentActionTypes.getAllTreatmentsHistory;

  constructor(public payload: any) {
  }
}

export class TreatmentHistorySuccess implements Action {
  readonly type = TreatmentActionTypes.treatmentHistorySuccess;

  constructor(public payload: any) {
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
  | UpdateTreatmentGroupById
  | SortTreatment
  | SortGroupTreatment
  | TreatmentSuccess
  | ColorSuccess
  | TreatmentSaveSuccess
  | TreatmentFailure
  | FindTreatmentGroupById
  | TreatmentSelected
  | DeleteTreatmentGroupById
  | GetAllTreatmentsHistory
  | TreatmentHistorySuccess
  | Clean;

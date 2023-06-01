import { Action } from '@ngrx/store';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';

export enum TreatmentActionTypes {
  getAll = '[Treatment] Get all',
  getAllGroup = '[Treatment] Get all group',
  treatmentSuccess = '[Treatment] Success',
  treatmentSave = '[Treatment] Save',
  treatmentUpdate = '[Treatment] Update',
  treatmentUpdateSort = '[Treatment] Update sort',
  treatmentSaveSuccess = '[Treatment] Save Success',
  treatmentFailure = '[Treatment] Failure',
  treatmentSelected = '[Treatment] Selected',
  treatmentFind = '[Treatment] Find',
  treatmentDelete = '[Treatment] Delete',
  treatmentHistory = '[Treatment] history',
  treatmentHistorySuccess = '[Treatment] history success',
  clean = '[Treatment] Clean'
}

export class GetAll implements Action {
  readonly type = TreatmentActionTypes.getAll;

  constructor(public payload: any) {
  }
}

export class GetAllGroup implements Action {
  readonly type = TreatmentActionTypes.getAllGroup;
}

export class TreatmentSuccess implements Action {
  readonly type = TreatmentActionTypes.treatmentSuccess;

  constructor(public payload: any) {
  }
}

export class TreatmentSave implements Action {
  readonly type = TreatmentActionTypes.treatmentSave;

  constructor(public payload: any) {
  }
}

export class TreatmentUpdate implements Action {
  readonly type = TreatmentActionTypes.treatmentUpdate;

  constructor(public payload: any) {
  }
}

export class TreatmentUpdateSort implements Action {
  readonly type = TreatmentActionTypes.treatmentUpdateSort;

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

export class TreatmentFind implements Action {
  readonly type = TreatmentActionTypes.treatmentFind;

  constructor(public payload: any) {
  }
}

export class DeleteTreatment implements Action {
  readonly type = TreatmentActionTypes.treatmentDelete;

  constructor(public payload: any) {
  }
}

export class TreatmentHistory implements Action {
  readonly type = TreatmentActionTypes.treatmentHistory;

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
  | GetAll
  | GetAllGroup
  | TreatmentSave
  | TreatmentUpdate
  | TreatmentUpdateSort
  | TreatmentSuccess
  | TreatmentSaveSuccess
  | TreatmentFailure
  | TreatmentFind
  | TreatmentSelected
  | DeleteTreatment
  | TreatmentHistory
  | TreatmentHistorySuccess
  | Clean;

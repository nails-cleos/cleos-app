import { createAction, props } from '@ngrx/store';
import { IError, PageRequest, ResponseSuccess } from '../interfaces/common';
import { ITreatmentAll, ITreatmentGroup, ITreatmentGroupAll } from '../interfaces/treatment';
import { IColorAll } from '../interfaces/color';
import { ISorted } from '../util/drag-drop-sorting/drag-drop-sorting.component';
import { Pagination } from '../interfaces/pagination';

enum TreatmentActionTypes {
  getTreatmentsPage = '[Treatment] Get treatments page',
  getAllTreatmentsGroup = '[Treatment] Get all treatments group',
  getAllColors = '[Treatment] Get all colors',
  treatmentSuccess = '[Treatment] Success',
  colorSuccess = '[Treatment] Color Success',
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
  setCurrentTreatmentId = '[Treatment] Set current treatment id',
  clean = '[Treatment] Clean'
}

export const getTreatmentsPage = createAction(
  TreatmentActionTypes.getTreatmentsPage,
  props<PageRequest>(),
);

export const getAllTreatmentsGroup = createAction(
  TreatmentActionTypes.getAllTreatmentsGroup,
);

export const getAllColors = createAction(
  TreatmentActionTypes.getAllColors,
);

export const treatmentSuccess = createAction(
  TreatmentActionTypes.treatmentSuccess,
  props<{ data: ITreatmentGroupAll[] | Pagination<ITreatmentGroupAll> }>(),
);

export const colorSuccess = createAction(
  TreatmentActionTypes.colorSuccess,
  props<{ colors: IColorAll[] }>(),
);

export const createTreatment = createAction(
  TreatmentActionTypes.createTreatment,
  props<{ treatmentGroup: ITreatmentGroup }>(),
);

export const updateTreatmentGroup = createAction(
  TreatmentActionTypes.updateTreatmentGroup,
  props<{ id: string; treatmentGroup: ITreatmentGroup }>(),
);

export const sortTreatment = createAction(
  TreatmentActionTypes.sortTreatment,
  props<{ treatments: ISorted[] }>(),
);

export const sortGroupTreatment = createAction(
  TreatmentActionTypes.sortGroupTreatment,
  props<{ groups: ISorted[] }>(),
);

export const treatmentSaveSuccess = createAction(
  TreatmentActionTypes.treatmentSaveSuccess,
  props<ResponseSuccess>(),
);

export const treatmentFailure = createAction(
  TreatmentActionTypes.treatmentFailure,
  props<{ error: IError }>(),
);

export const treatmentSelected = createAction(
  TreatmentActionTypes.treatmentSelected,
  props<{ selected?: ITreatmentGroupAll; path?: string }>(),
);

export const getTreatmentGroup = createAction(
  TreatmentActionTypes.getTreatmentGroup,
  props<{ id: string; path: string }>(),
);

export const deleteTreatmentGroup = createAction(
  TreatmentActionTypes.deleteTreatmentGroup,
  props<{ id: string; name: string }>(),
);

export const getAllTreatmentsHistory = createAction(
  TreatmentActionTypes.getAllTreatmentsHistory,
  props<{ id: string; treatmentId: string }>(),
);

export const treatmentHistorySuccess = createAction(
  TreatmentActionTypes.treatmentHistorySuccess,
  props<{ history: ITreatmentAll[] }>(),
);

export const setCurrentTreatmentId = createAction(
  TreatmentActionTypes.setCurrentTreatmentId,
  props<{ treatmentId: string }>(),
);

export const cleanTreatment = createAction(TreatmentActionTypes.clean);

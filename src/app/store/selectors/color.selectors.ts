import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IColorAll } from '../../interfaces/color';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { COLOR_FEATURE_KEY, ColorState } from '../reducers/color.reducers';

const selectColorState = createFeatureSelector<ColorState>(COLOR_FEATURE_KEY);

const selectColorPaginationData = createSelector(
  selectColorState,
  (state: ColorState) => state?.data,
);
export const getColorPaginationPipe = pipe(select(selectColorPaginationData));

const selectCurrentColorId = createSelector(
  selectColorState,
  (state: ColorState) => state?.currentColorId,
);
export const getCurrentColorIdPipe = pipe(
  select(selectCurrentColorId),
  filter((val): val is string => val !== undefined),
);

const selectedColor = createSelector(
  selectColorState,
  (state: ColorState) => state?.selected,
);
export const getSelectedColorPipe = pipe(
  select(selectedColor),
  filter((val): val is IColorAll => val !== undefined),
);

const selectSubErrors = createSelector(
  selectColorState,
  (state: ColorState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

export const selectColorResponse = createSelector(
  selectColorState,
  (state: ColorState) => state?.response,
);
export const getColorResponsePipe = pipe(
  select(selectColorResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectColorError = createSelector(
  selectColorState,
  (state: ColorState) => state?.error,
);

export const selectColorIsLoading = createSelector(
  selectColorState,
  (state: ColorState) => state?.isLoading,
);

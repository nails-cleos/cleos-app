import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IOffice, IOfficeAll } from '../../interfaces/office';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { OFFICE_FEATURE_KEY, OfficeState } from '../reducers/office.reducers';
import { Pagination } from '../../interfaces/pagination';
import { IUserAll } from '../../interfaces/user';

const selectOfficeState = createFeatureSelector<OfficeState>(OFFICE_FEATURE_KEY);

const selectOfficePaginationData = createSelector(
  selectOfficeState,
  (state: OfficeState) => state?.data,
);
export const getOfficePaginationPipe = pipe(
  select(selectOfficePaginationData),
  filter((val): val is Pagination<IOffice> => val !== undefined),
);

const selectCurrentOfficeId = createSelector(
  selectOfficeState,
  (state: OfficeState) => state?.currentOfficeId,
);
export const getCurrentOfficeIdPipe = pipe(
  select(selectCurrentOfficeId),
  filter((val): val is string => val !== undefined),
);

const selectedOffice = createSelector(
  selectOfficeState,
  (state: OfficeState) => state?.selected,
);
export const getSelectedOfficePipe = pipe(
  select(selectedOffice),
  filter((val): val is IOfficeAll => val !== undefined),
);

const selectManagers = createSelector(
  selectOfficeState,
  (state: OfficeState) => state?.managers,
);
export const getManagersPipe = pipe(
  select(selectManagers),
  filter((val): val is IUserAll[] => val !== undefined),
);

const selectSubErrors = createSelector(
  selectOfficeState,
  (state: OfficeState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

export const selectOfficeResponse = createSelector(
  selectOfficeState,
  (state: OfficeState) => state?.response,
);
export const getOfficeResponsePipe = pipe(
  select(selectOfficeResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectOfficeError = createSelector(
  selectOfficeState,
  (state: OfficeState) => state?.error,
);

export const selectOfficeIsLoading = createSelector(
  selectOfficeState,
  (state: OfficeState) => state?.isLoading,
);

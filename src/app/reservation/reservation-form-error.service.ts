import { Injectable } from '@angular/core';
import { IError } from '../interfaces/common';

export type ReservationErrorState<
  TField extends string,
  TErrors extends Record<string, unknown>,
> = {
  errors: TErrors;
  fields: TField[];
  stepIndex?: number;
};

export type ReservationErrorStateOptions<
  TField extends string,
  TErrors extends Record<string, unknown>,
> = {
  allowedFields: readonly TField[];
  createErrors: () => TErrors;
  defaultStepIndex: number;
  stepByField?: Partial<Record<TField, number>>;
};

@Injectable({
  providedIn: 'root',
})
export class ReservationFormErrorService {
  createErrorState<
    TField extends string,
    TErrors extends Record<string, unknown>,
  >(
    subErrors: IError[],
    options: ReservationErrorStateOptions<TField, TErrors>,
  ): ReservationErrorState<TField, TErrors> {
    const errors = options.createErrors();
    const fields = new Set<TField>();
    let stepIndex: number | undefined;

    subErrors.forEach((error) => {
      const field = this.toField(error.field, options.allowedFields);
      if (!stepIndex && stepIndex !== 0) {
        stepIndex = field
          ? (options.stepByField?.[field] ?? options.defaultStepIndex)
          : options.defaultStepIndex;
      }

      if (!field) {
        return;
      }

      errors[field] = error.message as TErrors[TField];
      fields.add(field);
    });

    return {
      errors,
      fields: Array.from(fields),
      stepIndex,
    };
  }

  private toField<TField extends string>(
    field: string | undefined,
    allowedFields: readonly TField[],
  ): TField | undefined {
    return allowedFields.find((allowedField) => allowedField === field);
  }
}

import { createReservationErrors, ReservationFormField } from './reservation-form.types';
import { ReservationFormErrorService } from './reservation-form-error.service';

describe('ReservationFormErrorService', () => {
  let service: ReservationFormErrorService;

  const reservationFields = [
    'customer',
    'room',
    'professional',
    'office',
    'treatment',
    'discount',
    'group',
    'customerChange',
    'reference',
    'note',
    'option',
    'amount',
    'transfer',
  ] as const satisfies readonly ReservationFormField[];

  beforeEach(() => {
    service = new ReservationFormErrorService();
  });

  it('should map sub errors into typed reservation errors', () => {
    const state = service.createErrorState([
      { field: 'customer', message: 'Customer is required' } as any,
      { field: 'note', message: 'Note is invalid' } as any,
    ], {
      allowedFields: reservationFields,
      createErrors: createReservationErrors,
      defaultStepIndex: 0,
    });

    expect(state.stepIndex).toBe(0);
    expect(state.errors.customer).toBe('Customer is required');
    expect(state.errors.note).toBe('Note is invalid');
    expect(state.fields).toEqual(['customer', 'note']);
  });

  it('should use room and professional specific step indexes', () => {
    const roomState = service.createErrorState([{ field: 'room', message: 'Room is required' } as any], {
      allowedFields: reservationFields,
      createErrors: createReservationErrors,
      defaultStepIndex: 2,
      stepByField: { room: 1, professional: 3 },
    });
    const professionalState = service.createErrorState(
      [{ field: 'professional', message: 'Professional is required' } as any],
      {
        allowedFields: reservationFields,
        createErrors: createReservationErrors,
        defaultStepIndex: 2,
        stepByField: { room: 1, professional: 3 },
      },
    );

    expect(roomState.stepIndex).toBe(1);
    expect(professionalState.stepIndex).toBe(3);
  });

  it('should ignore fields that are not allowed for the current flow', () => {
    const state = service.createErrorState(
      [{ field: 'phone', message: 'Phone is invalid' } as any],
      {
        allowedFields: reservationFields,
        createErrors: createReservationErrors,
        defaultStepIndex: 0,
      },
    );

    expect(state.fields).toEqual([]);
    expect(state.errors).toEqual(createReservationErrors());
    expect(state.stepIndex).toBe(0);
  });
});

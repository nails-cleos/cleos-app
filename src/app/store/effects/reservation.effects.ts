import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsReservation from '../reservation.actions';
import { TranslateService } from '@ngx-translate/core';
import { ReservationService } from '../../services/reservation.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TreatmentService } from '../../services/treatment.service';
import { RoomService } from '../../services/room.service';
import { TrackingService } from '../../services/tracking.service';
import { PaymentService } from '../../services/payment.service';
import { AdditionalService } from '../../services/additional.service';
import { newDateTimestamp } from '../../util/dates';
import { Role } from '../../interfaces/token';
import { ColorService } from '../../services/color.service';

@Injectable()
export class ReservationEffects {

  getAllPage$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllPage)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.getAllPage(payload.page, payload.all, payload.roomId, payload.professionalId,
        payload.active, payload.direction, payload.size).pipe(
        switchMap((response) => of(
          new fromActionsReservation.ReservationPageSuccess(response ? response : { content: [] }))
        ), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
      )
    )
  ));

  getCustomerReservations$ = createEffect(() =>
    this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getCustomerReservations)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) =>
        this.reservationService.getCustomerReservations(payload.active, payload.direction, payload.page, payload.size).pipe(
          switchMap((response) => of(new fromActionsReservation.ReservationCustomerSuccess(response))),
          catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
        ))
    ));

  getAllFilterReservationsPage$ = createEffect(() =>
    this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllFilterPage)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) =>
        this.reservationService.getAllFilterReservationsPage(payload.active, payload.direction, payload.page,
          payload.size, payload.userId, payload.states).pipe(
          switchMap((response) => of(new fromActionsReservation.ReservationFilterPageSuccess(response ? response : { content: [] }))),
          catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
        ))
    ));

  getAllGroupingByRoom$ = createEffect(() =>
    this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllGroupingByRoom)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.reservationService.getAllGroupingByRoom(payload.days, payload.date, payload.roomId, payload.professionalId).pipe(
        switchMap((response) => of(new fromActionsReservation.ReservationSuccess(response ? response[0] : []))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
      ))
    ));

  search$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.searchReservation)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.search(payload.roomId, payload.days, payload.dates, payload.professionalId).pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  customerSearch$ = createEffect(() =>
    this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.customerSearchReservation)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.reservationService.customerSearch(payload.roomId, payload.treatmentId,
        payload.date, payload.professionalId, payload.additionalIds).pipe(
        switchMap((response) => of(new fromActionsReservation.ReservationSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
      ))
    ));

  getAllCustomers$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getCustomers)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.userService.getAllCustomers().pipe(
      switchMap((response) => of(new fromActionsReservation.CustomersSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  getCustomerInfo$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getCustomerInfo)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.userService.getCustomerInformation(payload).pipe(
      switchMap((response) => of(new fromActionsReservation.CustomerSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  getAllTreatments$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getTreatments)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.treatmentService.getAllTreatments(payload.roomId, payload?.customerId).pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationTreatmentsSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  getAllRooms$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getRooms,
    fromActionsReservation.ReservationActionTypes.findRooms)).pipe(map((action: any) => action.payload),
    switchMap((payload: any) => this.roomService.getAllRooms(payload?.customerId).pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationRoomsSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  getAllAdditional$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getAdditional)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.additionalService.getAllAdditional(payload.roomId, payload.groupId).pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationAdditionalSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  getUpcomingReservation$ = createEffect(() =>
    this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.getUpcomingReservation)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.reservationService.getUpcomingReservation().pipe(
        switchMap((response) => of(new fromActionsReservation.ReservationCustomerSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
      ))
    ));

  findOne$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.getById(payload.id, payload.edit).pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationSelected(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  findPayments$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationFindPayments)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.paymentService.findByResourceId(payload, 'reservation').pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationPaymentsSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  findHistory$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationFindHistory)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.findHistory(payload.id).pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationHistorySuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  save$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.add(payload.reservation).pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationSaveSuccess({
        message: this.translate.instant('COMMON.RESERVATION.CREATED', { date: newDateTimestamp(response[0].timestamp) }),
        id: response[0].id,
        role: payload.role,
        paymentLink: response[0].paymentLink,
        navigate: true
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  delete$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.delete(payload.id).pipe(
      switchMap(() => of(new fromActionsReservation.ReservationSaveSuccess({
        message: this.translate.instant('RESERVATION.DELETED.MESSAGE', { date: newDateTimestamp(payload.timestamp) }),
        deleted: true,
        role: Role.professional,
        navigate: true
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  approve$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.approve)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'approve').pipe(
      switchMap(() => of(new fromActionsReservation.StateSuccess({
        id: payload,
        message: this.translate.instant('COMMON.RESERVATION.STATE.APPROVE')
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  edit$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.edit)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.update(payload.reservation).pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationSaveSuccess({
        message: this.translate.instant('COMMON.RESERVATION.UPDATED.MESSAGE', { date: newDateTimestamp(response.timestamp) }),
        id: response.id,
        role: payload.role,
        paymentLink: response.paymentLink,
        navigate: true
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  start$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.start)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload, 'start').pipe(
      switchMap(() => of(new fromActionsReservation.StateSuccess({
        id: payload,
        message: this.translate.instant('COMMON.RESERVATION.STATE.START')
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  complete$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.complete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) =>
      this.reservationService.changeState(payload.reservationId, 'complete', payload.complete).pipe(
        switchMap(() => of(new fromActionsReservation.ReservationCompleteSuccess({
          id: payload.reservationId,
          isDashboard: payload.isDashboard,
          message: this.translate.instant('COMMON.RESERVATION.STATE.COMPLETE')
        }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
          error: err.error
        })))
      ))
  ));

  paymentComplete$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.paymentComplete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) =>
      this.reservationService.paymentComplete(payload).pipe(
        switchMap(() => of(new fromActionsReservation.StateSuccess({
          id: payload,
          message: this.translate.instant('RESERVATION.STATE.COMPLETE')
        }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
          error: err.error
        })))
      ))
  ));

  cancel$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.cancel)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload.id, 'cancel', payload.paymentCancellation).pipe(
      switchMap(() => of(new fromActionsReservation.StateSuccess({
        id: payload,
        message: this.translate.instant('RESERVATION.STATE.CANCEL')
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  customerCancel$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.customerCancel)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeState(payload.id, 'cancel/customer', payload.paymentCancellation).pipe(
      switchMap((response) => of(new fromActionsReservation.StateSuccess({
        id: payload,
        message: this.translate.instant('RESERVATION.STATE.CANCEL'),
        paymentLink: response.paymentLink
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  changeCustomer$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.changeCustomer)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeCustomer(payload.reservationId, payload.customerId).pipe(
      switchMap(() => of(new fromActionsReservation.StateSuccess({
        id: payload.reservationId,
        message: this.translate.instant('RESERVATION.STATE.CHANGE_CUSTOMER')
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  changeColor$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.changeColor)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.changeColor(payload.reservationId, payload.colorId).pipe(
      switchMap(() => of(new fromActionsReservation.StateSuccess({
        id: payload.reservationId,
        message: this.translate.instant('RESERVATION.STATE.CHANGE_COLOR')
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  findTracking$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.findTracking)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.trackingService.findByReservationId(payload.reservationId).pipe(
      switchMap((response) => of(new fromActionsReservation.TrackingSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  executeTracking$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.executeTracking)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.trackingService.executeByReservationId(payload.reservationId).pipe(
      switchMap((response) => of(new fromActionsReservation.TrackingSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  updateByReservationId$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.updateTracking)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.trackingService.updateByReservationId(payload.reservationId, payload.started, payload.completed).pipe(
      switchMap((response) => of(new fromActionsReservation.TrackingSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  review$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.reservationReview)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.addReview(payload).pipe(
      switchMap((response) => of(new fromActionsReservation.ReservationSaveSuccess({
        message: this.translate.instant('ME.REVIEW.CREATED'),
        id: response.id,
        role: Role.customer,
        navigate: true
      }))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  getAllColorsByTreatmentId$ = createEffect(() => this.actions
    .pipe(ofType(fromActionsReservation.ReservationActionTypes.getAllColorsByTreatmentId)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.colorService.getAllByTreatmentId(payload).pipe(
        switchMap((response: any) => of(new fromActionsReservation.ColorSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
      ))
    ));

  paymentOptions$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.paymentOptions)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.paymentService.paymentOptions().pipe(
      switchMap((response: any) => of(new fromActionsReservation.PaymentOptionsSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({ error: err.error })))
    ))
  ));

  updateNote$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.updateNote)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.addNote(payload.reservation.id, payload.note, payload.customerNote).pipe(
      switchMap(() => of(new fromActionsReservation.ReservationSaveSuccess({
        message: this.translate.instant('COMMON.RESERVATION.UPDATED.MESSAGE', { date: newDateTimestamp(payload.reservation.timestamp) }),
        id: payload.reservation.id,
        role: payload.role,
        paymentLink: payload.reservation.paymentLink,
        navigate: true
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  updateDiscount$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.updateDiscount)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.addDiscount(payload.reservationId, payload.discountId).pipe(
      switchMap((response: any) => of(new fromActionsReservation.ReservationSaveSuccess({
        message: this.translate.instant('COMMON.RESERVATION.UPDATED.MESSAGE', { date: newDateTimestamp(response.timestamp) }),
        id: response.id,
        role: payload.role,
        paymentLink: response.paymentLink,
        navigate: true
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  updateTimestamp$ = createEffect(() => this.actions.pipe(ofType(fromActionsReservation.ReservationActionTypes.updateTimestamp)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.reservationService.addTimestamp(payload.reservation.id, payload.start).pipe(
      switchMap(() => of(new fromActionsReservation.ReservationSaveSuccess({
        message: this.translate.instant('COMMON.RESERVATION.UPDATED.MESSAGE', { date: newDateTimestamp(payload.reservation.timestamp) }),
        id: payload.reservation.id,
        role: payload.role,
        paymentLink: payload.reservation.paymentLink,
        navigate: false
      }))), catchError((err: HttpErrorResponse) => of(new fromActionsReservation.ReservationFailure({
        error: err.error
      })))
    ))
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationSelected),
    tap((data: any) => {
      if (data.payload.paymentLink) {
        window.open(data.payload.paymentLink, '_self');
        return;
      }
      this.router.navigate([this.router.url]);
    })
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationSuccess)
  ), { dispatch: false });

  dataPageSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationPageSuccess)
  ), { dispatch: false });

  filterPageSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationFilterPageSuccess)
  ), { dispatch: false });

  customersSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.customersSuccess)
  ), { dispatch: false });

  customerSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.customerSuccess)
  ), { dispatch: false });

  treatmentsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationTreatmentsSuccess)
  ), { dispatch: false });

  roomsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationRoomsSuccess)
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationSaveSuccess),
    tap((data: any) => {
      if (data.payload.navigate) {
        let navigation = [this.translate.currentLang];
        switch (data.payload.role) {
          case Role.customer:
            if (data.payload.paymentLink) {
              window.open(data.payload.paymentLink, '_self');
            }
            navigation = [...navigation, 'me', 'reservations'];
            break;
          case Role.professional:
            navigation = data.payload.deleted ? [...navigation, 'dashboard'] : [...navigation, 'reservation', data.payload.id];
            break;
          case Role.roomAdmin:
            navigation = [...navigation, 'events'];
            break;
        }
        this.router.navigate(navigation);
      }
    })
  ), { dispatch: false });

  stateSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.stateSuccess),
    tap((data: any) => {
      if (data.payload.paymentLink) {
        window.open(data.payload.paymentLink, '_self');
        return;
      }
    })
  ), { dispatch: false });

  reservationComplete$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationCompleteSuccess),
    tap((data: any) => {
      this.router.navigate(data.payload.isDashboard ?
        [this.translate.currentLang, 'events'] : [this.translate.currentLang, 'reservation', data.payload.id]);
    })
  ), { dispatch: false });

  reservationCustomersSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationsCustomerSuccess)
  ), { dispatch: false });

  reservationAdditionalSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationAdditionalSuccess)
  ), { dispatch: false });

  trackingSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.trackingSuccess)
  ), { dispatch: false });

  paymentsSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsReservation.ReservationActionTypes.reservationPaymentsSuccess)
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions, private router: Router,
              private reservationService: ReservationService, private userService: UserService,
              private treatmentService: TreatmentService, private roomService: RoomService,
              private additionalService: AdditionalService, private trackingService: TrackingService,
              private paymentService: PaymentService, private colorService: ColorService) {
  }
}

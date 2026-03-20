/* eslint-disable camelcase */
import { BehaviorSubject, Subject } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeReservationComponent } from './me-reservation.component';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../../services/auth-user.service';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { signal } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';

describe('MeReservationComponent', () => {
  let component: MeReservationComponent;
  let fixture: ComponentFixture<MeReservationComponent>;

  let navigationParams$: BehaviorSubject<any>;
  let reservationId$: BehaviorSubject<any>;
  let additionalList$: BehaviorSubject<any>;
  let treatmentDiscount$: BehaviorSubject<any>;
  let rooms$: BehaviorSubject<any>;
  let selectedReservation$: BehaviorSubject<any>;
  let customerReservation$: BehaviorSubject<any>;
  let availableList$: BehaviorSubject<any>;
  let paymentOptions$: BehaviorSubject<any>;
  let subErrors$: BehaviorSubject<any>;
  let params$: Subject<any>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let firebaseServiceSpy: jasmine.SpyObj<FirebaseService>;

  beforeEach(async () => {
    navigationParams$ = new BehaviorSubject(undefined);
    reservationId$ = new BehaviorSubject(undefined);
    additionalList$ = new BehaviorSubject(undefined);
    treatmentDiscount$ = new BehaviorSubject(undefined);
    rooms$ = new BehaviorSubject(undefined);
    selectedReservation$ = new BehaviorSubject(undefined);
    customerReservation$ = new BehaviorSubject(undefined);
    availableList$ = new BehaviorSubject(undefined);
    paymentOptions$ = new BehaviorSubject(undefined);
    subErrors$ = new BehaviorSubject(undefined);
    params$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj<Store<ReservationState>>('Store', ['pipe', 'dispatch']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
      params: params$.asObservable(),
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });
    firebaseServiceSpy = jasmine.createSpyObj('FirebaseService', ['logEvent']);

    const storeStreams = [
      navigationParams$,
      reservationId$,
      additionalList$,
      treatmentDiscount$,
      rooms$,
      selectedReservation$,
      customerReservation$,
      availableList$,
      paymentOptions$,
      subErrors$,
    ];
    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(
      () => storeStreams[pipeCallIndex++]?.asObservable() ?? new BehaviorSubject(undefined).asObservable());

    await TestBed.configureTestingModule({
      imports: [MeReservationComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: FirebaseService, useValue: firebaseServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    navigationParams$.complete();
    reservationId$.complete();
    additionalList$.complete();
    treatmentDiscount$.complete();
    rooms$.complete();
    selectedReservation$.complete();
    customerReservation$.complete();
    availableList$.complete();
    paymentOptions$.complete();
    subErrors$.complete();
    params$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log and load the reservation when reservationId is available', () => {
    reservationId$.next('reservation-1');
    fixture.detectChanges();

    expect(firebaseServiceSpy.logEvent).toHaveBeenCalledWith('screen_view', jasmine.objectContaining({
      firebase_screen: 'Edit customer reservation reservation-1',
    }));
    expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Reservation] Find edit',
      id: 'reservation-1',
    }));
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeReservationComponent } from './me-reservation.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Analytics } from '@angular/fire/analytics';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../../services/auth-user.service';
import { ReservationState } from '../../../store/reducers/reservation.reducers';
import { AnalyticsStub } from '../../../util/firebase-stub';
import { signal } from '@angular/core';

describe('MeReservationComponent', () => {
  let component: MeReservationComponent;
  let fixture: ComponentFixture<MeReservationComponent>;

  let state$: Subject<any>;
  let params$: Subject<any>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    state$ = new Subject<any>();
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

    storeSpy.pipe.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [MeReservationComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Analytics, useClass: AnalyticsStub },
        { provide: AuthUserService, useValue: authUserServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    state$.complete();
    params$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

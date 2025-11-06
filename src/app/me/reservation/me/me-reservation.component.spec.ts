import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeReservationComponent } from './me-reservation.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Analytics } from '@angular/fire/analytics';
import { AuthUserService } from '../../../services/auth-user.service';
import { AppState } from '../../../store/app.states';

describe('MeReservationComponent', () => {
  let component: MeReservationComponent;
  let fixture: ComponentFixture<MeReservationComponent>;

  let state$: Subject<any>;
  let params$: Subject<any>;
  let authUser$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let analyticsSpy: jasmine.SpyObj<Analytics>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    state$ = new Subject<any>();
    params$ = new Subject<any>();
    authUser$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj<Store<AppState>>('Store', ['dispatch', 'select']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        paramMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
      params: params$.asObservable(),
    });
    analyticsSpy = jasmine.createSpyObj('Analytics', ['logEvent'], {
      app: { options: {} },
      gtagFunction: () => {
      },
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUser$.asObservable(),
    });

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [MeReservationComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Analytics, useValue: analyticsSpy },
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
    authUser$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

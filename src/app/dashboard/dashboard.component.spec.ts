import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AuthUserService, IAuthUser, initialAuthUser } from '../services/auth-user.service';
import { signal } from '@angular/core';

describe('DashComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let navigationParams$: BehaviorSubject<any>;
  let dashboardMap$: BehaviorSubject<any>;
  let error$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<any>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    navigationParams$ = new BehaviorSubject(undefined);
    dashboardMap$ = new BehaviorSubject(undefined);
    error$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return navigationParams$.asObservable();
        case 2:
          return dashboardMap$.asObservable();
        case 3:
          return error$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});

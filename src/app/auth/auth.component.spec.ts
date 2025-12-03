import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthComponent } from './auth.component';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthState } from '../store/reducers/auth.reducers';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  let currentCode$: BehaviorSubject<any>;
  let isAuthenticated$: BehaviorSubject<any>;
  let redirect$: BehaviorSubject<any>;
  let queryParams$: BehaviorSubject<any>;

  let storeSpy: jasmine.SpyObj<Store<AuthState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let authSpy: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    currentCode$ = new BehaviorSubject(undefined);
    isAuthenticated$ = new BehaviorSubject(undefined);
    redirect$ = new BehaviorSubject(undefined);
    queryParams$ = new BehaviorSubject(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    authSpy = jasmine.createSpyObj('Auth', ['onIdTokenChanged'], {
      currentUser: null,
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        queryParamMap: jasmine.createSpyObj('ParamMap', ['get']),
      },
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return currentCode$.asObservable();
        case 2:
          return isAuthenticated$.asObservable();
        case 3:
          return redirect$.asObservable();
        case 4:
          return queryParams$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    authSpy.onIdTokenChanged.and.callFake((callback: any) => {
      callback(null);
      return () => {
      };
    });

    await TestBed.configureTestingModule({
      imports: [AuthComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Auth, useValue: authSpy },
        { provide: Store, useValue: storeSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    currentCode$.complete();
    isAuthenticated$.complete();
    redirect$.complete();
    queryParams$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

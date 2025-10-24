import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthComponent } from './auth.component';
import { Auth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from '../store/app.states';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let authSpy: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    state$ = new Subject();

    const queryParamMapSpy = jasmine.createSpyObj<ParamMap>('ParamMap', ['get']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    authSpy = jasmine.createSpyObj('Auth', ['onIdTokenChanged'], {
      currentUser: null,
    });
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        queryParamMap: queryParamMapSpy,
      },
    });

    storeSpy.select.and.returnValue(state$.asObservable());
    queryParamMapSpy.get.and.returnValue(null);
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

  afterEach(() => state$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

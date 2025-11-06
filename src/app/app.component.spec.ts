import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthUserService } from './services/auth-user.service';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.states';

describe('AppComponent', () => {
  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: of({
        locale: 'en',
        theme: 'dark',
      }),
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

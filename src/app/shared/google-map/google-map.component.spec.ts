import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleMapComponent } from './google-map.component';
import { provideHttpClient, withJsonpSupport, withXhr } from '@angular/common/http';
import { AuthUserService, IAuthUser, initialAuthUser } from '@app/services/auth-user.service';
import { signal } from '@angular/core';

describe('GoogleMapComponent', () => {
  let component: GoogleMapComponent;
  let fixture: ComponentFixture<GoogleMapComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {

    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser'], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [GoogleMapComponent],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
        provideHttpClient(withXhr(), withJsonpSupport()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleMapComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});

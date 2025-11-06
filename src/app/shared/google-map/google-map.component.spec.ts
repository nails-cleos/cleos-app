import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleMapComponent } from './google-map.component';
import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AuthUserService } from '../../services/auth-user.service';

describe('GoogleMapComponent', () => {
  let component: GoogleMapComponent;
  let fixture: ComponentFixture<GoogleMapComponent>;

  let authUser$: Subject<any>;

  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    authUser$ = new Subject();

    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser'], {
      authUser: authUser$.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [GoogleMapComponent],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
        provideHttpClient(withJsonpSupport()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleMapComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => authUser$.complete());

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});

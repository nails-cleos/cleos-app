import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleMapComponent } from './google-map.component';
import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthUserService } from '../../services/auth-user.service';

describe('GoogleMapComponent', () => {
  let component: GoogleMapComponent;
  let fixture: ComponentFixture<GoogleMapComponent>;

  const mockAuthUserService = {
    authUser: of({
      isDarkMode: true,
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleMapComponent],
      providers: [
        { provide: AuthUserService, useValue: mockAuthUserService },
        provideHttpClient(withJsonpSupport()),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

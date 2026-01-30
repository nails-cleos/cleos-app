import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartComponent } from './chart.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { NavigationService } from '../../services/navigation.service';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  const error = {
    status: 'NOT_FOUND',
  };

  beforeEach(async () => {

    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [ChartComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('error', error);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

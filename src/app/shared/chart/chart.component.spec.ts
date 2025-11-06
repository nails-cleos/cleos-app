import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartComponent } from './chart.component';
import { Subject } from 'rxjs';
import { AuthUserService } from '../../services/auth-user.service';
import { NavigationService } from '../../services/navigation.service';
import { TranslateModule } from '@ngx-translate/core';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  let authUser$: Subject<any>;

  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  const error = {
    status: 'NOT_FOUND',
  };

  beforeEach(async () => {
    authUser$ = new Subject();

    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['reload']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUser$.asObservable(),
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
    component.error = error;
  });

  afterEach(() => authUser$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

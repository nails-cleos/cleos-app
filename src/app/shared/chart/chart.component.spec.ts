import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartComponent } from './chart.component';
import { of } from 'rxjs';
import { AuthUserService } from '../../services/auth-user.service';
import { IError } from '../../interfaces/common';
import { NavigationService } from '../../services/navigation.service';
import { TranslateModule } from '@ngx-translate/core';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  const mockAuthUserService = {
    authUser: of({
      isDarkMode: true,
    }),
  };

  const error = {
    status: 'NOT_FOUND',
  } as IError;

  const mockNavigationService = {
    reload: jasmine.createSpy('reload'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthUserService, useValue: mockAuthUserService },
        { provide: NavigationService, useValue: mockNavigationService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    component.error = error;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { IChart } from '../../interfaces/dashboard';
import { ICurrency } from '../../interfaces/currency';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;
  let dialogSpy: jasmine.Spy<any>;

  beforeEach(async () => {

    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', ['getUser', 'logout'], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [
        { provide: AuthUserService, useValue: authUserServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;

    dialogSpy = spyOn(component['dialog'], 'open');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to AuthUserService and set dark mode', () => {
    authUserSignal.update(prev => ({ ...prev, isDarkMode: true }));
    fixture.detectChanges();
    expect(component['isDarkMode']()).toBeTrue();

    authUserSignal.update(prev => ({ ...prev, isDarkMode: false }));
    fixture.detectChanges();
    expect(component['isDarkMode']()).toBeFalse();
  });

  it('should open dialog when chart is provided on click', () => {
    const chart: IChart = {
      title: 'Test Chart',
      colors: 'COLORS',
      options: 'BAR_CHART',
      labels: ['Jan', 'Feb', 'Mar'],
      dataSet: [
        { data: 10, label: '1', type: 'number' },
        { data: 20, label: '2', type: 'number' },
        { data: 30, label: '3', type: 'number' },
      ],
    };
    const mockCurrency: ICurrency = {
      id: '1',
      name: 'Test Currency',
      code: 'EUR',
      icon: 'euro',
    };

    fixture.componentRef.setInput('chart', chart);
    fixture.componentRef.setInput('currency', mockCurrency);
    fixture.componentRef.setInput('title', 'Chart');

    // act
    component.onClick();

    expect(dialogSpy).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: jasmine.objectContaining({
          chart: jasmine.objectContaining({
            labels: ['Jan', 'Feb', 'Mar'],
            type: 'bar',
            charData: jasmine.objectContaining({
              datasets: [
                jasmine.objectContaining({ data: 10, label: '1', type: 'number' }),
                jasmine.objectContaining({ data: 20, label: '2', type: 'number' }),
                jasmine.objectContaining({ data: 30, label: '3', type: 'number' }),
              ],
            }),
          }),
          title: 'Chart',
        }),
      }),
    );
  });

  it('should not open dialog when no chart is provided', () => {
    fixture.componentRef.setInput('chart', undefined);
    component.onClick();
    expect(dialogSpy).not.toHaveBeenCalled();
  });
});

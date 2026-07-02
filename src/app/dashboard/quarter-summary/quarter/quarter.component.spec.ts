import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuarterComponent } from './quarter.component';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_LOCALE } from '../../../util/dates';
import { NavigationService } from '../../../services/navigation.service';

describe('QuarterComponent', () => {
  let component: QuarterComponent;
  let fixture: ComponentFixture<QuarterComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );

    await TestBed.configureTestingModule({
      imports: [QuarterComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuarterComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('year', 2025);
    fixture.componentRef.setInput('quarter', 1);
    fixture.componentRef.setInput('measure', 'long');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return month title', () => {
    const monthName = component.getMonth(1);
    expect(monthName).toBeDefined();
  });

  it('should navigate to quarter', () => {
    fixture.componentRef.setInput('quarter', 2);
    component.goToQuarter();
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['dashboard', 'quarter', 'summary'],
      { state: { year: 2025, quarter: 2 } },
    );
  });

  it('should navigate to month with correct step for income', () => {
    component.goToMonth(1, 'INCOME');
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['dashboard', 'monthly', 'summary'],
      { state: { date: '1-2025', step: 0 } },
    );
  });

  it('should navigate to month with correct step for expense', () => {
    component.goToMonth(3, 'EXPENSE');
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['dashboard', 'monthly', 'summary'],
      { state: { date: '3-2025', step: 1 } },
    );
  });

  it('should navigate to month with correct step for cash', () => {
    component.goToMonth(4, 'CASH');
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith(
      ['dashboard', 'monthly', 'summary'],
      { state: { date: '4-2025', step: 2 } },
    );
  });
});

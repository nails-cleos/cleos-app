import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { CardComponent } from './card.component';
import { AuthUserService } from '../../services/auth-user.service';
import { IChart } from '../../interfaces/dashboard';
import { ICurrency } from '../../interfaces/currency';
import { NO_ERRORS_SCHEMA } from '@angular/core';

class MockAuthUserService {
  private subject = new Subject<any>();
  authUser = this.subject.asObservable();

  emit(value: any) {
    this.subject.next(value);
  }
}

class MockMatDialog {
  open = jasmine.createSpy('open');
}

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let mockAuthUserService: MockAuthUserService;
  let mockDialog: MockMatDialog;

  beforeEach(async () => {
    mockAuthUserService = new MockAuthUserService();
    mockDialog = new MockMatDialog();

    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [
        { provide: AuthUserService, useValue: mockAuthUserService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideProvider(MatDialog, { useValue: mockDialog })
      .compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to AuthUserService and set dark mode', () => {
    mockAuthUserService.emit({ isDarkMode: true });
    expect((component as any).isDarkMode).toBeTrue();

    mockAuthUserService.emit({ isDarkMode: false });
    expect((component as any).isDarkMode).toBeFalse();
  });

  it('should open dialog when chart is provided on click', () => {
    const chart: IChart = { /* minimal fake chart object */ } as IChart;
    const mockCurrency: ICurrency = {
      id: '1',
      name: 'Test Currency',
      code: 'EUR',
      icon: 'euro',
    };

    component.chart = chart;
    component.currency = mockCurrency;
    component.title = 'Test Chart';

    // act
    component.onClick();

    expect(mockDialog.open).toHaveBeenCalled();
    const callArgs = mockDialog.open.calls.mostRecent().args[1].data;
    expect(callArgs.title).toBe('Test Chart');
    expect(callArgs.chart).toBeDefined();
  });

  it('should not open dialog when no chart is provided', () => {
    component.chart = undefined;
    component.onClick();
    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const spy = spyOn((component as any).authUserServiceSubscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});

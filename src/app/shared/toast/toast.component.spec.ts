import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let dismiss$: Subject<void>;
  let action$: Subject<void>;

  beforeEach(() => {
    dismiss$ = new Subject<void>();
    action$ = new Subject<void>();

    const mockToastData = { type: 'success', message: 'Test toast', duration: 5000, actionType: 'none' };

    TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: 'TOAST_DATA', useValue: mockToastData },
        { provide: 'TOAST_DISMISS', useValue: dismiss$ },
        { provide: 'TOAST_ACTION', useValue: action$ },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct icon for each type', () => {
    component.data.type = 'success';
    expect(component.getIcon()).toBe('check_circle');

    component.data.type = 'error';
    expect(component.getIcon()).toBe('error');

    component.data.type = 'warning';
    expect(component.getIcon()).toBe('warning');

    component.data.type = 'info';
    expect(component.getIcon()).toBe('info');

    component.data.type = 'unknown' as any;
    expect(component.getIcon()).toBe('info');
  });

  it('should emit action$ and dismiss$ on onAction()', (done) => {
    let actionEmitted = false;
    let dismissEmitted = false;

    action$.subscribe(() => actionEmitted = true);
    dismiss$.subscribe(() => dismissEmitted = true, undefined, () => {
      // Complete callback
      expect(actionEmitted).toBeTrue();
      expect(dismissEmitted).toBeTrue();
      done();
    });

    component.onAction();
  });

  it('should emit only dismiss$ on onDismiss()', (done) => {
    let dismissEmitted = false;

    dismiss$.subscribe(() => dismissEmitted = true, undefined, () => {
      expect(dismissEmitted).toBeTrue();
      done();
    });

    component.onDismiss();
  });
});

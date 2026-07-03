import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChangeColorDialogComponent } from './change-color-dialog.component';
import { IColorAll } from '../../color/color';
import { ReservationState } from '../../store/reducers/reservation.reducers';
import { getColorsByTreatmentId } from '../../store/actions/reservation.actions';

describe('ChangeColorDialogComponent', () => {
  let component: ChangeColorDialogComponent;
  let fixture: ComponentFixture<ChangeColorDialogComponent>;

  let colors$: BehaviorSubject<IColorAll[] | undefined>;

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ChangeColorDialogComponent>>;

  const mockChangeColor = {
    treatmentId: 'treatment1',
    small: true,
  };

  const mockColors: IColorAll[] = [
    { id: '1', name: 'Green' },
    { id: '2', name: 'Blue' },
  ];

  beforeEach(async () => {
    colors$ = new BehaviorSubject<IColorAll[] | undefined>(undefined);

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    storeSpy.pipe.and.returnValue(colors$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ChangeColorDialogComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => (mockChangeColor),
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeColorDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => colors$.complete());

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should dispatch clean and getAllColors on init', () => {
    fixture.detectChanges();
    expect(storeSpy.dispatch)
      .toHaveBeenCalledWith(getColorsByTreatmentId({ treatmentId: mockChangeColor.treatmentId }));
  });

  it('should update colorsWritableSignal when store emits', () => {
    colors$.next(mockColors);
    fixture.detectChanges();

    expect(component.colorsSignal()).toEqual(mockColors);
  });

  it('should filter customers', () => {
    const result = component['filterColor']('Blue', mockColors);
    expect(result!.length).toBe(1);
    expect(result![0].name).toBe('Blue');
  });

  it('should close dialog with selected customers', () => {
    component.getForm.color.setValue(mockColors[0]);

    component.doAction();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({ colorId: mockColors[0].id });
  });

  it('should close dialog on cancel', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should clear color form control when keyDownHandler is called with Backspace', () => {
    component.getForm.color.setValue(mockColors[0]);

    component.keyDownHandler({ code: 'Backspace' } as KeyboardEvent);

    expect(component.getForm.color.value).toBe(undefined);
  });
});

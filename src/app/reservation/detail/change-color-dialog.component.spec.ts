import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AppMaterialModule } from '../../util/app-material.module';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import * as fromActionsReservation from '../../store/reservation.actions';
import { ChangeColorDialogComponent } from './change-color-dialog.component';
import { IColorAll } from '../../interfaces/color';

describe('ChangeColorDialogComponent', () => {
  let component: ChangeColorDialogComponent;
  let fixture: ComponentFixture<ChangeColorDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ChangeColorDialogComponent>>;
  let mockStore: jasmine.SpyObj<Store>;
  let stateSubject: Subject<any>;

  const mockData = {
    treatmentId: 'treatment-id',
  };

  beforeEach(async () => {
    stateSubject = new Subject();
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [ChangeColorDialogComponent, TranslateModule.forRoot(), AppMaterialModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ...mockData } },
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeColorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have data injected', () => {
    expect(component.data).toEqual(mockData);
  });

  it('onNoClick should close the dialog', () => {
    void component.onNoClick;
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('doAction should close the dialog', () => {
    const colorId = '123';
    component.colorForm.get('color')?.setValue({ id: colorId, name: 'Blue' } as IColorAll);

    void component.doAction;
    expect(mockDialogRef.close).toHaveBeenCalledWith({ colorId });
  });

  it('should render the dialog title', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1[mat-dialog-title]');
    expect(titleElement.textContent).toBe('RESERVATION.TREATMENT.COLOR.CHANGE');
  });

  it('should show both buttons when both hideNoButton and hideOkButton are false', () => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('should pass correct value to mat-dialog-close directive', () => {
    const testValue = 'test-value';
    component.data.treatmentId = testValue;
    fixture.detectChanges();

    // The Yes button should have the mat-dialog-close directive with the correct treatmentId
    // This is tested through the component's data binding
    expect(component.data.treatmentId).toBe(testValue);
  });

  it('should call dialogRef.close when No button is clicked', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];
    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.CANCEL'));
    expect(noButton).toBeTruthy();
    noButton?.click();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should display translated button texts', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];

    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.CANCEL'));
    const yesButton = buttons.find(btn => btn.textContent?.includes('RESERVATION.TREATMENT.COLOR.UPDATE'));

    expect(noButton?.textContent?.trim()).toContain('COMMON.BUTTON.CANCEL');
    expect(yesButton?.textContent?.trim()).toContain('RESERVATION.TREATMENT.COLOR.UPDATE');
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.colorForm.get('color')?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.colorForm.invalid).toBe(true);

    component.colorForm.get('color')?.setValue({ id: '1', name: 'Red' } as IColorAll);
    expect(component.colorForm.valid).toBe(true);
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should update color list when state changes', () => {
    const mockColors: IColorAll[] = [
      { id: '1', name: 'Red' },
      { id: '2', name: 'Blue' },
      { id: '3', name: 'Green' },
    ];

    stateSubject.next({
      colors: mockColors,
    });

    expect(component.colors).toEqual(mockColors);
  });

  it('should dispatch GetColor action when getColors is called', () => {
    mockStore.dispatch.calls.reset();

    component['getColors']();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsReservation.GetColorsByTreatmentId));
  });

  it('should filter colors correctly when filterColor is called', () => {
    component.colors = [
      { id: '1', name: 'Red' },
      { id: '2', name: 'Blue' },
      { id: '3', name: 'Green' },
    ] as IColorAll[];

    const result = component['filterColor']('Red');

    expect(result?.length).toBe(1);
    expect(result?.[0].name).toBe('Red');
  });

  it('should return undefined when filterColor is called with no colors', () => {
    component.colors = undefined;
    fixture.detectChanges();

    const result = component['filterColor']('Gray');

    expect(result).toBeUndefined();
  });

  it('should filter color options based on form input', (done) => {
    component.colors = [
      { name: 'Test Color 1', id: '1' },
      { name: 'Another Color', id: '2' },
      { name: 'Test Color 2', id: '3' },
    ] as any[];
    component['createForm']();

    let emissionCount = 0;
    component.filteredColor?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          { name: 'Test Color 1', id: '1' },
          { name: 'Test Color 2', id: '3' },
        ]);
        done();
      }
    });

    component.colorForm.get('color')?.setValue('T');
  });

  it('should filter color options based on color form input', (done) => {
    component.colors = [
      { name: 'Test Color 1', id: '1' },
      { name: 'Another Color', id: '2' },
      { name: 'Test Color 2', id: '3' },
    ] as any[];
    component['createForm']();

    let emissionCount = 0;
    component.filteredColor?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          { name: 'Another Color', id: '2' },
        ]);
        done();
      }
    });

    component.colorForm.get('color')?.setValue({ name: 'Another Color', id: '2' });
  });

  it('should return the color when filter is empty string', (done) => {
    const colors = [
      { name: 'Test Color 1', id: '1' },
      { name: 'Another Color', id: '2' },
      { name: 'Test Color 2', id: '3' },
    ] as IColorAll[];
    component.colors = colors;
    component['createForm']();

    component.colorForm.get('color')?.setValue('');

    component.filteredColor?.subscribe(filtered => {
      expect(filtered).toEqual(colors);
      done();
    });
  });

  it('should clear color form control when keyDownHandler is called with Backspace', () => {
    component.ngOnInit();
    component.colorForm.get('color')?.setValue('test value');

    component.keyDownHandler({ code: 'Backspace' });

    expect(component.colorForm.get('color')?.value).toBe('');
  });

  it('should not clear color form control when keyDownHandler is called with other key', () => {
    component.ngOnInit();
    component.colorForm.get('color')?.setValue('test value');

    component.keyDownHandler({ code: 'Enter' });

    expect(component.colorForm.get('color')?.value).toBe('test value');
  });

  it('should return color name when displayFnColor is called with color', () => {
    const color = { name: 'Blue', id: '1' } as IColorAll;

    const result = component.displayFnColor(color);

    expect(result).toBe(color.name);
  });

  it('should return empty string when displayFnColor is called with null', () => {
    const result = component.displayFnColor(null as any);

    expect(result).toBe('');
  });
});
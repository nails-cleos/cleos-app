import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChangeColorDialogComponent } from './change-color-dialog.component';
import { IColorAll } from '@app/color/color';
import { signal } from '@angular/core';
import { ColorStore } from '@app/store/color.store';
import { provideTranslateService } from "@ngx-translate/core";

describe('ChangeColorDialogComponent', () => {
  let component: ChangeColorDialogComponent;
  let fixture: ComponentFixture<ChangeColorDialogComponent>;

  let colorStoreSpy: {
    data: ReturnType<typeof signal>;
    loadByExternalId: jasmine.Spy;
  };
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
    colorStoreSpy = {
      data: signal(undefined),
      loadByExternalId: jasmine.createSpy('loadByExternalId'),
    };

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ChangeColorDialogComponent],
      providers: [
        provideTranslateService(),
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => (mockChangeColor),
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: ColorStore, useValue: colorStoreSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeColorDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should dispatch clean and getAllColors on init', () => {
    fixture.detectChanges();
    expect(colorStoreSpy.loadByExternalId).toHaveBeenCalledWith(mockChangeColor.treatmentId);
  });

  it('should update colorsWritableSignal when store emits', () => {
    colorStoreSpy.data.set({ kind: 'list', value: mockColors });
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

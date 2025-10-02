import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceDialogComponent } from './price-dialog.component';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('PriceDialogComponent', () => {
  let component: PriceDialogComponent;
  let fixture: ComponentFixture<PriceDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<PriceDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        UntypedFormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { name: 'Test', price: 100, currentPrice: 150 } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with currentPrice if provided', () => {
    expect(component.price.value).toBe(150);
    expect(component.form.value.price).toBe(150);
  });

  it('onNoClick should close the dialog without data', () => {
    void component.onNoClick;
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('submit should update data.price and close the dialog', () => {
    component.price.setValue(200);
    void component.submit;
    expect(component.data.price).toBe(200);
    expect(dialogRefSpy.close).toHaveBeenCalledWith(component.data);
  });
});

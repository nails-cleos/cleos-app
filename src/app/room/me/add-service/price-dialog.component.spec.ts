import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceDialogComponent } from './price-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceType } from '../../room';

describe('PriceDialogComponent', () => {
  let component: PriceDialogComponent;
  let fixture: ComponentFixture<PriceDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<PriceDialogComponent>>;

  const mockData = { name: 'Test', currentPrice: 150, type: ServiceType.treatment };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
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
    expect(component.getForm.price.value).toBe(150);
    expect(component.form.value.price).toBe(150);
  });

  it('onNoClick should close the dialog without data', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('submit should update data.price and close the dialog', () => {
    component.getForm.price.setValue(200);

    component.submit();

    const data = { type: mockData.type, price: 200 };
    expect(dialogRefSpy.close).toHaveBeenCalledWith(data);
  });

  it('should default price to zero when currentPrice is missing', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TranslateModule.forRoot(), PriceDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { name: 'Test', type: ServiceType.additional } },
      ],
    }).compileComponents();

    const defaultFixture = TestBed.createComponent(PriceDialogComponent);
    const defaultComponent = defaultFixture.componentInstance;
    defaultFixture.detectChanges();

    expect(defaultComponent.getForm.price.value).toBe(0);
  });
});

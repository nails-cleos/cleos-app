import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelDialogComponent } from './cancel-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CancelOption } from '../../../interfaces/reservation';

describe('CancelDialogComponent', () => {
  let component: CancelDialogComponent;
  let fixture: ComponentFixture<CancelDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CancelDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [CancelDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { options: [] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog without payload on no click', () => {
    component.onNoClick();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close with selected cancel option and payment type', () => {
    component.getForm.paymentCancellation.setValue(CancelOption.chargeAndAccount);
    component.getTypeForm.option.setValue({ type: 'MOLLIE' } as any);

    component.doAction();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      cancelOption: CancelOption.chargeAndAccount,
      type: 'MOLLIE',
    });
  });

  it('should not close when forms are invalid', () => {
    component.doAction();

    expect(dialogRefSpy.close).not.toHaveBeenCalledWith(jasmine.objectContaining({
      cancelOption: jasmine.anything(),
    }));
  });

  it('should preselect the only cancellation option', async () => {
    const singleDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CancelDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: singleDialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { options: ['REFUND'], currency: { code: 'EUR', icon: 'EUR' } } },
      ],
    }).compileComponents();

    const singleFixture = TestBed.createComponent(CancelDialogComponent);
    const singleComponent = singleFixture.componentInstance;
    singleFixture.detectChanges();

    expect(singleComponent.getForm.paymentCancellation.value).toBe('REFUND');
  });

  it('should hide percentage for provided payment options', async () => {
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CancelDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            options: [CancelOption.refund],
            currency: { code: 'EUR', icon: 'EUR' },
            paymentOptions: [{ type: 'MOLLIE', name: 'Mollie' }],
          },
        },
      ],
    }).compileComponents();

    const optionsFixture = TestBed.createComponent(CancelDialogComponent);
    const optionsComponent = optionsFixture.componentInstance;
    optionsFixture.detectChanges();

    expect(optionsComponent.paymentOptions?.[0].hidePercentage).toBeTrue();
  });
});

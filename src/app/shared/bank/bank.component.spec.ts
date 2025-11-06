import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankComponent } from './bank.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';

describe('BankComponent', () => {
  let component: BankComponent;
  let fixture: ComponentFixture<BankComponent>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankComponent, TranslateModule.forRoot()],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(BankComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    
    component.formGroup = formBuilder.group({
      type: [''],
      bank: [''],
      percentage: [''],
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

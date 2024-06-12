import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFieldAdderComponent } from './form-field-adder.component';

describe('FormFieldAdderComponent', () => {
  let component: FormFieldAdderComponent;
  let fixture: ComponentFixture<FormFieldAdderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldAdderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormFieldAdderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

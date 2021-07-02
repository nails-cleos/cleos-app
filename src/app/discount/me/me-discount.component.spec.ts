import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeDiscountComponent } from './me-discount.component';

describe('MeDiscountComponent', () => {
  let component: MeDiscountComponent;
  let fixture: ComponentFixture<MeDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeDiscountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCardProductComponent } from './mini-card-product.component';

describe('MiniCardProductComponent', () => {
  let component: MiniCardProductComponent;
  let fixture: ComponentFixture<MiniCardProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniCardProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniCardProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

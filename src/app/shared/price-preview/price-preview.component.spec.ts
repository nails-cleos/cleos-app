import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricePreviewComponent } from './price-preview.component';

describe('PricePreviewComponent', () => {
  let component: PricePreviewComponent;
  let fixture: ComponentFixture<PricePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PricePreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

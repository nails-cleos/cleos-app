import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSummaryItemComponent } from './total-summary-item.component';

describe('TotalSummaryItemComponent', () => {
  let component: TotalSummaryItemComponent;
  let fixture: ComponentFixture<TotalSummaryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalSummaryItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalSummaryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

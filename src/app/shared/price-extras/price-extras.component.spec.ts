import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceExtrasComponent } from './price-extras.component';
import { beforeEach, describe, expect, it } from 'vitest';

describe('PriceExtrasComponent', () => {
  let component: PriceExtrasComponent;
  let fixture: ComponentFixture<PriceExtrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceExtrasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceExtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

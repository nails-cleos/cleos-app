import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearComponent } from './year.component';

describe('YearComponent', () => {
  let component: YearComponent;
  let fixture: ComponentFixture<YearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(YearComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('year', 2025);
    fixture.componentRef.setInput('start', 1);
    fixture.componentRef.setInput('measure', 'long');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the input values', () => {
    expect(component.year()).toBe(2025);
    expect(component.start()).toBe(1);
    expect(component.measure()).toBe('long');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterComponent } from './quarter.component';
import { TranslateModule } from '@ngx-translate/core';

describe('QuarterComponent', () => {
  let component: QuarterComponent;
  let fixture: ComponentFixture<QuarterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuarterComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(QuarterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

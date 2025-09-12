import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TreatmentTableComponent } from './treatment-table.component';
import { TranslateModule } from '@ngx-translate/core';

describe('TableComponent', () => {
  let component: TreatmentTableComponent;
  let fixture: ComponentFixture<TreatmentTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TreatmentTableComponent, TranslateModule.forRoot()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});

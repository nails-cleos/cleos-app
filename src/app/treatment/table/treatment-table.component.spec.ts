import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { TreatmentTableComponent } from './treatment-table.component';

describe('TableComponent', () => {
  let component: TreatmentTableComponent;
  let fixture: ComponentFixture<TreatmentTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        NoopAnimationsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        TreatmentTableComponent,
    ]
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeZoneSnackBarComponent } from './time-zone-snack-bar.component';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

describe('TimeZoneSnackBarComponent', () => {
  let component: TimeZoneSnackBarComponent;
  let fixture: ComponentFixture<TimeZoneSnackBarComponent>;
  let matSnackBarRefSpy: jasmine.SpyObj<MatSnackBarRef<TimeZoneSnackBarComponent>>;

  beforeEach(async () => {
    matSnackBarRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [TimeZoneSnackBarComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatSnackBarRef, useValue: matSnackBarRefSpy },
        { provide: MAT_SNACK_BAR_DATA, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeZoneSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

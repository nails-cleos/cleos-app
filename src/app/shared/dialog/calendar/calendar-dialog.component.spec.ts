import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarDialogComponent } from './calendar-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { provideTranslateService } from '@ngx-translate/core';

describe('CalendarDialogComponent', () => {
  let component: CalendarDialogComponent;
  let fixture: ComponentFixture<CalendarDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CalendarDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [CalendarDialogComponent],
      providers: [
        provideTranslateService(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

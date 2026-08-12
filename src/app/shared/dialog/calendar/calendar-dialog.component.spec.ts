import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarDialogComponent } from './calendar-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { provideTranslateService } from '@ngx-translate/core';

describe('CalendarDialogComponent', () => {
  let component: CalendarDialogComponent;
  let fixture: ComponentFixture<CalendarDialogComponent>;
  let dialogRefSpy: Pick<MatDialogRef<CalendarDialogComponent>, 'close'> & {
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    dialogRefSpy = {
      close: vi.fn().mockName('MatDialogRef.close'),
    };
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

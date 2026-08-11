import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptComponent } from './prompt.component';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

describe('PromptComponentComponent', () => {
  let component: PromptComponent;
  let fixture: ComponentFixture<PromptComponent>;

  let matBottomSheetRefSpy: Pick<
    MatBottomSheetRef<PromptComponent>,
    'dismiss'
  > & {
    dismiss: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    matBottomSheetRefSpy = {
      dismiss: vi.fn().mockName('MatBottomSheetRef.dismiss'),
    };
    await TestBed.configureTestingModule({
      imports: [PromptComponent],
      providers: [
        { provide: MatBottomSheetRef, useValue: matBottomSheetRefSpy },
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: { data: { mobileType: 'iOS' } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BottomSheetShareComponent,
  BottomSheetShareData,
} from './bottom-sheet-share.component';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideAppIcons } from '@app/util/app-icons.provider';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { beforeEach, describe, expect, it } from 'vitest';

describe('BottomSheetShareComponent', () => {
  let component: BottomSheetShareComponent;
  let fixture: ComponentFixture<BottomSheetShareComponent>;

  const mockData: BottomSheetShareData = { code: 'ABC123' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomSheetShareComponent],
      providers: [
        provideTranslateService(),
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: mockData },
        provideHttpClient(withXhr()),
        provideAppIcons(),
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use(DEFAULT_LOCALE);
    translateService.setTranslation(DEFAULT_LOCALE, {
      ME: {
        REFERRAL: {
          LINK: 'Use my referral link: {{url}} (code: {{code}})',
        },
      },
    });

    fixture = TestBed.createComponent(BottomSheetShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize url, image, code, and message', () => {
    const expectedUrl = environment.appServer;
    expect(component['url']).toBe(expectedUrl);
    expect(component.image).toBe(
      `${expectedUrl}/assets/icons/icon-512x512.png`,
    );
    expect(component.code).toBe(`${expectedUrl}/auth?code=${mockData.code}`);

    expect(component.message).toContain(
      `Use my referral link: http://localhost:4300/auth?code=ABC123 (code: ${mockData.code})`,
    );
  });
});

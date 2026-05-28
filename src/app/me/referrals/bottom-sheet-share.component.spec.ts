import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomSheetShareComponent, BottomSheetShareData } from './bottom-sheet-share.component';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { provideAppIcons } from '../../util/app-icons.provider';

describe('BottomSheetShareComponent', () => {
  let component: BottomSheetShareComponent;
  let fixture: ComponentFixture<BottomSheetShareComponent>;

  const mockData: BottomSheetShareData = { code: 'ABC123' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomSheetShareComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: mockData },
        provideHttpClient(),
        provideAppIcons(),
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');
    translateService.setTranslation('en-GB', {
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
    expect(component.image).toBe(`${expectedUrl}/assets/icons/icon-512x512.png`);
    expect(component.code).toBe(`${expectedUrl}/auth?code=${mockData.code}`);

    expect(component.message)
      .toContain(`Use my referral link: http://localhost:4300/auth?code=ABC123 (code: ${mockData.code})`);
  });
});

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { BottomSheetBookAppointmentComponent } from './bottom-sheet-book-appointment';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideAppIcons } from '@app/util/app-icons.provider';
import { DEFAULT_LOCALE } from '@app/util/dates';

describe('BottomSheetBookAppointmentComponent', () => {
  let component: BottomSheetBookAppointmentComponent;
  let fixture: ComponentFixture<BottomSheetBookAppointmentComponent>;

  let bottomSheetRefSpy: Pick<
    MatBottomSheetRef<BottomSheetBookAppointmentComponent>,
    'dismiss'
  > & {
    dismiss: ReturnType<typeof vi.fn>;
  };
  let windowOpenSpy: Mock;

  beforeEach(async () => {
    bottomSheetRefSpy = {
      dismiss: vi.fn().mockName('MatBottomSheetRef.dismiss'),
    };
    windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue(undefined as any);

    await TestBed.configureTestingModule({
      imports: [BottomSheetBookAppointmentComponent],
      providers: [
        provideTranslateService(),
        { provide: MatBottomSheetRef, useValue: bottomSheetRefSpy },
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
      MAIN: {
        CONTACT: {
          SEND: {
            PHONE: '31612345678',
            HELLO: 'Hello!',
          },
          MAIL: 'test@example.com',
        },
      },
    });

    fixture = TestBed.createComponent(BottomSheetBookAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss bottom sheet and open WhatsApp link', () => {
    triggerClick('whatsapp');

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://api.whatsapp.com/send?phone=31612345678&text=Hello!',
      '_blank',
    );
  });

  it('should open phone link', () => {
    triggerClick('phone');

    expect(windowOpenSpy).toHaveBeenCalledWith('tel:31612345678', '_blank');
  });

  it('should open Instagram link', () => {
    triggerClick('instagram');

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://ig.me/m/carlanailscleos.nl',
      '_blank',
    );
  });

  it('should open Facebook link', () => {
    triggerClick('facebook');

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://m.me/carlanailscleos.nl?text=Hello!',
      '_blank',
    );
  });

  it('should open email link', () => {
    triggerClick('email');

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'mailto:test@example.com',
      '_blank',
    );
  });

  const triggerClick = (key: any) => {
    const event = new MouseEvent('click');
    vi.spyOn(event, 'preventDefault').mockReturnValue(undefined);

    component.openLink(event, key);

    expect(bottomSheetRefSpy.dismiss).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    fixture.detectChanges();
  };
});

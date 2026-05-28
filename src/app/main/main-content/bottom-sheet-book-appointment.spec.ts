import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BottomSheetBookAppointmentComponent } from './bottom-sheet-book-appointment';
import { provideHttpClient } from '@angular/common/http';
import { provideAppIcons } from '../../util/app-icons.provider';

describe('BottomSheetBookAppointmentComponent', () => {
  let component: BottomSheetBookAppointmentComponent;
  let fixture: ComponentFixture<BottomSheetBookAppointmentComponent>;

  let bottomSheetRefSpy: jasmine.SpyObj<MatBottomSheetRef<BottomSheetBookAppointmentComponent>>;
  let windowOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    bottomSheetRefSpy = jasmine.createSpyObj('MatBottomSheetRef', ['dismiss']);
    windowOpenSpy = spyOn(window, 'open');

    await TestBed.configureTestingModule({
      imports: [BottomSheetBookAppointmentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatBottomSheetRef, useValue: bottomSheetRefSpy },
        provideHttpClient(),
        provideAppIcons(),
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');
    translateService.setTranslation('en-GB', {
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

    expect(windowOpenSpy).toHaveBeenCalledWith('https://ig.me/m/carlanailscleos.nl', '_blank');
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

    expect(windowOpenSpy).toHaveBeenCalledWith('mailto:test@example.com', '_blank');
  });

  const triggerClick = (key: any) => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, key);

    expect(bottomSheetRefSpy.dismiss).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    fixture.detectChanges();
  };
});

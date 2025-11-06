import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BottomSheetBookAppointmentComponent } from './bottom-sheet-book-appointment';

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
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en-GB');
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss bottom sheet and open WhatsApp link', fakeAsync(() => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'whatsapp');
    expect(bottomSheetRefSpy.dismiss).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    tick(500);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://api.whatsapp.com/send?phone=31612345678&text=Hello!',
      '_blank',
    );
  }));

  it('should open phone link', fakeAsync(() => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'phone');
    tick(500);

    expect(windowOpenSpy).toHaveBeenCalledWith('tel:31612345678', '_blank');
  }));

  it('should open Instagram link', fakeAsync(() => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'instagram');
    tick(500);

    expect(windowOpenSpy).toHaveBeenCalledWith('https://ig.me/m/carlanailscleos.nl', '_blank');
  }));

  it('should open Facebook link', fakeAsync(() => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'facebook');
    tick(500);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://m.me/carlanailscleos.nl?text=Hello!',
      '_blank',
    );
  }));

  it('should open email link', fakeAsync(() => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'email');
    tick(500);

    expect(windowOpenSpy).toHaveBeenCalledWith('mailto:test@example.com', '_blank');
  }));

  it('should dismiss bottom sheet when opening phone link', fakeAsync(() => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'phone');

    expect(bottomSheetRefSpy.dismiss).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    tick(500);
  }));

  it('should dismiss bottom sheet when opening Instagram link', fakeAsync(() => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'instagram');

    expect(bottomSheetRefSpy.dismiss).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    tick(500);
  }));

  it('should call window.open with correct URL format for Facebook', fakeAsync(() => {
    const event = new MouseEvent('click');
    component.openLink(event, 'facebook');
    tick(500);

    const expectedUrl = 'https://m.me/carlanailscleos.nl?text=Hello!';
    expect(windowOpenSpy).toHaveBeenCalledWith(expectedUrl, '_blank');
  }));

  it('should handle multiple translate.instant calls for WhatsApp', fakeAsync(() => {
    const event = new MouseEvent('click');
    component.openLink(event, 'whatsapp');
    tick(500);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://api.whatsapp.com/send?phone=31612345678&text=Hello!',
      '_blank',
    );
  }));
});

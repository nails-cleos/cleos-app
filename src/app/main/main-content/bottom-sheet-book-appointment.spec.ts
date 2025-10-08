import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BottomSheetBookAppointmentComponent } from './bottom-sheet-book-appointment';

describe('BottomSheetBookAppointmentComponent', () => {
  let component: BottomSheetBookAppointmentComponent;
  let fixture: ComponentFixture<BottomSheetBookAppointmentComponent>;

  let mockBottomSheetRef: jasmine.SpyObj<MatBottomSheetRef<BottomSheetBookAppointmentComponent>>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let windowOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    mockBottomSheetRef = jasmine.createSpyObj('MatBottomSheetRef', ['dismiss']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    windowOpenSpy = spyOn(window, 'open');

    await TestBed.configureTestingModule({
      imports: [BottomSheetBookAppointmentComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatBottomSheetRef, useValue: mockBottomSheetRef },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomSheetBookAppointmentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss bottom sheet and open WhatsApp link', fakeAsync(() => {
    mockTranslateService.instant.withArgs('MAIN.CONTACT.SEND.PHONE').and.returnValue('31612345678');
    mockTranslateService.instant.withArgs('MAIN.CONTACT.SEND.HELLO').and.returnValue('Hello!');

    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'whatsapp');
    expect(mockBottomSheetRef.dismiss).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    tick(500);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://api.whatsapp.com/send?phone=31612345678&text=Hello!',
      '_blank',
    );
  }));

  it('should open phone link', fakeAsync(() => {
    mockTranslateService.instant.withArgs('MAIN.CONTACT.SEND.PHONE').and.returnValue('31612345678');

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
    mockTranslateService.instant.withArgs('MAIN.CONTACT.SEND.HELLO').and.returnValue('Hello Facebook');

    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'facebook');
    tick(500);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://m.me/carlanailscleos.nl?text=Hello Facebook',
      '_blank',
    );
  }));

  it('should open email link', fakeAsync(() => {
    mockTranslateService.instant.withArgs('MAIN.CONTACT.MAIL').and.returnValue('test@example.com');

    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'email');
    tick(500);

    expect(windowOpenSpy).toHaveBeenCalledWith('mailto:test@example.com', '_blank');
  }));

  it('should dismiss bottom sheet when opening phone link', fakeAsync(() => {
    mockTranslateService.instant.withArgs('MAIN.CONTACT.SEND.PHONE').and.returnValue('31612345678');

    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'phone');

    expect(mockBottomSheetRef.dismiss).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    tick(500);
  }));

  it('should dismiss bottom sheet when opening Instagram link', fakeAsync(() => {
    const event = new MouseEvent('click');
    spyOn(event, 'preventDefault');

    component.openLink(event, 'instagram');

    expect(mockBottomSheetRef.dismiss).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    tick(500);
  }));

  it('should call window.open with correct URL format for Facebook', fakeAsync(() => {
    mockTranslateService.instant.withArgs('MAIN.CONTACT.SEND.HELLO').and.returnValue('Hi there');

    const event = new MouseEvent('click');
    component.openLink(event, 'facebook');
    tick(500);

    const expectedUrl = 'https://m.me/carlanailscleos.nl?text=Hi there';
    expect(windowOpenSpy).toHaveBeenCalledWith(expectedUrl, '_blank');
  }));

  it('should handle multiple translate.instant calls for WhatsApp', fakeAsync(() => {
    mockTranslateService.instant.withArgs('MAIN.CONTACT.SEND.PHONE').and.returnValue('31687654321');
    mockTranslateService.instant.withArgs('MAIN.CONTACT.SEND.HELLO').and.returnValue('Greetings');

    const event = new MouseEvent('click');
    component.openLink(event, 'whatsapp');
    tick(500);

    expect(mockTranslateService.instant).toHaveBeenCalledWith('MAIN.CONTACT.SEND.PHONE');
    expect(mockTranslateService.instant).toHaveBeenCalledWith('MAIN.CONTACT.SEND.HELLO');
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://api.whatsapp.com/send?phone=31687654321&text=Greetings',
      '_blank',
    );
  }));
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { matIconRegistryStub } from '@app/util/app-material-registry-stub';
import { ColorPickerComponent } from './color-picker.component';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ColorPickerComponent', () => {
  let component: ColorPickerComponent;
  let fixture: ComponentFixture<ColorPickerComponent>;
  let control: FormControl<string>;

  beforeEach(async () => {
    control = new FormControl('#123456', { nonNullable: true });

    await TestBed.configureTestingModule({
      imports: [ColorPickerComponent],
      providers: [{ provide: MatIconRegistry, useValue: matIconRegistryStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorPickerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Dark color');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('invalidText', 'Invalid color');
    fixture.componentRef.setInput('previewMode', 'dark');
    fixture.componentRef.setInput('previewTitle', 'Dark reservation');
    fixture.componentRef.setInput('previewText', 'Reservation');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the bound control from the native color input', () => {
    const nativeInput = fixture.debugElement.query(
      By.css('input[type="color"]'),
    ).nativeElement as HTMLInputElement;

    nativeInput.value = '#abcdef';
    nativeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(control.value).toBe('#abcdef');
    expect(control.dirty).toBe(true);
    expect(control.touched).toBe(true);
  });

  it('should normalize typed short hex values on blur', () => {
    const textInput = fixture.debugElement.query(By.css('input[type="text"]'))
      .nativeElement as HTMLInputElement;

    control.setValue('#0f0');
    textInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(control.value).toBe('#00ff00');
  });

  it('should render the reservation preview card using the selected color', () => {
    const previewCard = fixture.debugElement.query(
      By.css('.color-preview-card'),
    );
    const reservationPreview = fixture.debugElement.query(
      By.css('.reservation-example'),
    ).nativeElement as HTMLElement;
    const subtitle = fixture.debugElement.query(By.css('mat-card-subtitle'))
      .nativeElement as HTMLElement;

    expect(previewCard).toBeTruthy();
    expect(subtitle.textContent).toContain('Dark reservation');
    expect(reservationPreview.textContent).toContain('Reservation');
    expect(reservationPreview.style.backgroundColor).toBe('rgb(18, 52, 86)');
    expect(reservationPreview.style.color).toBe('rgb(0, 0, 0)');
  });

  it('should normalize uppercase and short hex colors for the preview', () => {
    control.setValue('#ABCDEF');
    fixture.detectChanges();

    expect(component.previewColor()).toBe('#abcdef');

    control.setValue('#0f0');
    fixture.detectChanges();

    expect(component.previewColor()).toBe('#00ff00');
  });

  it('should fall back to black when the control value is empty or invalid', () => {
    control.setValue('');
    fixture.detectChanges();

    expect(component.previewColor()).toBe('#000000');

    control.setValue('not-a-color');
    fixture.detectChanges();

    expect(component.previewColor()).toBe('#000000');

    const textInput = fixture.debugElement.query(By.css('input[type="text"]'))
      .nativeElement as HTMLInputElement;
    textInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(control.value).toBe('not-a-color');
  });

  it('should compute light preview styles when configured for light mode', () => {
    control.setValue('#0f0');
    fixture.componentRef.setInput('previewMode', 'light');
    fixture.componentRef.setInput('previewTitle', 'Light reservation');
    fixture.detectChanges();

    const reservationPreview = fixture.debugElement.query(
      By.css('.reservation-example'),
    ).nativeElement as HTMLElement;
    const subtitle = fixture.debugElement.query(By.css('mat-card-subtitle'))
      .nativeElement as HTMLElement;

    expect(component.previewCardBackground()).toBe('#fafafa');
    expect(component.previewTitleColor()).toBe('#363636');
    expect(component.previewTextColor()).toBe('#fff');
    expect(component.previewBorderColor()).toBe('#00eb00');
    expect(subtitle.textContent).toContain('Light reservation');
    expect(reservationPreview.style.color).toBe('rgb(255, 255, 255)');
  });
});

import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { lightenDarkenColor } from '../../util/color';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card';

type PreviewMode = 'dark' | 'light';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  imports: [MatFormField, MatLabel, MatInput, MatIconButton, ReactiveFormsModule, MatError, MatCard, MatCardHeader,
    MatCardSubtitle, MatCardContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerComponent {
  label = input.required<string>();
  control = input.required<FormControl<string>>();
  invalidText = input<string>();
  dataCy = input<string>();
  triggerId = input<string>();
  previewMode = input.required<PreviewMode>();
  previewTitle = input.required<string>();
  previewText = input.required<string>();

  controlValue = signal<string>('');
  previewColor = computed(() => this.normalizeColor(this.controlValue()));
  previewCardBackground = computed(() => this.previewMode() === 'dark' ? '#363636' : '#fafafa');
  previewTitleColor = computed(() => this.previewMode() === 'dark' ? '#fafafa' : '#363636');
  previewTextColor = computed(() => this.previewMode() === 'dark' ? '#000' : '#fff');
  previewBorderColor = computed(() => this.previewMode() === 'dark' ?
    lightenDarkenColor(this.previewColor(), 20) :
    lightenDarkenColor(this.previewColor(), -20));

  constructor() {
    effect((onCleanup) => {
      const control = this.control();
      this.controlValue.set(control.value);

      const subscription = control.valueChanges.subscribe(value => this.controlValue.set(value));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  updateFromPicker(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const control = this.control();
    control.markAsTouched();
    control.markAsDirty();
    control.setValue(value);
  }

  normalizeTypedValue(): void {
    const control = this.control();
    const value = control.value;
    const normalizedValue = this.normalizeEditableValue(value);

    if (normalizedValue && normalizedValue !== value) {
      control.setValue(normalizedValue);
    }
  }

  private normalizeColor(value?: string | null): string {
    if (!value) {
      return '#000000';
    }

    if (/^#[0-9a-f]{6}$/i.test(value)) {
      return value.toLowerCase();
    }

    const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(value);
    if (shortHexMatch) {
      const [r, g, b] = shortHexMatch[1].split('');
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }

    return '#000000';
  }

  private normalizeEditableValue(value?: string | null): string | null {
    if (!value) {
      return null;
    }

    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
      return this.normalizeColor(value);
    }

    return null;
  }
}

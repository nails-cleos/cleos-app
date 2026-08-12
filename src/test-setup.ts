/* eslint-disable @angular-eslint/component-selector */
import { vi } from 'vitest';

vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(),
  onMessage: vi.fn(),
  getToken: vi.fn(),
}));

vi.mock('ngx-material-intl-tel-input', async () => {
  const { Component, Input } = await import('@angular/core');

  @Component({
    selector: 'ngx-material-intl-tel-input',
    standalone: true,
    template: '',
  })
  class MockNgxMaterialIntlTelInputComponent {
    @Input() fieldControl: unknown;
    @Input() fieldControlName: unknown;
    @Input() required: unknown;
    @Input() disabled: unknown;
    @Input() appearance: unknown;
    @Input() enablePlaceholder: unknown;
    @Input() autoIpLookup: unknown;
    @Input() autoSelectCountry: unknown;
    @Input() autoSelectedCountry: unknown;
    @Input() numberValidation: unknown;
    @Input() iconMakeCall: unknown;
    @Input() initialValue: unknown;
    @Input() enableSearch: unknown;
    @Input() includeDialCode: unknown;
    @Input() emojiFlags: unknown;
    @Input() hidePhoneIcon: unknown;
    @Input() localizeCountryNames: unknown;
    @Input() preferredCountries: unknown;
    @Input() visibleCountries: unknown;
    @Input() excludedCountries: unknown;
    @Input() textLabels: unknown;
    @Input() mainLabel: unknown;
    @Input() useMask: unknown;
    @Input() forceSelectedCountryCode: unknown;
    @Input() showMaskPlaceholder: unknown;
    @Input() outputNumberFormat: unknown;
    @Input() enableInputMaxLength: unknown;
    @Input() currentValue: unknown;
    @Input() currentCountryCode: unknown;
    @Input() currentCountryISO: unknown;
    @Input() isFocused: unknown;
    @Input() isLoading: unknown;
    @Input() resolvedMainLabel: unknown;
    @Input() isOutlineWithLabel: unknown;
  }

  return {
    NgxMaterialIntlTelInputComponent: MockNgxMaterialIntlTelInputComponent,
  };
});

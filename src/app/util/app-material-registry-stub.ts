/* eslint-disable @typescript-eslint/no-unused-vars */
import { MatIconRegistry } from '@angular/material/icon';
import { SafeResourceUrl } from '@angular/platform-browser';
import { of } from 'rxjs';

export const matIconRegistryStub: Partial<MatIconRegistry> = {
  getNamedSvgIcon: () =>
    of(document.createElementNS('http://www.w3.org/2000/svg', 'svg')),

  getDefaultFontSetClass: () => ['material-icons'],

  addSvgIcon: (_iconName: string, _url: SafeResourceUrl) =>
    matIconRegistryStub as MatIconRegistry,

  addSvgIconInNamespace: (
    _namespace: string,
    _iconName: string,
    _url: SafeResourceUrl,
  ) => matIconRegistryStub as MatIconRegistry,

  addSvgIconSet: (_url: SafeResourceUrl) =>
    matIconRegistryStub as MatIconRegistry,

  addSvgIconSetInNamespace: (_namespace: string, _url: SafeResourceUrl) =>
    matIconRegistryStub as MatIconRegistry,
};

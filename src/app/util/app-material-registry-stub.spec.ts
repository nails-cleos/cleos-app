import { firstValueFrom } from 'rxjs';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

import { matIconRegistryStub } from './app-material-registry-stub';

describe('matIconRegistryStub', () => {
  it('should provide a default font set class', () => {
    expect(matIconRegistryStub.getDefaultFontSetClass?.()).toEqual(['material-icons']);
  });

  it('should return an svg element from getNamedSvgIcon', async () => {
    const getNamedSvgIcon = matIconRegistryStub.getNamedSvgIcon as
      NonNullable<typeof matIconRegistryStub.getNamedSvgIcon>;
    const svg = await firstValueFrom(getNamedSvgIcon('edit'));
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('should be chainable for icon registration methods', () => {
    const fakeUrl = 'https://example.com/icon.svg' as unknown as SafeResourceUrl;
    const expectedRegistry = matIconRegistryStub as MatIconRegistry;

    expect(matIconRegistryStub.addSvgIcon?.('test', fakeUrl)).toBe(expectedRegistry);
    expect(matIconRegistryStub.addSvgIconInNamespace?.('ns', 'test', fakeUrl)).toBe(expectedRegistry);
    expect(matIconRegistryStub.addSvgIconSet?.(fakeUrl)).toBe(expectedRegistry);
    expect(matIconRegistryStub.addSvgIconSetInNamespace?.('ns', fakeUrl)).toBe(expectedRegistry);
  });
});

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { I18NStore } from './i18n.store';

describe('I18NStore', () => {
  let store: InstanceType<typeof I18NStore>;
  let translateSpy: {
    getCurrentLang: Mock;
    use: Mock;
  };

  const STORAGE_KEY = 'I18N';

  beforeEach(() => {
    localStorage.clear();

    translateSpy = {
      getCurrentLang: vi.fn().mockName('TranslateService.getCurrentLang'),
      use: vi.fn().mockName('TranslateService.use'),
    };

    translateSpy.getCurrentLang.mockReturnValue('en');

    TestBed.configureTestingModule({
      providers: [
        I18NStore,
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(I18NStore);
  });

  it('should hydrate from localStorage when value exists', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language: 'fr' }));

    store.hydrate();

    expect(store.language()).toBe('fr');
  });

  it('should fallback to TranslateService language when no storage exists', () => {
    translateSpy.getCurrentLang.mockReturnValue('de');

    store.hydrate();

    expect(store.language()).toBe('de');
  });

  it('should set language and persist it', () => {
    store.setLanguage('es');

    expect(store.language()).toBe('es');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual({ language: 'es' });
  });

  it('should clean state and remove storage', () => {
    store.setLanguage('it');

    store.clean();

    expect(store.language()).toBe('');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should clear response only', () => {
    store.setLanguage('en');

    store.clearResponse();

    expect(store.response()).toBeUndefined();
    expect(store.language()).toBe('en');
  });

  it('should clear error only', () => {
    store.setLanguage('en');

    store.clearError();

    expect(store.error()).toBeUndefined();
    expect(store.language()).toBe('en');
  });

  it('should ignore invalid JSON in localStorage and reset storage', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid json');

    store.hydrate();

    expect(store.language()).toBe('en'); // fallback
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should NOT call TranslateService.use if language equals current', () => {
    translateSpy.getCurrentLang.mockReturnValue('es');

    store.setLanguage('es');

    expect(translateSpy.use).not.toHaveBeenCalled();
  });

  it('should NOT call TranslateService.use when language is empty', () => {
    store.clean(); // language = ''

    expect(translateSpy.use).not.toHaveBeenCalled();
  });
});

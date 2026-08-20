import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemComponent } from './menu-item.component';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { DEFAULT_LOCALE } from '@app/util/dates';
import { NavigationService } from '@app/services/navigation.service';
import { provideTranslateService } from '@ngx-translate/core';

describe('MenuItemComponent', () => {
  let component: MenuItemComponent;
  let fixture: ComponentFixture<MenuItemComponent>;
  let navigationServiceSpy: Pick<NavigationService, 'navigate' | 'language'> & {
    navigate: ReturnType<typeof vi.fn>;
  };

  let breakpoint$: Subject<BreakpointState>;

  let breakpointObserverSpy: Pick<BreakpointObserver, 'observe'> & {
    observe: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    navigationServiceSpy = {
      navigate: vi.fn().mockName('NavigationService.navigate'),
      language: DEFAULT_LOCALE,
    };
    breakpoint$ = new Subject<BreakpointState>();

    breakpointObserverSpy = {
      observe: vi.fn().mockName('BreakpointObserver.observe'),
    };
    breakpointObserverSpy.observe.mockReturnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [MenuItemComponent],
      providers: [
        provideTranslateService(),
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(MenuItemComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('items', []);

    fixture.detectChanges();
  });

  afterEach(() => breakpoint$.complete());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set language from TranslateService', () => {
    expect(component.language).toBe(DEFAULT_LOCALE);
  });

  it('should call router.navigate and drawer.toggle when navigate is called', () => {
    const menu = { path: 'dashboard/home' } as any;
    const drawer = {
      toggle: vi.fn().mockName('toggle'),
    } as unknown as MatDrawer;

    component.navigate(menu, drawer);

    expect(drawer.toggle).toHaveBeenCalled();
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'dashboard',
      'home',
    ]);
  });

  it('should call router.navigate without drawer when drawer is not provided', () => {
    const menu = { path: 'settings/account' } as any;
    component.navigate(menu);
    expect(navigationServiceSpy.navigate).toHaveBeenCalledWith([
      'settings',
      'account',
    ]);
  });

  describe('toggleSubMenu', () => {
    it('should toggle submenu open and close others', () => {
      component.openSubMenus = { 0: true, 1: true, 2: false };

      component.toggleSubMenu(1);

      // Only index 1 toggled, others closed
      expect(component.openSubMenus[0]).toBe(false);
      expect(component.openSubMenus[1]).toBe(false); // toggled from true → false
      expect(component.openSubMenus[2]).toBe(false);
    });

    it('should open submenu if it was closed', () => {
      component.openSubMenus = { 0: true, 1: false };
      component.toggleSubMenu(1);
      expect(component.openSubMenus[1]).toBe(true);
    });
  });

  describe('isSubMenuOpen', () => {
    it('should return true if submenu is open', () => {
      component.openSubMenus = { 1: true };
      expect(component.isSubMenuOpen(1)).toBe(true);
    });

    it('should return false if submenu is not open', () => {
      component.openSubMenus = { 1: false };
      expect(component.isSubMenuOpen(1)).toBe(false);
    });

    it('should return false if submenu does not exist', () => {
      component.openSubMenus = {};
      expect(component.isSubMenuOpen(0)).toBe(false);
    });
  });

  describe('toggleSubSubMenu', () => {
    it('should toggle a sub-submenu and close others within same parent', () => {
      component.openSubSubMenus = {
        0: { 0: true, 1: true, 2: false },
      };

      component.toggleSubSubMenu(0, 1);

      // Only index 1 toggled, others closed
      expect(component.openSubSubMenus[0][0]).toBe(false);
      expect(component.openSubSubMenus[0][1]).toBe(false); // toggled from true → false
      expect(component.openSubSubMenus[0][2]).toBe(false);
    });

    it('should open sub-submenu if it was closed', () => {
      component.openSubSubMenus = { 0: { 0: false } };
      component.toggleSubSubMenu(0, 0);
      expect(component.openSubSubMenus[0][0]).toBe(true);
    });

    it('should create sub-submenu entry if not exist', () => {
      component.openSubSubMenus = {};
      component.toggleSubSubMenu(1, 0);
      expect(component.openSubSubMenus[1][0]).toBe(true);
    });
  });

  describe('isSubSubMenuOpen', () => {
    it('should return true if sub-submenu is open', () => {
      component.openSubSubMenus = { 0: { 1: true } };
      expect(component.isSubSubMenuOpen(0, 1)).toBe(true);
    });

    it('should return false if sub-submenu is closed or missing', () => {
      component.openSubSubMenus = { 0: { 1: false } };
      expect(component.isSubSubMenuOpen(0, 1)).toBe(false);
      expect(component.isSubSubMenuOpen(1, 0)).toBe(false);
    });
  });

  it('should update isHandset$ when breakpoint changes', () => {
    breakpoint$.next({
      matches: true,
      breakpoints: {
        [Breakpoints.XSmall]: true,
        [Breakpoints.Small]: true,
        [Breakpoints.Medium]: true,
      },
    });
    fixture.detectChanges();
    expect(component.isHandsetSignal()).toBe(true);

    breakpoint$.next({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
        [Breakpoints.Medium]: false,
      },
    });
    fixture.detectChanges();
    expect(component.isHandsetSignal()).toBe(false);
  });
});

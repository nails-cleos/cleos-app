import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemComponent } from './menu-item.component';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { DEFAULT_LOCALE } from '../../util/dates';
import { signal } from "@angular/core";
import { I18NStore } from "../../store/i18n.store";

describe('MenuItemComponent', () => {
  let component: MenuItemComponent;
  let fixture: ComponentFixture<MenuItemComponent>;
  let i18nStoreSpy: {
    language: ReturnType<typeof signal>;
  };

  let breakpoint$: Subject<BreakpointState>;

  let routerSpy: jasmine.SpyObj<Router>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    i18nStoreSpy = {
      language: signal(DEFAULT_LOCALE),
    }
    breakpoint$ = new Subject<BreakpointState>();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.and.returnValue(breakpoint$.asObservable());

    await TestBed.configureTestingModule({
      imports: [MenuItemComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: I18NStore, useValue: i18nStoreSpy },
        { provide: BreakpointObserver, useValue: breakpointObserverSpy },
      ],
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
    expect(component.languageSignal()).toBe(DEFAULT_LOCALE);
  });

  it('should call router.navigate and drawer.toggle when navigate is called', () => {
    const menu = { path: 'dashboard/home' } as any;
    const drawer = { toggle: jasmine.createSpy('toggle') } as unknown as MatDrawer;

    component.navigate(menu, drawer);

    expect(drawer.toggle).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith([DEFAULT_LOCALE, 'dashboard', 'home']);
  });

  it('should call router.navigate without drawer when drawer is not provided', () => {
    const menu = { path: 'settings/account' } as any;
    component.navigate(menu);
    expect(routerSpy.navigate).toHaveBeenCalledWith([DEFAULT_LOCALE, 'settings', 'account']);
  });

  describe('toggleSubMenu', () => {
    it('should toggle submenu open and close others', () => {
      component.openSubMenus = { 0: true, 1: true, 2: false };

      component.toggleSubMenu(1);

      // Only index 1 toggled, others closed
      expect(component.openSubMenus[0]).toBeFalse();
      expect(component.openSubMenus[1]).toBeFalse(); // toggled from true → false
      expect(component.openSubMenus[2]).toBeFalse();
    });

    it('should open submenu if it was closed', () => {
      component.openSubMenus = { 0: true, 1: false };
      component.toggleSubMenu(1);
      expect(component.openSubMenus[1]).toBeTrue();
    });
  });

  describe('isSubMenuOpen', () => {
    it('should return true if submenu is open', () => {
      component.openSubMenus = { 1: true };
      expect(component.isSubMenuOpen(1)).toBeTrue();
    });

    it('should return false if submenu is not open', () => {
      component.openSubMenus = { 1: false };
      expect(component.isSubMenuOpen(1)).toBeFalse();
    });

    it('should return false if submenu does not exist', () => {
      component.openSubMenus = {};
      expect(component.isSubMenuOpen(0)).toBeFalse();
    });
  });

  describe('toggleSubSubMenu', () => {
    it('should toggle a sub-submenu and close others within same parent', () => {
      component.openSubSubMenus = {
        0: { 0: true, 1: true, 2: false },
      };

      component.toggleSubSubMenu(0, 1);

      // Only index 1 toggled, others closed
      expect(component.openSubSubMenus[0][0]).toBeFalse();
      expect(component.openSubSubMenus[0][1]).toBeFalse(); // toggled from true → false
      expect(component.openSubSubMenus[0][2]).toBeFalse();
    });

    it('should open sub-submenu if it was closed', () => {
      component.openSubSubMenus = { 0: { 0: false } };
      component.toggleSubSubMenu(0, 0);
      expect(component.openSubSubMenus[0][0]).toBeTrue();
    });

    it('should create sub-submenu entry if not exist', () => {
      component.openSubSubMenus = {};
      component.toggleSubSubMenu(1, 0);
      expect(component.openSubSubMenus[1][0]).toBeTrue();
    });
  });

  describe('isSubSubMenuOpen', () => {
    it('should return true if sub-submenu is open', () => {
      component.openSubSubMenus = { 0: { 1: true } };
      expect(component.isSubSubMenuOpen(0, 1)).toBeTrue();
    });

    it('should return false if sub-submenu is closed or missing', () => {
      component.openSubSubMenus = { 0: { 1: false } };
      expect(component.isSubSubMenuOpen(0, 1)).toBeFalse();
      expect(component.isSubSubMenuOpen(1, 0)).toBeFalse();
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
    expect(component.isHandsetSignal()).toBeTrue();

    breakpoint$.next({
      matches: false,
      breakpoints: {
        [Breakpoints.XSmall]: false,
        [Breakpoints.Small]: false,
        [Breakpoints.Medium]: false,
      },
    });
    fixture.detectChanges();
    expect(component.isHandsetSignal()).toBeFalse();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FabMenuComponent } from './fab-menu.component';
import { ElementRef } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('FabMenuComponent', () => {
  let component: FabMenuComponent;
  let fixture: ComponentFixture<FabMenuComponent>;

  let mockElementRef: ElementRef;

  beforeEach(async () => {
    mockElementRef = {
      nativeElement: document.createElement('div'),
    } as ElementRef;

    await TestBed.configureTestingModule({
      imports: [FabMenuComponent],
      providers: [
        { provide: ElementRef, useValue: mockElementRef },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FabMenuComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with menuOpen as false', () => {
    expect(component.menuOpen).toBeFalse();
  });

  describe('toggleMenu', () => {
    it('should toggle menuOpen from false to true', () => {
      expect(component.menuOpen).toBeFalse();
      component.toggleMenu();
      expect(component.menuOpen).toBeTrue();
    });

    it('should toggle menuOpen from true to false', () => {
      component.menuOpen = true;
      component.toggleMenu();
      expect(component.menuOpen).toBeFalse();
    });
  });

  describe('handleMenuItemClick', () => {
    it('should emit fabMenuItemSelected and close the menu', () => {
      const emitSpy = spyOn(component.fabMenuItemSelected, 'emit');
      component.menuOpen = true;

      component.handleMenuItemClick({ id: 'item1' });

      expect(component.menuOpen).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith('item1');
    });
  });

  describe('clickOutsideMenu', () => {
    it('should close the menu if click occurs outside', () => {
      component.menuOpen = true;
      const outsideElement = document.createElement('div');
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: outsideElement });

      component.clickOutsideMenu(event);

      expect(component.menuOpen).toBeFalse();
    });

    it('should not close the menu if click occurs inside element', () => {
      component.menuOpen = true;

      const event = new MouseEvent('click', { bubbles: true });

      // Spy on nativeElement.contains
      spyOn(component['elementRef'].nativeElement, 'contains').and.returnValue(true);

      component.clickOutsideMenu(event);

      expect(component.menuOpen).toBeTrue();
    });
  });
});

import { HideMissingDirective } from './hide-missing.directive';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: '<img appHideMissing src="test.jpg" />',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HideMissingDirective],
})
class HostComponent {}

describe('HideMissingDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let directive: HideMissingDirective;
  let imgElement: HTMLImageElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    });

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(By.directive(HideMissingDirective));
    directive = debugEl.injector.get(HideMissingDirective);
    imgElement = debugEl.nativeElement as HTMLImageElement;
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should hide the element on error', () => {
    directive.onError();
    expect(imgElement.style.display).toBe('none');
  });
});

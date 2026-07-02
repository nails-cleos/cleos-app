import { TestBed } from '@angular/core/testing';
import { LoadingOverlayService } from './loading-overlay.service';

describe('LoadingOverlayService', () => {
  let service: LoadingOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingOverlayService],
    });

    service = TestBed.inject(LoadingOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be false by default', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should set loading to true when show() is called', () => {
    service.show();

    expect(service.isLoading()).toBe(true);
  });

  it('should set loading to false when hide() is called', () => {
    service.show();
    service.hide();

    expect(service.isLoading()).toBe(false);
  });

  it('should stay loading until all active requests finish', () => {
    service.show();
    service.show();

    service.hide();

    expect(service.isLoading()).toBe(true);

    service.hide();

    expect(service.isLoading()).toBe(false);
  });

  it('should ignore extra hide() calls after the counter reaches zero', () => {
    service.hide();

    expect(service.isLoading()).toBe(false);
  });
});

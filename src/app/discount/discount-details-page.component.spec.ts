import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountDetailsPageComponent } from './discount-details-page.component';
import { DiscountStore } from '../store/discount.store';
import { IDiscountAll } from './discount';
import { DiscountComponent } from './discount.component';
import { NavigationService } from '../services/navigation.service';
import { DEFAULT_LOCALE } from '../util/dates';

describe('DiscountDetailsPageComponent', () => {
  let component: DiscountDetailsPageComponent;
  let fixture: ComponentFixture<DiscountDetailsPageComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;

  let discountStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
  };

  const id = '123';

  const mockDiscount: Partial<IDiscountAll> = {
    id,
    name: 'Test Discount',
    description: 'Test Description',
  };

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['navigate'],
      { language: DEFAULT_LOCALE },
    );
    discountStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [DiscountDetailsPageComponent],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: DiscountStore, useValue: discountStoreSpy },
      ],
    }).overrideTemplate(DiscountComponent, '')
      .overrideTemplate(DiscountDetailsPageComponent, `
        @if (discount(); as discount) {
          <app-discount [discount]="discount" [config]="config" />
        }
      `)
      .compileComponents();

    fixture = TestBed.createComponent(DiscountDetailsPageComponent);

    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load discount when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(discountStoreSpy.clean).toHaveBeenCalled();
    expect(discountStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should pass selected discount to the shared form', () => {
    discountStoreSpy.selected.set(mockDiscount);
    fixture.detectChanges();

    const discountComponent = fixture.debugElement.children[0].componentInstance as DiscountComponent;

    expect(discountComponent.discount()).toEqual(jasmine.objectContaining({
      id,
      name: 'Test Discount',
      description: 'Test Description',
    }));
  });

  it('should call update when discount is received', () => {
    fixture.detectChanges();

    component.submit(mockDiscount);

    expect(discountStoreSpy.update).toHaveBeenCalledWith(id, jasmine.objectContaining({
      name: 'Test Discount',
      description: 'Test Description',
    }));
  });
});

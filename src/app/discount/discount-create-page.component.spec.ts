import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountCreatePageComponent } from './discount-create-page.component';
import { DiscountStore } from '../store/discount.store';
import { IDiscountAll } from './discount';
import { CurrencyStore } from '../store/currency.store';

describe('DiscountCreatePageComponent', () => {
  let component: DiscountCreatePageComponent;
  let fixture: ComponentFixture<DiscountCreatePageComponent>;

  let discountStoreSpy: {
    clean: jasmine.Spy;
    create: jasmine.Spy;
  };

  let currencyStoreSpy: {
    loadAll: jasmine.Spy;
  };

  const mockDiscount: Partial<IDiscountAll> = {
    name: 'Test Discount',
    description: 'Test Description',
  };

  beforeEach(async () => {
    discountStoreSpy = {
      clean: jasmine.createSpy('clean'),
      create: jasmine.createSpy('create'),
    };
    currencyStoreSpy = {
      loadAll: jasmine.createSpy('loadAll'),
    };

    await TestBed.configureTestingModule({
      imports: [DiscountCreatePageComponent],
      providers: [
        { provide: DiscountStore, useValue: discountStoreSpy },
        { provide: CurrencyStore, useValue: currencyStoreSpy },
      ],
    }).overrideTemplate(DiscountCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DiscountCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when discount is received', () => {
    component.submit(mockDiscount);

    expect(discountStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Test Discount',
      description: 'Test Description',
    }));
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountCreatePageComponent } from './discount-create-page.component';
import { DiscountStore } from '../store/discount.store';
import { IDiscountAll } from '../interfaces/discount';
import { TranslateModule } from '@ngx-translate/core';

describe('DiscountCreatePageComponent', () => {
  let component: DiscountCreatePageComponent;
  let fixture: ComponentFixture<DiscountCreatePageComponent>;

  let discountStoreSpy: {
    clean: jasmine.Spy;
    loadCurrencies: jasmine.Spy;
    create: jasmine.Spy;
  };

  const mockDiscount: Partial<IDiscountAll> = {
    name: 'Test Discount',
    description: 'Test Description',
  };

  beforeEach(async () => {
    discountStoreSpy = {
      clean: jasmine.createSpy('clean'),
      loadCurrencies: jasmine.createSpy('loadCurrencies'),
      create: jasmine.createSpy('create'),
    };

    await TestBed.configureTestingModule({
      imports: [DiscountCreatePageComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DiscountStore, useValue: discountStoreSpy },
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

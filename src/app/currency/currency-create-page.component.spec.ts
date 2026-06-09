import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyCreatePageComponent } from './currency-create-page.component';
import { CurrencyStore } from '../store/currency.store';
import { ICurrencyAll } from './currency';

describe('CurrencyCreatePageComponent', () => {
  let component: CurrencyCreatePageComponent;
  let fixture: ComponentFixture<CurrencyCreatePageComponent>;

  let currencyStoreSpy: {
    create: jasmine.Spy;
  };

  const mockCurrency: Partial<ICurrencyAll> = {
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  beforeEach(async () => {
    currencyStoreSpy = {
      create: jasmine.createSpy('create'),
    };

    await TestBed.configureTestingModule({
      imports: [CurrencyCreatePageComponent],
      providers: [
        { provide: CurrencyStore, useValue: currencyStoreSpy },
      ],
    }).overrideTemplate(CurrencyCreatePageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CurrencyCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when currency is received', () => {
    component.submit(mockCurrency);

    expect(currencyStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Test Currency',
      code: 'EUR',
      icon: 'euro',
    }));
  });
});

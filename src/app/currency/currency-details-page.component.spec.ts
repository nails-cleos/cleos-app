import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyDetailsPageComponent } from './currency-details-page.component';
import { CurrencyStore } from '../store/currency.store';
import { ICurrencyAll } from '../interfaces/currency';

describe('CurrencyDetailsPageComponent', () => {
  let component: CurrencyDetailsPageComponent;
  let fixture: ComponentFixture<CurrencyDetailsPageComponent>;

  let currencyStoreSpy: {
    selected: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
  };

  const id = '123';

  const mockCurrency: Partial<ICurrencyAll> = {
    id,
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  beforeEach(async () => {
    currencyStoreSpy = {
      selected: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [CurrencyDetailsPageComponent],
      providers: [
        { provide: CurrencyStore, useValue: currencyStoreSpy },
      ],
    }).overrideTemplate(CurrencyDetailsPageComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CurrencyDetailsPageComponent);
    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load currency when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(currencyStoreSpy.clean).toHaveBeenCalled();
    expect(currencyStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should call update when currency is received', () => {
    fixture.detectChanges();

    component.submit(mockCurrency);

    expect(currencyStoreSpy.update).toHaveBeenCalledWith(id, jasmine.objectContaining({
      name: 'Test Currency',
      code: 'EUR',
      icon: 'euro',
    }));
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { DiscountStore } from './discount.store';
import { DiscountService } from '../services/discount.service';

describe('DiscountStore', () => {
  let store: InstanceType<typeof DiscountStore>;
  let discountServiceSpy: jasmine.SpyObj<DiscountService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    discountServiceSpy = jasmine.createSpyObj<DiscountService>('DiscountService', [
      'getDiscountsPage',
      'getMyDiscountsPage',
      'getMyReferrals',
      'getDiscount',
      'getUserDiscountByCustomerId',
      'createDiscount',
      'updateDiscount',
      'deleteDiscount',
      'sendDiscounts',
    ]);

    translateSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateSpy.instant.and.callFake(
      (key: string, params?: Record<string, string>) =>
        `${key}:${params?.['name'] ?? ''}`,
    );

    TestBed.configureTestingModule({
      providers: [
        DiscountStore,
        { provide: DiscountService, useValue: discountServiceSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    store = TestBed.inject(DiscountStore);
  });

  it('should load discounts page (admin) and map paginationDiscount', () => {
    const page = { content: [] } as any;
    discountServiceSpy.getDiscountsPage.and.returnValue(of(page));

    store.loadPage({
      page: 0,
      sort: 'name',
      direction: 'asc',
      size: 10,
    });

    expect(discountServiceSpy.getDiscountsPage).toHaveBeenCalledWith(
      0,
      'name',
      'asc',
      10,
    );

    expect(store.data()).toEqual({
      kind: 'paginationDiscount',
      value: page,
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should load my discounts page and map pagination', () => {
    const page = { content: [] } as any;
    discountServiceSpy.getMyDiscountsPage.and.returnValue(of(page));

    store.loadMyPage({
      page: 1,
      sort: 'createdAt',
      direction: 'desc',
      size: 20,
    });

    expect(discountServiceSpy.getMyDiscountsPage).toHaveBeenCalledWith(
      1,
      'createdAt',
      'desc',
      20,
    );

    expect(store.data()).toEqual({
      kind: 'pagination',
      value: page,
    });
  });

  it('should load referrals', () => {
    const referrals = [{ id: 'r1' }] as any;
    discountServiceSpy.getMyReferrals.and.returnValue(of(referrals));

    store.loadReferrals();

    expect(discountServiceSpy.getMyReferrals).toHaveBeenCalled();
    expect(store.referrals()).toEqual(referrals);
    expect(store.isLoading()).toBeFalse();
  });

  it('should load discount by id', () => {
    const discount = { id: 'd1' } as any;
    discountServiceSpy.getDiscount.and.returnValue(of(discount));

    store.loadById('d1');

    expect(discountServiceSpy.getDiscount).toHaveBeenCalledWith('d1');
    expect(store.selected()).toEqual(discount);
    expect(store.isLoading()).toBeFalse();
  });

  it('should load user discounts list', () => {
    const list = [{ id: 'u1' }] as any;
    discountServiceSpy.getUserDiscountByCustomerId.and.returnValue(of(list));

    store.loadUserDiscounts('cust-1');

    expect(discountServiceSpy.getUserDiscountByCustomerId).toHaveBeenCalledWith('cust-1');

    expect(store.data()).toEqual({
      kind: 'list',
      value: list,
    });
  });

  it('should create discount and set response', () => {
    discountServiceSpy.createDiscount.and.returnValue(
      of({ id: '1', name: 'Promo' } as any),
    );

    store.create({ name: 'Promo' } as any);

    expect(discountServiceSpy.createDiscount).toHaveBeenCalledWith(
      jasmine.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'DISCOUNT.CREATED',
      { name: 'Promo' },
    );

    expect(store.response()).toEqual({
      message: 'DISCOUNT.CREATED:Promo',
      path: 'discounts/1',
      redirect: 'discounts',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should update discount and set response', () => {
    discountServiceSpy.updateDiscount.and.returnValue(
      of({ id: '2', name: 'Updated' } as any),
    );

    store.update('2', { name: 'Updated' } as any);

    expect(discountServiceSpy.updateDiscount).toHaveBeenCalledWith(
      '2',
      jasmine.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'DISCOUNT.UPDATED.MESSAGE',
      { name: 'Updated' },
    );

    expect(store.response()).toEqual({
      message: 'DISCOUNT.UPDATED.MESSAGE:Updated',
      path: 'discounts/2',
      redirect: 'discounts',
    });
  });

  it('should delete discount and show warning toast', () => {
    discountServiceSpy.deleteDiscount.and.returnValue(of(void 0));

    store.delete('d1', 'Black Friday');

    expect(discountServiceSpy.deleteDiscount).toHaveBeenCalledWith('d1');

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'DISCOUNT.DELETED.MESSAGE',
      { name: 'Black Friday' },
    );

    expect(store.response()).toEqual({
      message: 'DISCOUNT.DELETED.MESSAGE:Black Friday',
      reload: true,
      toastType: 'warning',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should send discount to customers', () => {
    discountServiceSpy.sendDiscounts.and.returnValue(
      of({ id: '1', name: 'Promo' } as any),
    );

    store.sendToCustomers('d1', ['c1', 'c2']);

    expect(discountServiceSpy.sendDiscounts).toHaveBeenCalledWith(
      'd1',
      ['c1', 'c2'],
    );

    expect(translateSpy.instant).toHaveBeenCalledWith(
      'DISCOUNT.SEND',
      { name: 'Promo' },
    );

    expect(store.response()).toEqual({
      message: 'DISCOUNT.SEND:Promo',
    });

    expect(store.isLoading()).toBeFalse();
  });

  it('should map HTTP errors into error state', () => {
    discountServiceSpy.getDiscount.and.returnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 404,
          error: { message: 'NOT_FOUND' },
        }),
      ),
    );

    store.loadById('missing');

    expect(store.error()).toEqual(
      jasmine.objectContaining({
        status: 'NOT_FOUND',
        message: 'NOT_FOUND',
      }),
    );

    expect(store.isLoading()).toBeFalse();
  });

  it('should reset store on clean()', () => {
    discountServiceSpy.getDiscount.and.returnValue(of({ id: '1' } as any));

    store.loadById('1');
    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
    expect(store.referrals()).toBeUndefined();
  });

  it('should clear response and error', () => {
    discountServiceSpy.getDiscount.and.returnValue(of({ id: '1' } as any));

    store.loadById('1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});

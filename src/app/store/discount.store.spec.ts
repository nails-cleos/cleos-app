import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { DiscountStore } from './discount.store';
import { DiscountService } from '../services/discount.service';

describe('DiscountStore', () => {
  let store: InstanceType<typeof DiscountStore>;
  let discountServiceSpy: {
    getDiscountsPage: Mock;
    getMyDiscountsPage: Mock;
    getMyReferrals: Mock;
    getDiscount: Mock;
    getUserDiscountByCustomerId: Mock;
    createDiscount: Mock;
    updateDiscount: Mock;
    deleteDiscount: Mock;
    sendDiscounts: Mock;
  };

  let translateSpy: {
    instant: Mock;
  };

  beforeEach(() => {
    discountServiceSpy = {
      getDiscountsPage: vi.fn().mockName('DiscountService.getDiscountsPage'),
      getMyDiscountsPage: vi
        .fn()
        .mockName('DiscountService.getMyDiscountsPage'),
      getMyReferrals: vi.fn().mockName('DiscountService.getMyReferrals'),
      getDiscount: vi.fn().mockName('DiscountService.getDiscount'),
      getUserDiscountByCustomerId: vi
        .fn()
        .mockName('DiscountService.getUserDiscountByCustomerId'),
      createDiscount: vi.fn().mockName('DiscountService.createDiscount'),
      updateDiscount: vi.fn().mockName('DiscountService.updateDiscount'),
      deleteDiscount: vi.fn().mockName('DiscountService.deleteDiscount'),
      sendDiscounts: vi.fn().mockName('DiscountService.sendDiscounts'),
    };

    translateSpy = {
      instant: vi.fn().mockName('TranslateService.instant'),
    };
    translateSpy.instant.mockImplementation(
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
    discountServiceSpy.getDiscountsPage.mockReturnValue(of(page));

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

    expect(store.isLoading()).toBe(false);
  });

  it('should load my discounts page and map pagination', () => {
    const page = { content: [] } as any;
    discountServiceSpy.getMyDiscountsPage.mockReturnValue(of(page));

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
    discountServiceSpy.getMyReferrals.mockReturnValue(of(referrals));

    store.loadReferrals();

    expect(discountServiceSpy.getMyReferrals).toHaveBeenCalled();
    expect(store.referrals()).toEqual(referrals);
    expect(store.isLoading()).toBe(false);
  });

  it('should load discount by id', () => {
    const discount = { id: 'd1' } as any;
    discountServiceSpy.getDiscount.mockReturnValue(of(discount));

    store.loadById('d1');

    expect(discountServiceSpy.getDiscount).toHaveBeenCalledWith('d1');
    expect(store.selected()).toEqual(discount);
    expect(store.isLoading()).toBe(false);
  });

  it('should load user discounts list', () => {
    const list = [{ id: 'u1' }] as any;
    discountServiceSpy.getUserDiscountByCustomerId.mockReturnValue(of(list));

    store.loadUserDiscounts('cust-1');

    expect(discountServiceSpy.getUserDiscountByCustomerId).toHaveBeenCalledWith(
      'cust-1',
    );

    expect(store.data()).toEqual({
      kind: 'list',
      value: list,
    });
  });

  it('should create discount and set response', () => {
    discountServiceSpy.createDiscount.mockReturnValue(
      of({ id: '1', name: 'Promo' } as any),
    );

    store.create({ name: 'Promo' } as any);

    expect(discountServiceSpy.createDiscount).toHaveBeenCalledWith(
      expect.any(Object),
    );

    expect(translateSpy.instant).toHaveBeenCalledWith('DISCOUNT.CREATED', {
      name: 'Promo',
    });

    expect(store.response()).toEqual({
      message: 'DISCOUNT.CREATED:Promo',
      path: 'discounts/1',
      redirect: 'discounts',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should update discount and set response', () => {
    discountServiceSpy.updateDiscount.mockReturnValue(
      of({ id: '2', name: 'Updated' } as any),
    );

    store.update('2', { name: 'Updated' } as any);

    expect(discountServiceSpy.updateDiscount).toHaveBeenCalledWith(
      '2',
      expect.any(Object),
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
    discountServiceSpy.deleteDiscount.mockReturnValue(of(void 0));

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

    expect(store.isLoading()).toBe(false);
  });

  it('should send discount to customers', () => {
    discountServiceSpy.sendDiscounts.mockReturnValue(
      of({ id: '1', name: 'Promo' } as any),
    );

    store.sendToCustomers('d1', ['c1', 'c2']);

    expect(discountServiceSpy.sendDiscounts).toHaveBeenCalledWith('d1', [
      'c1',
      'c2',
    ]);

    expect(translateSpy.instant).toHaveBeenCalledWith('DISCOUNT.SEND', {
      name: 'Promo',
    });

    expect(store.response()).toEqual({
      message: 'DISCOUNT.SEND:Promo',
    });

    expect(store.isLoading()).toBe(false);
  });

  it('should map HTTP errors into error state', () => {
    discountServiceSpy.getDiscount.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { message: 'NOT_FOUND' },
          }),
      ),
    );

    store.loadById('missing');

    expect(store.error()).toEqual(
      expect.objectContaining({
        status: 'NOT_FOUND',
        message: 'NOT_FOUND',
      }),
    );

    expect(store.isLoading()).toBe(false);
  });

  it('should reset store on clean()', () => {
    discountServiceSpy.getDiscount.mockReturnValue(of({ id: '1' } as any));

    store.loadById('1');
    store.clean();

    expect(store.data()).toBeUndefined();
    expect(store.selected()).toBeUndefined();
    expect(store.referrals()).toBeUndefined();
  });

  it('should clear response and error', () => {
    discountServiceSpy.getDiscount.mockReturnValue(of({ id: '1' } as any));

    store.loadById('1');

    store.clearResponse();
    expect(store.response()).toBeUndefined();

    store.clearError();
    expect(store.error()).toBeUndefined();
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ReservationService } from './reservation.service';
import {
  ICustomerReservation,
  IReservation,
  IReservationAll,
  IRoomReservation,
  IUpcomingAll,
} from '../interfaces/reservation';
import { Pagination } from '../interfaces/pagination';
import { IReview } from '../interfaces/review';
import { IApiResponse } from '../interfaces/common';
import { ICurrencyAll } from '../interfaces/currency';
import { ServiceType } from '../interfaces/room';
import { dateToTimestamp, getNowTimeZone } from '../util/dates';

describe('ReservationService', () => {
  let service: ReservationService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const currency: ICurrencyAll = {
    id: 'eur',
    name: 'Euro',
    code: 'EUR',
    icon: '€',
  };

  const mockReservationAll: IReservationAll = {
    id: 'res-123',
    state: 'confirmed',
    start: new Date('2024-01-15T10:00:00.000Z'),
    timestamp: Date.now(),
    customer: {
      id: 'customer-123',
      displayName: 'John Doe',
      email: 'john@example.com',
      authorities: [],
      locale: 'en-US',
      timeZone: 'UTC',
    },
    professional: {
      id: 'prof-123',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      authorities: [],
      locale: 'en-US',
      timeZone: 'UTC',
    },
    room: {
      id: 'room-123',
      address: {
        id: 1,
        name: 'Main Location',
        location: { x: 0, y: 0 },
      },
      currency: currency,
      timeZone: 'UTC',
      availabilities: [],
      office: {
        id: 'office-123',
        name: 'Downtown Office',
        manager: {
          id: 'manager-123',
        },
      },
      paymentTypes: [],
      primary: false,
    },
    treatment: {
      id: 'treatment-123',
      key: 'treatment-123',
      name: 'Massage',
      duration: 'PT60M',
      price: 100,
      primary: true,
      type: ServiceType.treatment,
      group: { id: 'group-1', name: 'Wellness' },
    },
    note: 'Test reservation',
  };

  const mockReservation = mockReservationAll as unknown as IReservation;

  const mockPagination: Pagination<IReservationAll> = {
    content: [mockReservationAll],
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  const mockCustomerReservation: ICustomerReservation = {
    reservations: {
      content: [mockReservationAll],
      totalElements: 1,
      totalPages: 1,
      number: 0,
    },
    upcoming: [],
    isFirstTime: false,
  };

  const mockRoomReservation: IRoomReservation = {
    room: {
      id: 'room-123',
      address: {
        id: 1,
        name: 'Main Location',
        location: { x: 0, y: 0 },
      },
      currency: currency,
      timeZone: 'UTC',
      availabilities: [],
      office: {
        id: 'office-123',
        name: 'Downtown Office',
        manager: {
          id: 'manager-123',
        },
      },
      paymentTypes: [],
      primary: false,
    },
    date: '01-01-2025',
    reservations: [mockReservationAll],
    unavailableList: [],
    birthdays: [],
    notes: [],
  };

  const mockReview: IReview = {
    id: 'review-123',
    reservationId: 'res-123',
    rating: 5,
    detail: 'Excellent service',
  };

  const mockApiResponse: IApiResponse = {
    id: 'response-123',
    name: 'Operation successful',
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        ReservationService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(ReservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPage', () => {
    it('should get all reservations when all is true', () => {
      httpSpy.get.and.returnValue(of(mockPagination));

      service.getPage(0, 'start', 'asc', 10, true).subscribe(result => {
        expect(result).toEqual(mockPagination);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/pages', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });

    it('should get reservations by room when roomId provided', () => {
      httpSpy.get.and.returnValue(of(mockPagination));

      service.getPage(0, 'start', 'desc', 20, false, 'room-123').subscribe(result => {
        expect(result).toEqual(mockPagination);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/rooms/room-123/pages', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });

    it('should get reservations by professional when professionalId provided', () => {
      httpSpy.get.and.returnValue(of(mockPagination));

      service.getPage(1, 'customer', 'asc', 15, false, undefined, 'prof-123').subscribe(result => {
        expect(result).toEqual(mockPagination);
      });

      expect(httpSpy.get)
        .toHaveBeenCalledWith('v1/reservations/professionals/prof-123/pages', jasmine.objectContaining({
          params: jasmine.any(Object),
        }));
    });
  });

  describe('getCustomerReservations', () => {
    it('should get customer reservations with all parameters', () => {
      httpSpy.get.and.returnValue(of(mockCustomerReservation));

      service.getCustomerReservations('start', 'desc', 0, 10).subscribe(result => {
        expect(result).toEqual(mockCustomerReservation);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/customer', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });

    it('should get customer reservations without sort and direction', () => {
      httpSpy.get.and.returnValue(of(mockCustomerReservation));

      service.getCustomerReservations('', '', 1, 20).subscribe(result => {
        expect(result).toEqual(mockCustomerReservation);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/customer', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });
  });

  describe('getAllFilterReservations', () => {
    it('should get filtered reservations with all parameters', () => {
      httpSpy.get.and.returnValue(of(mockPagination));

      service.getAllFilterReservations(
        'start',
        'asc',
        0,
        10,
        'user-123',
        ['confirmed', 'pending'],
      ).subscribe(result => {
        expect(result).toEqual(mockPagination);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/filter', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });

    it('should get filtered reservations without optional parameters', () => {
      httpSpy.get.and.returnValue(of(mockPagination));

      service.getAllFilterReservations('start', 'desc', 1, 20).subscribe(result => {
        expect(result).toEqual(mockPagination);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/filter', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });
  });

  describe('getAllGroupingByRoom', () => {
    it('should get room reservations grouping with professional', () => {
      const date = new Date('2024-01-15');
      httpSpy.get.and.returnValue(of([mockRoomReservation]));

      service.getAllGroupingByRoom(7, date, 'room-123', 'prof-123').subscribe(result => {
        expect(result).toEqual([mockRoomReservation]);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/rooms/room-123', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });

    it('should get room reservations grouping without professional', () => {
      const date = new Date('2024-01-15');
      httpSpy.get.and.returnValue(of([mockRoomReservation]));

      service.getAllGroupingByRoom(3, date, 'room-123').subscribe(result => {
        expect(result).toEqual([mockRoomReservation]);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/rooms/room-123', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });
  });

  describe('searchAvailability', () => {
    it('should search availability with professional', () => {
      const dates = [new Date('2024-01-15'), new Date('2024-01-16')];
      httpSpy.get.and.returnValue(of([mockRoomReservation]));

      service.searchAvailability('room-123', 2, dates, 'prof-123').subscribe(result => {
        expect(result).toEqual([mockRoomReservation]);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/rooms/room-123', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });

    it('should search availability without professional', () => {
      const dates = [new Date('2024-01-15')];
      httpSpy.get.and.returnValue(of([mockRoomReservation]));

      service.searchAvailability('room-123', 1, dates).subscribe(result => {
        expect(result).toEqual([mockRoomReservation]);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/rooms/room-123', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });
  });

  describe('customerSearch', () => {
    it('should search for customer with additional services', () => {
      const date = new Date('2024-01-15');
      const availabilities = [{ dateTime: dateToTimestamp(getNowTimeZone()) }];
      httpSpy.get.and.returnValue(of(availabilities));

      service.customerSearch(
        'room-123',
        'treatment-123',
        date,
        'prof-123',
        ['add-1', 'add-2'],
      ).subscribe(result => {
        expect(result).toEqual(availabilities);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/search', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });

    it('should search for customer without additional services', () => {
      const date = new Date('2024-01-15');
      const availabilities = [{ dateTime: dateToTimestamp(getNowTimeZone()) }];
      httpSpy.get.and.returnValue(of(availabilities));

      service.customerSearch('room-123', 'treatment-123', date, 'prof-123').subscribe(result => {
        expect(result).toEqual(availabilities);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/search', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });
  });

  describe('getReservation', () => {
    it('should get reservation by id', () => {
      httpSpy.get.and.returnValue(of(mockReservation));

      service.getReservation('res-123').subscribe(result => {
        expect(result).toEqual(mockReservationAll as IUpcomingAll);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/res-123');
    });

    it('should get reservation with edit path', () => {
      httpSpy.get.and.returnValue(of(mockReservation));

      service.getReservation('res-123', 'edit').subscribe(result => {
        expect(result).toEqual(mockReservationAll as IUpcomingAll);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/res-123/edit');
    });
  });

  describe('getReservationHistory', () => {
    it('should get reservation history', () => {
      const history = [mockReservationAll];
      httpSpy.get.and.returnValue(of(history));

      service.getReservationHistory('res-123').subscribe(result => {
        expect(result).toEqual(history);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/res-123/history');
    });
  });

  describe('createReservation', () => {
    it('should create reservation', () => {
      const reservations: IApiResponse[] = [{
        id: mockReservation.id!,
        timestamp: mockReservation.timestamp,
        timeZone: mockReservation.timeZone,
      }];
      httpSpy.post.and.returnValue(of([mockReservation]));

      service.createReservation(mockReservation).subscribe(result => {
        expect(result).toEqual(reservations);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/reservations', mockReservationAll);
    });
  });

  describe('deleteReservation', () => {
    it('should delete reservation', () => {
      httpSpy.delete.and.returnValue(of(mockReservation));

      service.deleteReservation('res-123').subscribe(result => {
        expect(result).toEqual(mockReservation);
      });

      expect(httpSpy.delete).toHaveBeenCalledWith('v1/reservations/res-123');
    });
  });

  describe('updateReservationById', () => {
    it('should update reservation', () => {
      const reservations: IApiResponse = {
        id: mockReservation.id!,
        timestamp: mockReservation.timestamp,
        timeZone: mockReservation.timeZone,
      };
      httpSpy.patch.and.returnValue(of(mockReservation));

      service.updateReservationById('res-123', mockReservation).subscribe(result => {
        expect(result).toEqual(reservations);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith('v1/reservations/res-123', mockReservation);
    });
  });

  describe('changeState', () => {
    it('should change reservation state with extras', () => {
      const extras = { reason: 'Customer request' };
      httpSpy.post.and.returnValue(of(mockReservation));

      service.changeState('res-123', 'cancel', extras).subscribe(result => {
        expect(result).toEqual(mockReservation);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/reservations/res-123/cancel', extras);
    });

    it('should change reservation state without extras', () => {
      httpSpy.post.and.returnValue(of(undefined));

      service.changeState('res-123', 'confirm').subscribe();

      expect(httpSpy.post).toHaveBeenCalledWith('v1/reservations/res-123/confirm', undefined);
    });
  });

  describe('updateReservationCustomer', () => {
    it('should update reservation customer', () => {
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updateReservationCustomer('res-123', 'customer-456').subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/reservations/res-123/customers/customer-456',
        null,
      );
    });
  });

  describe('updateReservationColor', () => {
    it('should update reservation color', () => {
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updateReservationColor('res-123', 'color-456').subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/reservations/res-123/colors/color-456',
        null,
      );
    });
  });

  describe('getUpcomingReservation', () => {
    it('should get upcoming reservation', () => {
      httpSpy.get.and.returnValue(of(mockCustomerReservation));

      service.getUpcomingReservation().subscribe(result => {
        expect(result).toEqual(mockCustomerReservation);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/upcoming');
    });
  });

  describe('completeReservationPayment', () => {
    it('should complete reservation payment', () => {
      httpSpy.post.and.returnValue(of(undefined));

      service.completeReservationPayment('res-123').subscribe();

      expect(httpSpy.post).toHaveBeenCalledWith(
        'v1/reservations/res-123/payment/complete',
        null,
      );
    });
  });

  describe('createReview', () => {
    it('should create review', () => {
      httpSpy.post.and.returnValue(of(mockApiResponse));

      service.createReview(mockReview).subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.post).toHaveBeenCalledWith(
        'v1/reservations/res-123/reviews',
        mockReview,
      );
    });
  });

  describe('getReview', () => {
    it('should get review', () => {
      httpSpy.get.and.returnValue(of(mockReview));

      service.getReview('res-123').subscribe(result => {
        expect(result).toEqual(mockReview);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/res-123/reviews');
    });
  });

  describe('updateReservationNote', () => {
    it('should update reservation note with both notes', () => {
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updateReservationNote('res-123', 'Staff note', 'Customer note').subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/reservations/res-123/notes',
        { note: 'Staff note', customerNote: 'Customer note' },
      );
    });

    it('should update reservation note with only staff note', () => {
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updateReservationNote('res-123', 'Staff note').subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/reservations/res-123/notes',
        { note: 'Staff note', customerNote: undefined },
      );
    });
  });

  describe('updateReservationDiscount', () => {
    it('should update reservation discount', () => {
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updateReservationDiscount('res-123', 'discount-456').subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/reservations/res-123/discounts/discount-456',
        null,
      );
    });
  });

  describe('updateReservationTimestamp', () => {
    it('should update reservation timestamp', () => {
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updateReservationTimestamp('res-123', '2024-01-15T12:00:00.000Z').subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/reservations/res-123/timestamp',
        '2024-01-15T12:00:00.000Z',
      );
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors gracefully', () => {
      const errorResponse = new Error('Network error');
      httpSpy.get.and.returnValue(throwError(() => errorResponse));

      service.getReservation('res-123').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        },
      });
    });

    it('should handle reservation creation errors', () => {
      const errorResponse = new Error('Creation failed');
      httpSpy.post.and.returnValue(throwError(() => errorResponse));

      service.createReservation(mockReservation).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined reservation response', () => {
      httpSpy.get.and.returnValue(of(undefined));

      service.getReservation('non-existent').subscribe(result => {
        expect(result).toBeUndefined();
      });
    });

    it('should handle empty states array in filter', () => {
      httpSpy.get.and.returnValue(of(mockPagination));

      service.getAllFilterReservations('start', 'asc', 0, 10, 'user-123', []).subscribe();

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/filter', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });

    it('should handle empty additional IDs in customer search', () => {
      const date = new Date('2024-01-15');
      httpSpy.get.and.returnValue(of(mockRoomReservation));

      service.customerSearch('room-123', 'treatment-123', date, 'prof-123', []).subscribe();

      expect(httpSpy.get).toHaveBeenCalledWith('v1/reservations/search', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });
  });
});

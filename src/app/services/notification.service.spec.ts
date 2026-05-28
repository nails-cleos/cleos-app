import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { createFilter } from '../util/service-helper';
import { paginated, Pagination } from '../interfaces/pagination';
import { INotification } from '../interfaces/notification';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockNotification: INotification = {
    id: '1',
    message: 'message',
    navigation: '/en-GB/test',
    date: 1716800000,
    notDate: new Date(),
    read: false,
    deleted: false,
  };

  const mockPagination: Pagination<INotification> = {
    content: [mockNotification],
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch notification pages with pagination params', () => {
    httpSpy.get.and.returnValue(of(mockPagination));

    service.getNotificationsPage(0, 'date', 'desc', 10).subscribe(result => {
      expect(result).toEqual(mockPagination);
    });

    expect(httpSpy.get).toHaveBeenCalledWith('v1/notifications/pages', {
      params: createFilter(0, 10, 'date', 'desc'), ...paginated(),
    });
  });

  it('should post a read notification request', () => {
    httpSpy.post.and.returnValue(of(mockNotification));

    service.readNotification('1').subscribe(result => {
      expect(result).toEqual(mockNotification);
    });

    expect(httpSpy.post).toHaveBeenCalledWith('v1/notifications/1', null);
  });

  it('should delete a notification by id', () => {
    httpSpy.delete.and.returnValue(of(void 0));

    service.deleteNotification('1').subscribe();

    expect(httpSpy.delete).toHaveBeenCalledWith('v1/notifications/1');
  });

  it('should subscribe to notification tokens', () => {
    httpSpy.post.and.returnValue(of(void 0));

    service.subscribeNotification('token-1').subscribe();

    expect(httpSpy.post).toHaveBeenCalledWith('v1/notifications/subscribe', { token: 'token-1' });
  });
});

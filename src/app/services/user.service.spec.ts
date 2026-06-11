import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { UserService } from './user.service';
import { IOverview, IUserAll } from '../user/user';
import { Role, Token } from '../interfaces/token';
import { Pagination, skipLoadingOverlay } from '../interfaces/pagination';
import { IRoomAll } from '../room/room';
import { ICustomerLastReservation } from '../reservation/reservation';
import { IApiResponse } from '../interfaces/common';

describe('UserService', () => {
  let service: UserService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockUser: IUserAll = {
    id: 'user-123',
    displayName: 'John Doe',
    email: 'john@example.com',
    locale: 'en-US',
    authorities: [{ authority: Role.professional }],
    phone: '+1234567890',
    enabled: true,
    verified: true,
    imageUrl: 'http://example.com/image.jpg',
    timeZone: 'Europa/Amsterdam',
  };

  const mockPagination: Pagination<IUserAll> = {
    content: [mockUser],
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  const mockApiResponse: IApiResponse = {
    id: 'response-123',
    name: 'Operation successful',
  };

  const mockToken: Token = {
    tokenAccess: 'mock-token',
    user: mockUser,
    menus: [],
  };

  const mockOverview: IOverview = {
    account: {
      id: 'account-123',
      balance: 0,
      customer: mockUser,
      currency: {
        id: 'eur',
        name: 'Euro',
        code: 'EUR',
        icon: '€',
      },
    },
    miniCardOverview: [
      {
        title: 'Total Reservations',
        primaryValue: 5,
        color: 'primary',
        icon: 'calendar',
      },
    ],
    chartOverview: [
      {
        title: 'Monthly Overview',
        type: 'line' as any,
        labels: ['Jan', 'Feb', 'Mar'],
        dataSet: [10, 20, 30],
      },
    ],
  };

  const mockRoom: IRoomAll = {
    id: 'room-123',
    address: {
      id: 1,
      name: 'Test Address',
      location: { x: 0, y: 0 },
    },
    currency: {
      id: 'eur',
      name: 'Euro',
      code: 'EUR',
      icon: '€',
    },
    timeZone: 'UTC',
    availabilities: [],
    office: {
      id: 'office-123',
      name: 'Main Office',
      manager: {},
    },
    paymentTypes: [],
    primary: false,
  };

  const mockCustomerInfo: ICustomerLastReservation = {
    treatment: {
      id: 'treatment-123',
      key: 'treatment-key-123',
      name: 'Massage',
      duration: 'PT60M',
      price: 100,
      primary: true,
      currency: 'eur',
      type: 'treatment' as any,
      group: {
        id: 'group-123',
        name: 'Wellness',
        description: 'Wellness treatments',
        order: 1,
      },
    },
    days: 5,
    professionalName: 'Jane Smith',
    additionalIds: ['add-1', 'add-2'],
    roomId: 'room-123',
    professionalId: 'prof-123',
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsersPage', () => {
    it('should get paginated users with all parameters', () => {
      httpSpy.get.and.returnValue(of(mockPagination));

      service.getUsersPage(0, 'displayName', 'asc', 10, 'test').subscribe(result => {
        expect(result).toEqual(mockPagination);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/users/pages', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });

    it('should get paginated users without filter', () => {
      httpSpy.get.and.returnValue(of(mockPagination));

      service.getUsersPage(1, 'email', 'desc', 20).subscribe(result => {
        expect(result).toEqual(mockPagination);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/users/pages', jasmine.objectContaining({
        params: jasmine.any(Object),
      }));
    });
  });

  describe('saveUser', () => {
    it('should create customer when role is customer', () => {
      spyOn(service, 'createCustomer').and.returnValue(of(mockApiResponse));

      service.saveUser(mockUser, undefined, Role.customer).subscribe(result => {
        expect(result.response).toEqual(mockApiResponse);
        expect(result.key).toBe('USER.CUSTOMER');
      });

      expect(service.createCustomer).toHaveBeenCalledWith(mockUser);
    });

    it('should add manager when role is manager', () => {
      spyOn(service, 'addManager').and.returnValue(of(mockApiResponse));

      service.saveUser(mockUser, undefined, Role.manager).subscribe(result => {
        expect(result.response).toEqual(mockApiResponse);
        expect(result.key).toBe('USER.MANAGER');
      });

      expect(service.addManager).toHaveBeenCalledWith(mockUser);
    });

    it('should add professional when role is professional', () => {
      spyOn(service, 'addProfessional').and.returnValue(of(mockApiResponse));

      service.saveUser(mockUser, undefined, Role.professional).subscribe(result => {
        expect(result.response).toEqual(mockApiResponse);
        expect(result.key).toBe('USER.PROFESSIONAL');
      });

      expect(service.addProfessional).toHaveBeenCalledWith(mockUser);
    });

    it('should update user when no role specified', () => {
      spyOn(service, 'updateUser').and.returnValue(of(mockApiResponse));

      service.saveUser(mockUser, mockUser.id).subscribe(result => {
        expect(result.response).toEqual(mockApiResponse);
        expect(result.key).toBe('USER.UPDATED.MESSAGE');
      });

      expect(service.updateUser).toHaveBeenCalledWith(mockUser.id, mockUser);
    });
  });

  describe('getUser', () => {
    it('should get user by id', () => {
      httpSpy.get.and.returnValue(of(mockUser));

      service.getUser('user-123').subscribe(result => {
        expect(result).toEqual(mockUser);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/users/user-123', { ...skipLoadingOverlay() });
    });
  });

  describe('getMyUser', () => {
    it('should get current user', () => {
      httpSpy.get.and.returnValue(of(mockUser));

      service.getMyUser().subscribe(result => {
        expect(result).toEqual(mockUser);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/users/me', { ...skipLoadingOverlay() });
    });
  });

  describe('updateUser', () => {
    it('should update user', () => {
      httpSpy.patch.and.returnValue(of(mockApiResponse));

      service.updateUser(mockUser.id, mockUser).subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith('v1/users/user-123', mockUser);
    });
  });

  describe('updateMyUser', () => {
    it('should update current user and return token', () => {
      httpSpy.patch.and.returnValue(of(mockToken));

      service.updateMyUser(mockUser).subscribe(result => {
        expect(result).toEqual(mockToken);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith('v1/users/me', mockUser);
    });
  });

  describe('updateMyPhoto', () => {
    it('should update user photo with FormData', () => {
      const mockDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQE=';
      httpSpy.patch.and.returnValue(of(mockToken));

      service.updateMyPhoto(mockDataUrl).subscribe(result => {
        expect(result).toEqual(mockToken);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith(
        'v1/users/me/photo',
        jasmine.any(FormData),
        jasmine.objectContaining({
          headers: jasmine.any(Object),
        }),
      );
    });
  });

  describe('createCustomer', () => {
    it('should create customer', () => {
      httpSpy.post.and.returnValue(of(mockApiResponse));

      service.createCustomer(mockUser).subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/customers', mockUser);
    });
  });

  describe('getCustomerOverview', () => {
    it('should get customer overview by id', () => {
      httpSpy.get.and.returnValue(of(mockOverview));

      service.getCustomerOverview('customer-123').subscribe(result => {
        expect(result).toEqual(mockOverview);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/customers/customer-123/reservations', { ...skipLoadingOverlay() });
    });

    it('should get current customer overview when id is null', () => {
      httpSpy.get.and.returnValue(of(mockOverview));

      service.getCustomerOverview('me').subscribe(result => {
        expect(result).toEqual(mockOverview);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/customers/me/reservations', { ...skipLoadingOverlay() });
    });
  });

  describe('addProfessional', () => {
    it('should add professional', () => {
      httpSpy.post.and.returnValue(of(mockApiResponse));

      service.addProfessional(mockUser).subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/professionals', mockUser);
    });
  });

  describe('addManager', () => {
    it('should add manager', () => {
      httpSpy.post.and.returnValue(of(mockApiResponse));

      service.addManager(mockUser).subscribe(result => {
        expect(result).toEqual(mockApiResponse);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/offices/managers', mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', () => {
      httpSpy.delete.and.returnValue(of(mockUser));

      service.deleteUser('user-123');

      expect(httpSpy.delete).toHaveBeenCalledWith('v1/users/user-123');
    });
  });

  describe('restore', () => {
    it('should restore user', () => {
      const response: IApiResponse = {
        id: mockUser.id!,
        name: mockUser.displayName,
      };
      httpSpy.patch.and.returnValue(of(response));

      service.restore('user-123', mockUser).subscribe(result => {
        expect(result).toEqual(response);
      });

      expect(httpSpy.patch).toHaveBeenCalledWith('v1/users/user-123', mockUser);
    });
  });

  describe('resendToken', () => {
    it('should resend token', () => {
      httpSpy.post.and.returnValue(of(undefined));

      service.resendToken('user-123').subscribe();

      expect(httpSpy.post).toHaveBeenCalledWith('v1/users/user-123/token', null);
    });
  });

  describe('getProfessionals', () => {
    it('should get all professionals', () => {
      const professionals = [mockUser];
      httpSpy.get.and.returnValue(of(professionals));

      service.getProfessionals().subscribe(result => {
        expect(result).toEqual(professionals);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/professionals', { ...skipLoadingOverlay() });
    });
  });

  describe('getManagers', () => {
    it('should get all managers', () => {
      const managers = [mockUser];
      httpSpy.get.and.returnValue(of(managers));

      service.getManagers().subscribe(result => {
        expect(result).toEqual(managers);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/offices/managers', { ...skipLoadingOverlay() });
    });
  });

  describe('getCustomers', () => {
    it('should get all customers', () => {
      const customers = [mockUser];
      httpSpy.get.and.returnValue(of(customers));

      service.getCustomers().subscribe(result => {
        expect(result).toEqual(customers);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/customers', { ...skipLoadingOverlay() });
    });
  });

  describe('getCustomerInformation', () => {
    it('should get customer information', () => {
      httpSpy.get.and.returnValue(of(mockCustomerInfo));

      service.getCustomerInformation('customer-123').subscribe(result => {
        expect(result).toEqual(mockCustomerInfo);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/customers/customer-123/info', { ...skipLoadingOverlay() });
    });
  });

  describe('setRole', () => {
    it('should set admin role', () => {
      httpSpy.post.and.returnValue(of(mockUser));

      service.setRole('user-123', Role.admin).subscribe(result => {
        expect(result).toEqual(mockUser);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/users/user-123/roles/admin', null);
    });

    it('should set manager role', () => {
      httpSpy.post.and.returnValue(of(mockUser));

      service.setRole('user-123', Role.manager).subscribe(result => {
        expect(result).toEqual(mockUser);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/users/user-123/roles/manager', null);
    });

    it('should set professional role', () => {
      httpSpy.post.and.returnValue(of(mockUser));

      service.setRole('user-123', Role.professional).subscribe(result => {
        expect(result).toEqual(mockUser);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/users/user-123/roles/professional', null);
    });

    it('should set customer role by default', () => {
      httpSpy.post.and.returnValue(of(mockUser));

      service.setRole('user-123', Role.customer).subscribe(result => {
        expect(result).toEqual(mockUser);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/users/user-123/roles/customer', null);
    });
  });

  describe('getAllRoomsByProfessionalId', () => {
    it('should get all rooms for professional', () => {
      const rooms = [mockRoom];
      httpSpy.get.and.returnValue(of(rooms));

      service.getAllRoomsByProfessionalId('prof-123').subscribe(result => {
        expect(result).toEqual(rooms);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/professionals/prof-123/rooms', { ...skipLoadingOverlay() });
    });
  });

  describe('getAllDisableUsers', () => {
    it('should get all disabled users', () => {
      const users = [mockUser];
      httpSpy.get.and.returnValue(of(users));

      service.getAllDisableUsers().subscribe(result => {
        expect(result).toEqual(users);
      });

      expect(httpSpy.get).toHaveBeenCalledWith('v1/users');
    });
  });

  describe('mergeUsers', () => {
    it('should merge users', () => {
      httpSpy.post.and.returnValue(of(mockUser));

      service.mergeUsers('old-user-123', 'new-user-456').subscribe(result => {
        expect(result).toEqual(mockUser);
      });

      expect(httpSpy.post).toHaveBeenCalledWith('v1/users/merge', {
        oldUserId: 'old-user-123',
        newUserId: 'new-user-456',
      });
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors gracefully', () => {
      const errorResponse = new Error('Network error');
      httpSpy.get.and.returnValue(throwError(() => errorResponse));

      service.getUser('user-123').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        },
      });
    });
  });
});

import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';
import { type Subscription } from 'rxjs';
import { IResponseSuccess, PageRequest } from '../interfaces/common';
import { Pagination } from '../interfaces/pagination';
import { ToastType } from '../shared/toast/toast.model';
import { Role, Token } from '../interfaces/token';
import { IOverview, IUser, IUserAll } from '../user/user';
import { UserService } from '../services/user.service';
import {
  cleanCrudCreate,
  cleanCrudDelete,
  cleanCrudUpdate,
  createStoreInitialState,
  patchCrudError,
  StoreState,
} from './crud-signal-store';
import { getLocale } from '../util/helper';
import { IRoomAll } from '../room/room';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStore } from './auth.store';
import { NavigationService } from '../services/navigation.service';

type UserStoreState = StoreState<Pagination<IUserAll>, IUserAll> & {
  customers: IUserAll[] | undefined;
  professionals: IUserAll[] | undefined;
  managers: IUserAll[] | undefined;
  rooms: IRoomAll[] | undefined;
  users: IUserAll[] | undefined;
  overview: IOverview | undefined;
};

const initialState: UserStoreState = {
  ...createStoreInitialState<Pagination<IUserAll>, IUserAll>(),
  customers: undefined,
  professionals: undefined,
  managers: undefined,
  rooms: undefined,
  users: undefined,
  overview: undefined,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    userService = inject(UserService),
    translateService = inject(TranslateService),
    navigationService = inject(NavigationService),
    authStore = inject(AuthStore),
  ) => {
    let loadPageSubscription: Subscription | undefined;
    let loadCustomersSubscription: Subscription | undefined;
    let loadProfessionalsSubscription: Subscription | undefined;
    let loadManagersSubscription: Subscription | undefined;
    let loadRoomsByProfessionalIdSubscription: Subscription | undefined;
    let loadDisabledUsersSubscription: Subscription | undefined;
    let loadByIdSubscription: Subscription | undefined;
    let loadOverviewSubscription: Subscription | undefined;
    let saveSubscription: Subscription | undefined;
    let setRoleSubscription: Subscription | undefined;
    let updateMyUserSubscription: Subscription | undefined;
    let updateMyPhotoSubscription: Subscription | undefined;
    let deleteSubscription: Subscription | undefined;
    let restoreSubscription: Subscription | undefined;
    let resendTokenSubscription: Subscription | undefined;
    let mergeUsersSubscription: Subscription | undefined;

    const cancelAll = (): void => {
      loadPageSubscription?.unsubscribe();
      loadCustomersSubscription?.unsubscribe();
      loadProfessionalsSubscription?.unsubscribe();
      loadManagersSubscription?.unsubscribe();
      loadRoomsByProfessionalIdSubscription?.unsubscribe();
      loadDisabledUsersSubscription?.unsubscribe();
      loadByIdSubscription?.unsubscribe();
      loadOverviewSubscription?.unsubscribe();
      saveSubscription?.unsubscribe();
      setRoleSubscription?.unsubscribe();
      updateMyUserSubscription?.unsubscribe();
      updateMyPhotoSubscription?.unsubscribe();
      deleteSubscription?.unsubscribe();
      restoreSubscription?.unsubscribe();
      resendTokenSubscription?.unsubscribe();
      mergeUsersSubscription?.unsubscribe();
    };
    const patchError = (err: HttpErrorResponse): void => patchCrudError(store, err);

    const requestSuccess = (
      key: string,
      displayName?: string,
      path?: string,
      role?: Role | string,
      toastType: ToastType = 'success',
      reload: boolean = false,
      redirect?: string,
    ): IResponseSuccess => ({
      message: translateService.instant(key, { role, displayName }),
      path,
      reload,
      toastType,
      redirect,
    });

    const dispatchLoginSuccess = (token: Token, returnUrl?: string, lang?: string): void => {
      const state = lang === undefined ? { returnUrl } : { returnUrl, lang };

      authStore.loginSuccess(token, { state: btoa(JSON.stringify(state)) });
    };

    return {
      clean(): void {
        cancelAll();
        patchState(store, initialState);
      },

      clearResponse(): void {
        patchState(store, { response: undefined });
      },

      clearError(): void {
        patchState(store, { error: undefined, subErrors: undefined });
      },

      selectAndNavigate(selected: IUserAll): void {
        patchState(store, {
          selected,
          subErrors: undefined,
          response: undefined,
        });
        navigationService.navigate(['users', selected.id]);
      },

      loadPage(request: PageRequest & { filter?: string }): void {
        loadPageSubscription?.unsubscribe();
        patchState(store, { data: undefined, isLoading: true });

        loadPageSubscription = userService
          .getUsersPage(request.page, request.sort, request.direction, request.size, request.filter)
          .subscribe({
            next: (data) => patchState(store, { data, isLoading: false }),
            error: patchError,
          });
      },

      loadCustomers(): void {
        loadCustomersSubscription?.unsubscribe();
        patchState(store, { customers: undefined, isLoading: true });

        loadCustomersSubscription = userService.getCustomers().subscribe({
          next: (customers) => patchState(store, { customers, isLoading: false }),
          error: patchError,
        });
      },

      loadProfessionals(): void {
        loadProfessionalsSubscription?.unsubscribe();
        patchState(store, { professionals: undefined, isLoading: true });

        loadProfessionalsSubscription = userService.getProfessionals().subscribe({
          next: (professionals) => patchState(store, { professionals, isLoading: false }),
          error: patchError,
        });
      },

      loadManagers(): void {
        loadManagersSubscription?.unsubscribe();
        patchState(store, { managers: undefined, isLoading: true });

        loadManagersSubscription = userService.getManagers().subscribe({
          next: (managers) => patchState(store, { managers: managers, isLoading: false }),
          error: patchError,
        });
      },

      loadRoomsByProfessionalId(professionalId: string): void {
        loadRoomsByProfessionalIdSubscription?.unsubscribe();
        patchState(store, { rooms: undefined, isLoading: true });

        loadRoomsByProfessionalIdSubscription = userService.getAllRoomsByProfessionalId(professionalId).subscribe({
          next: (rooms) => patchState(store, { rooms, isLoading: false }),
          error: patchError,
        });
      },

      loadDisabledUsers(): void {
        loadDisabledUsersSubscription?.unsubscribe();
        patchState(store, { users: undefined, isLoading: true });

        loadDisabledUsersSubscription = userService.getAllDisableUsers().subscribe({
          next: (users) => patchState(store, { users: users, isLoading: false }),
          error: patchError,
        });
      },

      loadById(id: string): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = userService.getUser(id).subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      loadMyUser(): void {
        loadByIdSubscription?.unsubscribe();
        patchState(store, { selected: undefined, isLoading: true });

        loadByIdSubscription = userService.getMyUser().subscribe({
          next: (selected) => patchState(store, { selected, isLoading: false }),
          error: patchError,
        });
      },

      loadOverview(id: string): void {
        loadOverviewSubscription?.unsubscribe();
        patchState(store, { overview: undefined, isLoading: true });

        loadOverviewSubscription = userService.getCustomerOverview(id).subscribe({
          next: (overview) => patchState(store, { overview, isLoading: false }),
          error: patchError,
        });
      },

      save(user: IUser, id?: string, role?: Role): void {
        saveSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        saveSubscription = userService.saveUser(user, id, role).subscribe({
          next: (response) => patchState(store, {
            response: requestSuccess(response.key, response.response.name, `users/${ response.response.id }`,
              undefined,
              'success', false, 'users'),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      setRole(id: string, displayName: string, role: Role, action: 'ADD' | 'REMOVE'): void {
        setRoleSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        setRoleSubscription = userService.setRole(id, role).subscribe({
          next: () => patchState(store, {
            response: requestSuccess(`USER.ROLES.${ action }`, displayName, `users/${ id }`,
              translateService.instant(`COMMON.ROLES.${ role }`)),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      updateMyUser(user: IUser, redirectUrl?: string, message?: string): void {
        updateMyUserSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateMyUserSubscription = userService.updateMyUser(user).subscribe({
          next: (response) => {
            patchState(store, {
              response: {
                message: message || translateService.instant('COMMON.PROFILE.UPDATED.MESSAGE',
                  { displayName: response.user.displayName }),
                toastType: 'success',
              },
              isLoading: false,
            });
            dispatchLoginSuccess(response, redirectUrl, user.locale);
          },
          error: patchError,
        });
      },

      updateMyPhoto(file: string): void {
        updateMyPhotoSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        updateMyPhotoSubscription = userService.updateMyPhoto(file).subscribe({
          next: (response) => {
            patchState(store, {
              response: {
                message: 'COMMON.PROFILE.UPDATED.PHOTO',
                toastType: 'success',
              },
              isLoading: false,
            });
            const lang = getLocale(translateService.getCurrentLang()).language;
            dispatchLoginSuccess(response, `/${ lang }/auth/profile`, lang);
          },
          error: patchError,
        });
      },

      delete(id: string, displayName: string): void {
        deleteSubscription?.unsubscribe();
        cleanCrudDelete(store);

        deleteSubscription = userService.deleteUser(id).subscribe({
          next: () => patchState(store, {
            response: requestSuccess('USER.DELETED.MESSAGE', displayName, undefined, undefined, 'warning', true),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      restore(id: string, user: IUser): void {
        restoreSubscription?.unsubscribe();
        cleanCrudCreate(store);

        restoreSubscription = userService.restore(id, user).subscribe({
          next: (response) => patchState(store, {
            response: requestSuccess('USER.RESTORE.MESSAGE', response.name),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      resendToken(id: string): void {
        resendTokenSubscription?.unsubscribe();
        cleanCrudCreate(store);

        resendTokenSubscription = userService.resendToken(id).subscribe({
          next: () => patchState(store, {
            response: requestSuccess('USER.ACTIVATION_RESEND.MESSAGE'),
            isLoading: false,
          }),
          error: patchError,
        });
      },

      mergeUsers(oldUserId: string, newUserId: string): void {
        mergeUsersSubscription?.unsubscribe();
        cleanCrudUpdate(store);

        mergeUsersSubscription = userService.mergeUsers(oldUserId, newUserId).subscribe({
          next: () => patchState(store, {
            response: requestSuccess('USER.MERGE.SUCCESS'),
            isLoading: false,
          }),
          error: patchError,
        });
      },
    };
  }),
);

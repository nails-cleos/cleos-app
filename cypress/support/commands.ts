declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to mock Firebase login.
     * @example cy.mockFirebaseLogin()
     */
    mockLogin(email: string, displayName: string, role: string): Chainable<any>;

    mockFirebaseAppCheck(): Chainable<any>;

    mockCreateAuthUri(registered: boolean, methods: string[]): Chainable<any>;

    mockFetchSignInMethodsForEmail(methods: string[]): Chainable<any>;

    mockFirebase(email: string): Chainable<any>;

    mockNotifications(): Chainable<any>;

    mockCustomerReservations(): Chainable<any>;

    mockAdminDashboard(date: Date, displayName: string): Chainable<any>;

    mockRoomAdminDashboard(date: Date, displayName: string): Chainable<any>;
  }
}

const MENU = new Map([
  ['ROLE_CUSTOMER', [
    {
      name: 'My reservations',
      path: 'me/reservations',
      icon: 'book_online',
      order: 20
    },
    {
      name: 'Overview',
      path: 'me/overview',
      icon: 'analytics',
      order: 21
    },
    {
      name: 'Referrals',
      path: 'me/referrals',
      icon: 'group_add',
      order: 22
    },
    {
      name: 'Discounts',
      path: 'me/discounts',
      icon: 'local_offer',
      order: 23
    }
  ]],
  ['ROLE_ROOM_ADMIN', [
    {
      name: 'Dashboard',
      path: 'dashboard',
      icon: 'dashboard',
      order: 0
    },
    {
      name: 'App',
      icon: 'apps',
      order: 1,
      subMenus: [
        {
          name: 'Calendar',
          path: 'reservation/calendar',
          icon: 'event',
          order: 1
        },
        {
          name: 'Search',
          path: 'reservation/search',
          icon: 'find_in_page',
          order: 2
        },
        {
          name: 'Notes',
          path: 'notes/add',
          icon: 'note_add',
          order: 3
        },
        {
          name: 'Block agenda',
          path: 'unavailable/block-agenda/add',
          icon: 'event_busy',
          order: 4
        },
        {
          name: 'Unavailable',
          path: 'unavailable',
          icon: 'web_asset_off',
          order: 5
        },
        {
          name: 'Year summary',
          path: 'dashboard/year/summary',
          icon: 'data_exploration',
          order: 6
        }
      ]
    },
    {
      name: 'Room settings',
      icon: 'room_preferences',
      order: 10,
      subMenus: [
        {
          name: 'Nails Cleos - EUR',
          icon: 'room',
          order: -1,
          subMenus: [
            {
              name: 'Rooms',
              path: 'rooms/me/c18629ee-40c8-4bf4-b182-b2fea79dd881',
              icon: 'living',
              order: 1
            },
            {
              name: 'Expenses',
              path: 'rooms/c18629ee-40c8-4bf4-b182-b2fea79dd881/expenses',
              icon: 'shopping_cart',
              order: 3
            },
            {
              name: 'Price',
              path: 'rooms/c18629ee-40c8-4bf4-b182-b2fea79dd881/services',
              icon: 'price_change',
              order: 2
            },
            {
              name: 'Customer not returning',
              path: 'rooms/c18629ee-40c8-4bf4-b182-b2fea79dd881/customers',
              icon: 'sync_disabled',
              order: 4
            }
          ],
          tooltip: 'Frederik Hendrikstraat 8, 2902 HE Capelle aan den IJssel, Netherlands',
          subName: 'Frederik Hendrikstraat 8'
        },
        {
          name: 'Nails Cleos - EUR',
          icon: 'room',
          order: -1,
          subMenus: [
            {
              name: 'Rooms',
              path: 'rooms/me/3e5f252e-e390-4e72-8c44-379c836e7e2a',
              icon: 'living',
              order: 1
            },
            {
              name: 'Expenses',
              path: 'rooms/3e5f252e-e390-4e72-8c44-379c836e7e2a/expenses',
              icon: 'shopping_cart',
              order: 3
            }
          ],
          tooltip: 'Benthuizerstraat 33A, 3036 CB Rotterdam, Países Bajos',
          subName: 'Benthuizerstraat 33A'
        }
      ]
    },
    {
      name: 'App settings',
      icon: 'settings_applications',
      order: 80,
      subMenus: [
        {
          name: 'Users',
          path: 'users',
          icon: 'person_pin',
          order: 1
        },
        {
          name: 'Offices',
          path: 'offices',
          icon: 'store',
          order: 2
        },
        {
          name: 'Rooms',
          path: 'rooms',
          icon: 'living',
          order: 3
        },
        {
          name: 'Colors',
          path: 'colors',
          icon: 'palette',
          order: 4
        }
      ]
    },
    {
      name: 'Admin settings',
      icon: 'admin_panel_settings',
      order: 90,
      subMenus: [
        {
          name: 'Catalogues',
          path: 'catalogues',
          icon: 'photo_library',
          order: 1
        },
        {
          name: 'Discounts',
          path: 'discounts',
          icon: 'local_offer',
          order: 2
        },
        {
          name: 'Currency',
          path: 'currency',
          icon: 'currency_exchange',
          order: 3
        },
        {
          name: 'Invoices',
          path: 'invoices',
          icon: 'receipt_long',
          order: 4
        }
      ]
    },
    {
      name: 'Treatments',
      icon: 'spa',
      order: 100,
      subMenus: [
        {
          name: 'Treatments',
          path: 'treatments',
          icon: 'spa',
          order: 1
        },
        {
          name: 'Sorting',
          path: 'treatments/sorting',
          icon: 'sort',
          order: 2
        }
      ]
    },
    {
      name: 'Additional',
      icon: 'post_add',
      order: 100,
      subMenus: [
        {
          name: 'Additional',
          path: 'additional',
          icon: 'post_add',
          order: 1
        },
        {
          name: 'Sorting',
          path: 'additional/sorting',
          icon: 'sort',
          order: 2
        }
      ]
    }
  ]],
  ['ROLE_ADMIN', [
    {
      name: 'My reservations',
      path: 'me/reservations',
      icon: 'book_online',
      order: 20
    },
    {
      name: 'Overview',
      path: 'me/overview',
      icon: 'analytics',
      order: 21
    },
    {
      name: 'Referrals',
      path: 'me/referrals',
      icon: 'group_add',
      order: 22
    },
    {
      name: 'Discounts',
      path: 'me/discounts',
      icon: 'local_offer',
      order: 23
    }
  ]]
]);

Cypress.Commands.add('mockLogin', (email: string, displayName: string, role: string) => {
  // Define how the login should be mocked
  cy.intercept('POST', 'http://localhost:9999/api/v1/auth/login', {
    statusCode: 200,
    body: {
      tokenAccess: 'mock-token-access',
      user: {
        createdAt: '2025-03-27T11:36:00',
        createdBy: '',
        deleted: false,
        id: 'f40a7c72-6dec-4435-aad7-d16ee9b50475',
        uid: '4tmJwgARVKWj853c6z2gp7W0z4K2',
        enabled: true,
        verified: true,
        email: email,
        displayName: displayName,
        locale: 'en_GB',
        theme: 'light-theme',
        authorities: [
          {
            id: 132,
            authority: role
          }
        ],
        providerId: 'firebase',
        referralMax: 5,
        completed: false
      },
      menus: MENU.get(role)
    },
  }).as('loginRequest');

  cy.intercept('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?**', {
    statusCode: 200,
    body: {
      users: [
        {
          localId: '12345',
          email: email,
          displayName: displayName,
          photoUrl: 'https://example.com/photo.jpg',
          providerUserInfo: [
            {
              providerId: 'google.com',
              displayName: displayName,
              email: email,
              photoUrl: 'https://example.com/photo.jpg',
            },
          ],
        },
      ],
    },
  }).as('lookupRequest');

  cy.intercept('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:update*', {
    statusCode: 200,
    body: {
      kind: 'identitytoolkit#UpdateAccountResponse',
      idToken: 'mock-id-token',
      email: email,
      displayName: displayName,
      photoUrl: null,
      refreshToken: 'mock-refresh-token',
    },
  }).as('updateProfileSuccess');
});

Cypress.Commands.add('mockFirebase', (email: string) => {
  cy.intercept('POST', '**/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword**', {
    statusCode: 200,
    body: {
      idToken: 'mock-id-token',
      email: email,
      refreshToken: 'mock-refresh-token',
      expiresIn: '3600',
      localId: '12345'
    }
  }).as('firebaseSignIn');

  cy.intercept('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:signUp*', {
    statusCode: 200,
    body: {
      idToken: 'mock-id-token',
      email: email,
      refreshToken: 'mock-refresh-token',
      expiresIn: '3600',
      localId: '12345', // Mock user ID
    },
  }).as('firebaseSignUp');

  cy.intercept('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode*', {
    statusCode: 200,
    body: {
      kind: 'identitytoolkit#SendOobCodeResponse',
      email: email,
      requestType: 'VERIFY_EMAIL',
    },
  }).as('sendOobCodeSuccess');
});

Cypress.Commands.add('mockFirebaseAppCheck', () => {
  cy.intercept('POST', '**/content-firebaseappcheck.googleapis.com/v1/**', {
    statusCode: 200, // You can also test with 403 if needed
    body: {
      token: 'mock-app-check-token',
      ttl: '3600s'
    }
  }).as('firebaseAppCheck');
});

//
// Cypress.Commands.add('mockFetchSignInMethodsForEmail', (email) => {
//   cy.intercept('POST', `https://identitytoolkit.googleapis.com/v1/accounts:fetchSignInMethodsForEmail*`, {
//     statusCode: 200,
//     body: {
//       signInMethods: ['password', 'google.com'],  // Mock response showing available sign-in methods
//     },
//   }).as('fetchSignInMethodsRequest');
// });

Cypress.Commands.add('mockCreateAuthUri', (registered: boolean, methods: string[]) => {
  cy.intercept('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri*', {
    statusCode: 200,
    body: {
      kind: 'identitytoolkit#CreateAuthUriResponse',
      allProviders: methods,
      registered: registered,
      captchaRequired: false,
      sessionId: 'fake-session-id',
      signinMethods: methods
    },
  }).as('createAuthUriRequest');
});

Cypress.Commands.add('mockNotifications', () => {
  cy.intercept(
    'GET',
    '**/api/v1/notifications/pages?page=0&size=10&sort=date&direction=desc',
    {
      statusCode: 204,
      body: null, // No content for 204
    }
  ).as('getNotifications');
});

Cypress.Commands.add('mockCustomerReservations', () => {
  cy.intercept(
    'GET',
    '**/api/v1/reservations/customer?page=0&size=10&sort=timestamp&direction=desc',
    {
      statusCode: 200,
      body: {
        upcoming: [],
        reservations: {
          content: [],
          totalPages: 0,
          totalElements: 0,
          numberOfElements: 0,
        }
      }
    }
  ).as('getCustomerReservations');
});

Cypress.Commands.add('mockAdminDashboard', (date: Date, displayName: string) => {
  cy.intercept(
    'GET',
    `**/api/v1/dashboard/cards?date=${date.toISOString().slice(0, 10)}`,
    {
      statusCode: 200,
      body: [
        {
          professionalName: displayName,
          professionalId: 'a6f7c7d1-1b7f-4e47-8f45-3a5c7c2bb4f8',
          error: {
            status: 'NO_CONTENT_ERROR',
            message: 'Events no content'
          },
          timeZone: 'Europe/Amsterdam',
        }
      ]
    }
  ).as('getCards');

  cy.intercept(
    'GET',
    `**/api/v1/dashboard/events?date=${date.toISOString().slice(0, 10)}`,
    {
      statusCode: 200,
      body: [
        {
          professionalName: displayName,
          professionalId: 'a6f7c7d1-1b7f-4e47-8f45-3a5c7c2bb4f8',
          error: {
            status: 'NO_CONTENT_ERROR',
            message: 'Events no content'
          },
          timeZone: 'Europe/Amsterdam',
        }
      ]
    }
  ).as('getEvents');
});

Cypress.Commands.add('mockRoomAdminDashboard', (date: Date, displayName: string) => {
  cy.intercept(
    'GET',
    `**/api/v1/dashboard/me/events?date=${date.toISOString().slice(0, 10)}`,
    {
      statusCode: 200,
      body: [
        {
          professionalName: displayName,
          professionalId: 'a6f7c7d1-1b7f-4e47-8f45-3a5c7c2bb4f8',
          error: {
            status: 'NO_CONTENT_ERROR',
            message: 'Events no content'
          },
          timeZone: 'Europe/Amsterdam',
        }
      ]
    }
  ).as('getMeEvents');
});

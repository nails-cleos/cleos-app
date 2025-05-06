declare namespace Cypress {
  interface Chainable {
    randomUUID(): Chainable<string>;

    logout(): Chainable<any>;

    checkAppDialog(title: string, message: string, buttonClick: string): Chainable<any>;

    checkMatList(title?: string, icon?: string, ...details: string[]): Chainable<any>;

    openMenu(breakpoint: string, menus: string[]): Chainable<any>;

    buttonClickOnTable(breakpoint: string, column: string, rowClass: string, rowExpandedClass: string,
                       button: string, otherButtons?: string[]): Chainable<any>;

    selectOption(id: string, option: string): Chainable<any>;

    formControlType(formControlName: string, value: any, type?: string): Chainable<any>;

    setTime(hour: number | string, minute?: number | string): Chainable<any>;

    mockAuthentication(email: string, role: string): Chainable<any>;

    mockLogin(email: string, displayName: string, role: string): Chainable<any>;

    mockFirebaseAppCheck(): Chainable<any>;

    mockCreateAuthUri(registered: boolean, methods: string[]): Chainable<any>;

    mockFetchSignInMethodsForEmail(methods: string[]): Chainable<any>;

    mockFirebase(email: string): Chainable<any>;

    mockNotifications(): Chainable<any>;

    mockCustomerReservations(): Chainable<any>;

    mockAdminDashboard(date: Date, displayName: string): Chainable<any>;

    mockRoomAdminDashboard(date: Date, displayName: string): Chainable<any>;

    mockCustomersData(customerId: string, treatmentId: string): Chainable<any>;

    mockRoomData(customerId: string): Chainable<any>;

    mockSearch(customerId: string, roomId: string, groupId: string, professionalId: string, date: Date,
               days: number): Chainable<any>;

    mockCreateReservation(reservationId: string, customerId: string, date: Date, professionalId: string,
                          roomId: string, treatmentId: string, additionalList?: string[]): Chainable<any>;

    mockUsers(total?: number, displayName?: string): Chainable<any>;

    mockUser(id: string, selectedUser?: any): Chainable<any>;

    mockTreatments(total?: number, id?: string): Chainable<any>;

    mockTreatment(id: string, selectedTreatment?: any): Chainable<any>;

    mockColors(page: boolean, total?: number, id?: string): Chainable<any>;
  }
}

Cypress.Commands.add('randomUUID', () => cy.wrap('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
})));

Cypress.Commands.add('logout', () => {
  cy.get('button[name="settings"]').click();
  cy.get('mat-list-item').contains('Sign out').click();
  cy.url().should('include', 'home');
});

Cypress.Commands.add('checkAppDialog', (title: string, message: string, buttonClick: string) => {
  cy.get('app-dialog')
    .find('h1[mat-dialog-title]')
    .contains(title)
    .should('exist');

  cy.get('app-dialog')
    .find('div[mat-dialog-content]')
    .contains(message)
    .should('exist');

  cy.get('app-dialog')
    .find('div[mat-dialog-actions]')
    .contains(buttonClick)
    .click({ force: true });
});

Cypress.Commands.add('checkMatList', (title?: string, icon?: string, ...details: string[]) => {
  if (title) {
    cy.get('mat-list-item').find('div[matListItemTitle]').contains(title).should('exist');
  }

  if (icon) {
    cy.get('mat-list-item').find('mat-icon[matListItemIcon]').contains(icon).should('exist');
  }

  details.forEach(detail => cy.get('mat-list-item').find('div[matListItemLine]').contains(detail).should('exist'));
});

Cypress.Commands.add('openMenu', (breakpoint: string, menus: string[]) => {
  if (['XSmall', 'Small', 'Medium'].includes(breakpoint)) {
    cy.get('button[name="cleosMenu"]').click();
  }
  menus.forEach((menu, index) => {
    if (index === 0) {
      cy.get('mat-list-item').contains(menu).click();
    } else {
      cy.get('mat-list-item.sub-menu').contains(menu).click();
    }
  });
});

Cypress.Commands.add('buttonClickOnTable', (breakpoint: string, column: string, rowClass: string, rowExpandedClass,
                                            button: string, otherButtons?: string[]) => {
  if (['XSmall', 'Small'].includes(breakpoint)) {
    cy.contains(`tr.${ rowClass }`, column).click({ force: true });
    otherButtons?.forEach(otherButton => cy.get(`tr.${ rowExpandedClass }`).should('be.visible')
      .find('button[mat-icon-button]').contains(otherButton));
    cy.get(`tr.${ rowExpandedClass }`).should('be.visible').find('button[mat-icon-button]').contains(button)
      .click({ force: true });
  } else {
    otherButtons?.forEach(otherButton => cy.get('table').contains('tr', column)
      .find('button[mat-icon-button]').contains(otherButton));
    cy.get('table').contains('tr', column).find('button[mat-icon-button]').contains(button).click({ force: true });
  }
});

Cypress.Commands.add('selectOption', (id: string, option: string) => {
  cy.get(`#${ id }`).should('be.visible');
  cy.get(`#${ id }`).click({ force: true });

  cy.get('mat-option').should('exist').and('be.visible');
  cy.get('mat-option').contains(option).click({ force: true });
});

Cypress.Commands.add('formControlType', (formControlName: string, value: any, type: string = 'input') => {
  cy.get(`${ type }[formControlName="${ formControlName }"]`).scrollIntoView().should('be.visible');
  cy.get(`${ type }[formControlName="${ formControlName }"]`).clear().type(value);
});

Cypress.Commands.add('setTime', (hour: number | string, minute: number | string = 0) => {
  cy.get('ngx-material-timepicker-content', { timeout: 5000 }).should('exist').contains(hour).click({ force: true });
  cy.get('ngx-material-timepicker-content').contains(minute === 0 ? '00' : minute).click({ force: true });
  cy.get('.timepicker-button').contains('Ok').click({ force: true });
  cy.wait(50);
});

const firebaseUser = (email: string, displayName?: string, kind?: string) => ({
  kind: kind,
  idToken: 'mock-id-token',
  email: email,
  displayName: displayName,
  photoUrl: null,
  refreshToken: 'mock-refresh-token',
  expiresIn: '3600',
  localId: '12345'
});

const dashboardNoContent = (displayName: string, messageKey: string) => ({
  professionalName: displayName,
  professionalId: 'a6f7c7d1-1b7f-4e47-8f45-3a5c7c2bb4f8',
  error: {
    status: 'NO_CONTENT_ERROR',
    message: `${ messageKey } no content`
  },
  timeZone: 'Europe/Amsterdam',
});

const createReservationTreatment = (treatment?: any) => ({
  id: 1937,
  key: treatment?.id,
  name: treatment?.name,
  description: treatment?.description,
  price: treatment?.price,
  duration: treatment?.duration,
  groupId: treatment?.group?.id
});

const createReservationAdditional = (additional?: any) => ({
  id: 1947,
  key: additional.id,
  name: additional?.name,
  description: additional?.description,
  price: additional?.price,
  duration: additional?.duration,
});

const createColor = (name: string, id: string) => ({
  createdAt: '2023-07-22T10:28:56.07039',
  createdBy: 'Unknown user',
  modifiedAt: '2023-07-22T10:28:56.07039',
  modifiedBy: 'Unknown user',
  deleted: false,
  id: id,
  name: name
});

const createTimestamp = (date: Date, plusDays?: number, hour?: number, minute?: number) => {
  const newDate = addDays(date, plusDays);
  if (hour) {
    newDate.setHours(hour, minute ?? 0);
  }
  return Math.floor(newDate.getTime() / 1000);
};

const addDays = (date: Date, plusDays: number = 0) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + plusDays);
  return newDate;
};

const addMonths = (date: Date, plusMonths: number = 0) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + plusMonths);
  return newDate;
};

const createUnavailable = (professional: any, description: string, timestamp: number,
                           repeat: string, end?: string, duration?: number, allDay: boolean = false,
                           type: string = 'UNAVAILABLE') => ({
  createdAt: '2025-01-31T11:54:00',
  createdBy: '57ceebd2-a012-42a3-af9a-5d546c193200',
  deleted: false,
  id: 'fd25c57a-37a7-41d3-9ec5-8e5e89989bc9',
  description: description,
  professional: professional,
  timestamp: timestamp,
  end: end,
  duration: duration,
  repeat: repeat,
  allDay: allDay,
  type: type
});

const createNote = (professional: any, description: string, date: string, repeat: string) => ({
  createdAt: '2024-02-20T09:15:28.841764',
  createdBy: '57ceebd2-a012-42a3-af9a-5d546c193200',
  deleted: false,
  id: '698e7ecd-e9db-4766-a498-b03e26be4f80',
  description: description,
  professional: professional,
  date: date,
  repeat: repeat,
  completed: false
});

Cypress.Commands.add('mockAuthentication', (email: string, role: string) => {
  cy.fixture('users').then((usersData) => {
    cy.fixture('menus').then((menuData) => {
      const userAuth = {
        isAuthenticated: true,
        redirect: true,
        isLoading: false,
        user: usersData.find(((user: { email: string; }) => user.email === email)),
        token: 'mockToken',
        menus: menuData.find((menu: { role: string; }) => menu.role === role)?.menu,
        queryParams: {}
      };
      localStorage.setItem('auth', JSON.stringify(userAuth));
    });
  });
});

Cypress.Commands.add('mockLogin', (email: string, displayName: string, role: string) => {
  cy.fixture('users').then((usersData) => {
    cy.fixture('menus').then((menuData) => {
      cy.intercept('POST', 'http://localhost:9999/api/v1/auth/login', {
        statusCode: 200,
        body: {
          tokenAccess: 'mock-token-access',
          user: usersData.find(((user: { email: string; }) => user.email === email)),
          menus: menuData.find((menu: { role: string; }) => menu.role === role)?.menu
        },
      }).as('loginRequest');
    });
  });
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
    body: firebaseUser(email, displayName, 'identitytoolkit#UpdateAccountResponse')
  }).as('updateProfileSuccess');
});

Cypress.Commands.add('mockFirebase', (email: string) => {
  cy.intercept('POST', '**/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword**', {
    statusCode: 200,
    body: firebaseUser(email)
  }).as('firebaseSignIn');

  cy.intercept('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:signUp*', {
    statusCode: 200,
    body: firebaseUser(email),
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

  cy.contains('Got it!').click({ force: true });
});

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
    new RegExp('/api/v1/notifications/pages\\?page=0&size=\\d+&sort=date&direction=desc'),
    {
      statusCode: 204,
      body: null,
    }
  ).as('getNotifications');
});

Cypress.Commands.add('mockCustomerReservations', () => {
  cy.intercept(
    'GET',
    new RegExp('/api/v1/reservations/customer\\?page=0&size=\\d+&sort=timestamp&direction=desc'),
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
    `**/api/v1/dashboard/cards?date=${ date.toISOString().slice(0, 10) }`,
    {
      statusCode: 200,
      body: [dashboardNoContent(displayName, 'Reservations')]
    }
  ).as('getCards');

  cy.intercept(
    'GET',
    `**/api/v1/dashboard/events?date=${ date.toISOString().slice(0, 10) }`,
    {
      statusCode: 200,
      body: [dashboardNoContent(displayName, 'Events')]
    }
  ).as('getEvents');
});

Cypress.Commands.add('mockRoomAdminDashboard', (date: Date, displayName: string) => {
  cy.intercept(
    'GET',
    `**/api/v1/dashboard/me/events?date=${ date.toISOString().slice(0, 10) }`,
    {
      statusCode: 200,
      body: [dashboardNoContent(displayName, 'Events')]
    }
  ).as('getMeEvents');
});

Cypress.Commands.add('mockCustomersData', (customerId: string, treatmentId: string) => {
  cy.fixture('users').then((usersData) => {
    cy.intercept(
      'GET',
      '**/api/v1/customers',
      {
        statusCode: 200,
        body: usersData
      }
    ).as('getCustomers');
  });

  cy.fixture('treatmentGroups').then((treatments) => {
    const treatment = treatments.find((treatment: { id: string; }) => treatment.id === treatmentId);
    cy.intercept(
      'GET',
      `**/api/v1/customers/${ customerId }/info`,
      {
        statusCode: 200,
        body: {
          treatment: {
            id: 1618,
            key: treatmentId,
            name: treatment?.name,
            description: treatment?.description,
            price: treatment?.price,
            duration: treatment?.duration,
            groupId: treatment?.group?.id,
            color: createColor('Teddy', 'b7688ab9-2957-4f87-9ec8-f6fae2885fe1'),
          },
          days: 20,
          professionalName: 'Nails Cleos',
          additionalIds: [
            '397bce4b-27ba-459f-801a-dcceea330b8d'
          ]
        }
      }
    ).as('getCustomerInfo');
  });
});

Cypress.Commands.add('mockRoomData', (customerId: string) => {
  cy.fixture('rooms').then((roomData) => {
    cy.intercept(
      'GET',
      `**/api/v1/rooms?customerId=${ customerId }`,
      {
        statusCode: 200,
        body: roomData
      }
    ).as('getRooms');
  });
});

Cypress.Commands.add('mockSearch', (
  customerId: string, roomId: string, groupId: string, professionalId: string, date: Date, days: number
) => {
  cy.fixture('treatmentSearch').then((treatments) => {
    cy.intercept(
      'GET',
      `**/api/v1/treatments?roomId=${ roomId }&customerId=${ customerId }`,
      {
        statusCode: 200,
        body: {
          discounts: [],
          treatments: treatments
        }
      }
    ).as('getTreatmentSearch');
  });

  cy.fixture('additional').then((additionalList) => {
    cy.intercept(
      'GET',
      `**/api/v1/additional/groups?roomId=${ roomId }&groupId=${ groupId }`,
      {
        statusCode: 200,
        body: additionalList
      }
    ).as('getAdditional');
  });

  const dateFormatted = date.toISOString().slice(0, 10);
  cy.fixture('rooms').then((roomData) => {
    cy.fixture('users').then((usersData) => {
      cy.fixture('treatmentSearch').then((treatmentData) => {
        cy.fixture('additional').then((additionalData) => {
          const room = roomData.find((room: { id: string; }) => room.id === roomId);
          const professional = usersData.find((user: { id: string; }) => user.id === professionalId);
          cy.intercept(
            'GET',
            `**/api/v1/reservations/rooms/${ roomId }?days=${ days }&dates=${ dateFormatted }&professionalId=${ professionalId }`,
            {
              statusCode: 200,
              body: [
                {
                  room: room,
                  reservations: [
                    {
                      createdAt: '2025-03-18T19:21:00',
                      createdBy: '57ceebd2-a012-42a3-af9a-5d546c193200',
                      deleted: false,
                      id: 'bf84528b-ec98-4134-9963-84f1b36e2013',
                      customer: usersData.find(
                        (user: { id: string; }) => user.id === '4c27715c-21a3-4255-97ac-9263d9f177e7'),
                      professional: professional,
                      room: room,
                      treatment: createReservationTreatment(
                        treatmentData.find((it: { id: string; }) => it.id === '22edcbf0-0d7a-4731-bf12-67ef97dad310')),
                      additional: [createReservationAdditional(additionalData.find(
                        (it: { id: string; }) => it.id === '397bce4b-27ba-459f-801a-dcceea330b8d'))],
                      extras: [],
                      timestamp: createTimestamp(date, 0, 10, 0),
                      state: 'APPROVED',
                      customerCreated: false,
                      accepted: true,
                      version: 3
                    },
                    {
                      createdAt: '2025-03-17T18:21:00',
                      createdBy: '57ceebd2-a012-42a3-af9a-5d546c193200',
                      deleted: false,
                      id: 'f4e86857-b04e-4acb-a09b-a59d3aa13e23',
                      customer: usersData.find(
                        (user: { id: string; }) => user.id === 'bf534229-f2e2-4417-af4a-6021a5593947'),
                      professional: professional,
                      room: room,
                      treatment: createReservationTreatment(
                        treatmentData.find((it: { id: string; }) => it.id === 'c380964a-736d-43e1-8f49-202f88088286')),
                      additional: [createReservationAdditional(
                        additionalData.find(
                          (it: { id: string; }) => it.id === '397bce4b-27ba-459f-801a-dcceea330b8d'))],
                      extras: [],
                      timestamp: createTimestamp(date, 0, 15, 30),
                      state: 'APPROVED',
                      customerCreated: false,
                      accepted: true,
                      version: 1
                    }
                  ],
                  unavailableList: [
                    createUnavailable(professional, 'Once a month', createTimestamp(date, 2, 17, 30),
                      'ONCE_A_MONTH', addMonths(date, 2).toISOString().slice(0, 10), 3600),
                    createUnavailable(professional, 'Every day', createTimestamp(date, -5, 16, 45),
                      'EVERY_DAY', addDays(date, 5).toISOString().slice(0, 10), 1800),
                    createUnavailable(professional, 'None', createTimestamp(date, 2, 10, 0),
                      'NONE', addDays(date, 1).toISOString().slice(0, 10), 1800),
                    createUnavailable(professional, 'All day', createTimestamp(date, 1, 10, 0),
                      'NONE', undefined, undefined, true),
                  ],
                  birthdays: [
                    {
                      ...usersData.find(
                        (user: { id: string; }) => user.id === '0a701cb5-673b-4512-aaf1-cdc61c76a3fa'),
                      dob: dateFormatted
                    }
                  ],
                  notes: [createNote(professional, 'Transferir', addDays(date, 1).toISOString().slice(0, 10),
                    'ONCE_A_MONTH')],
                  date: dateFormatted
                }
              ]
            }
          ).as('searchReservations');
        });
      });
    });
  });
});

Cypress.Commands.add('mockCreateReservation', (
  reservationId: string,
  customerId: string,
  date: Date,
  professionalId: string,
  roomId: string,
  treatmentId: string,
  additionalList?: string[],
) => {
  cy.fixture('users').then((usersData) => {
    cy.fixture('rooms').then((roomData) => {
      cy.fixture('treatmentSearch').then((treatmentData) => {
        cy.fixture('additional').then((additionalData) => {
          cy.intercept(
            'POST',
            '**/api/v1/reservations',
            (req) => {
              req.alias = 'createReservation';
              req.reply({
                statusCode: 201,
                body: [{
                  id: reservationId,
                  ...req.body
                }]
              });
            });
          cy.intercept(
            'GET',
            `**/api/v1/reservations/${ reservationId }`,
            {
              statusCode: 200,
              body: {
                createdAt: new Date().toLocaleDateString('en-GB'),
                createdBy: '57ceebd2-a012-42a3-af9a-5d546c193200',
                deleted: false,
                id: reservationId,
                customer: usersData.find((user: { id: string; }) => user.id === customerId),
                professional: usersData.find((user: { id: string; }) => user.id === professionalId),
                room: roomData.find((room: { id: string; }) => room.id === roomId),
                treatment: createReservationTreatment(
                  treatmentData.find((it: { id: string; }) => it.id === treatmentId)),
                additional: additionalList?.map(additionalId => createReservationAdditional(
                  additionalData.find((it: { id: string; }) => it.id === additionalId))),
                extras: [],
                timestamp: createTimestamp(date),
                state: 'APPROVED',
                customerCreated: false,
                accepted: true,
                version: 0
              }
            }
          ).as('getReservation');

          cy.intercept(
            'GET',
            `**/api/v1/reservations/${ reservationId }/payments`,
            {
              statusCode: 204,
              body: []
            }
          ).as('getPayments');

          cy.intercept(
            'GET',
            `**/api/v1/reservations/${ reservationId }/history`,
            {
              statusCode: 204,
              body: []
            }
          ).as('getHistory');
        });
      });
    });
  });
});

Cypress.Commands.add('mockUsers', (total?: number, displayName?: string) => {
  cy.fixture('users').then((userData) => {
    cy.intercept(
      'GET',
      new RegExp('/api/v1/users/pages\\?page=0&size=\\d+&sort=displayName&direction=asc'),
      {
        statusCode: 200,
        body: { content: userData.slice(0, total ?? userData.length), totalElements: total ?? userData.length }
      }
    ).as('getUsers');

    if (displayName) {
      const user = userData.find((u: any) => u.displayName === displayName);
      expect(user).to.exist;
      cy.wrap(user).as('selectedUser');
    }
  });
});

Cypress.Commands.add('mockUser', (id: string, selectedUser?: any) => {
  cy.fixture('users').then((userData) => {
    cy.intercept(
      'GET',
      `**/api/v1/users/${ selectedUser?.id ?? id }`,
      {
        statusCode: 200,
        body: selectedUser ?? userData.find((u: any) => u.id === id)
      }
    ).as('getUser');
  });
});

Cypress.Commands.add('mockTreatments', (total?: number, id?: string) => {
  cy.fixture('treatmentGroups').then((treatmentGroupData) => {
    cy.intercept(
      'GET',
      new RegExp('/api/v1/treatments/pages\\?page=0&size=\\d+&sort=order&direction=asc'),
      {
        statusCode: 200,
        body: {
          content: treatmentGroupData.slice(0, total ?? treatmentGroupData.length),
          totalElements: total ?? treatmentGroupData.length
        }
      }
    ).as('getTreatments');

    if (id) {
      cy.fixture('treatments').then((treatmentData) => {
        const treatment = treatmentData.find((t: any) => t.id === id);
        expect(treatment).to.exist;
        cy.wrap(treatment).as('selectedTreatment');
      });
    }
  });
});

Cypress.Commands.add('mockTreatment', (id: string, selectedTreatment?: any) => {
  cy.fixture('treatments').then((treatmentData) => {
    cy.intercept(
      'GET',
      `**/api/v1/treatments/${ selectedTreatment?.id ?? id }`,
      {
        statusCode: 200,
        body: selectedTreatment ?? treatmentData.find((t: any) => t.id === id)
      }
    ).as('getTreatment');
  });
});

Cypress.Commands.add('mockColors', (page: boolean, total?: number, id?: string) => {
  cy.fixture('colors').then((colorData) => {
    const url = new RegExp(page ? '/api/v1/colors/pages\\?page=0&size=\\d+&sort=name&direction=asc' : '/api/v1/colors');
    const content = colorData.slice(0, total ?? colorData.length);
    const body = page ? {
      content: content,
      totalElements: total ?? colorData.length
    } : content;
    cy.intercept(
      'GET',
      url,
      {
        statusCode: 200,
        body: body
      }
    ).as('getColors');

    if (id) {
      const color = colorData.find((c: any) => c.id === id);
      expect(color).to.exist;
      cy.wrap(color).as('selectedColor');
    }
  });
});

import '../support/commands';
import { Role } from "../../src/app/interfaces/token";
import { dayViewTitle, monthViewTitle } from "../../src/app/util/dates";

describe('Register user', () => {
  const email = 'Kdvek@jevfm';
  const displayName = 'Customer 1';

  beforeEach(() => {
    cy.visit('en-GB/auth');
    cy.mockFirebaseAppCheck();
    cy.mockFirebase(email);
    cy.mockNotifications();
    cy.mockLogin(email, displayName, 'ROLE_CUSTOMER');
    cy.mockCreateAuthUri(false, []);
    cy.mockCustomerReservations();
  });

  it('should register a new user', () => {
    cy.get('button').contains('Sign in with Email').click();

    cy.get('form').within(() => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="email"]').type(email);

      cy.get('button').contains('Next').click();

      cy.get('input[name="displayName"]').should('be.visible');
      cy.get('input[name="displayName"]').type(displayName);

      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="password"]').type('password');

      cy.get('button[type="submit"]').click();
    });

    cy.get('button').contains('Login').click();

    cy.get('.mat-mdc-snack-bar-container')
      .find('.mat-mdc-snack-bar-action')
      .contains('OK')
      .click();

    cy.url().should('include', '/me/reservations');
    cy.get('mat-card-title').contains('No upcoming reservations');
    cy.get('tr').contains('No reservations');
    cy.logout();
  });
});

describe('Login with existing user', () => {
  const displayName = 'Mock User';
  const today = new Date();

  beforeEach(() => {
    cy.visit('en-GB/auth');
    cy.mockFirebaseAppCheck();
    cy.mockNotifications();
  });
  const mapRole = new Map([
    [Role.customer, { email: 'Kdvek@jevfm', url: '/me/reservations', mocks: [() => cy.mockCustomerReservations()] }],
    [Role.admin, { email: 'nails.cleos@gmail.com', url: '/dashboard', mocks: [() => cy.mockAdminDashboard(today, displayName)] }],
    [Role.roomAdmin, { email: 'Jsbaj@nebeje',  url: '/events', mocks: [() => cy.mockRoomAdminDashboard(today, displayName)] }]
  ]);

  beforeEach(() => cy.mockCreateAuthUri(true, ['password']));

  mapRole.forEach((value, role) => {
    context(`Login with role: ${ role }`, () => {
      const email = value.email;
      beforeEach(() => {
        cy.mockFirebase(email);
        cy.mockLogin(email, displayName, role);
        value.mocks.forEach(fn => fn());
      });

      it('should login with the user', () => {
        cy.get('button').contains('Sign in with Email').click();

        cy.get('form').within(() => {
          cy.get('input[name="email"]').should('be.visible');
          cy.get('input[name="email"]').type(email);

          cy.get('button').contains('Next').click();

          cy.get('input[name="password"]').should('be.visible');
          cy.get('input[name="password"]').type('password');

          cy.get('button[type="submit"]').click();
        });

        cy.get('button').contains('Login').click();

        cy.url().should('include', value.url);

        switch (role) {
          case Role.customer:
            cy.get('mat-card-title').contains('No upcoming reservations');
            cy.get('tr').contains('No reservations');
            break;
          case Role.admin:
            cy.get('h3').contains(monthViewTitle(today, 'en-GB'));
            break;
          case Role.roomAdmin:
            const date = dayViewTitle(today, 'en-GB');
            cy.get('h2').contains(date);
            cy.get('h2').contains(`Room is not open ${ date }`);
            break;
        }
        cy.logout();
      });
    });
  });
});

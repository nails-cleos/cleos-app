import '../support/commands';
import { Role } from "../../src/app/interfaces/token";
import { dayViewTitle, monthViewTitle } from "../../src/app/util/dates";
import { devices } from "../support/utils";

const displayName = 'Customer 1';
const today = new Date();

const mapRole = new Map([
  [Role.customer, { email: 'Kdvek@jevfm', url: '/me/reservations', mocks: [() => cy.mockCustomerReservations()] }],
  [Role.admin,
    { email: 'nails.cleos@gmail.com', url: '/dashboard', mocks: [() => cy.mockAdminDashboard(today, displayName)] }],
  [Role.roomAdmin,
    { email: 'Jsbaj@nebeje', url: '/events', mocks: [() => cy.mockRoomAdminDashboard(today, displayName)] }]
]);

devices.forEach(({ name, width, height }) => {
  describe(`Authentication with ${ name }`, () => {
    beforeEach(() => cy.viewport(width, height));

    context('Register', () => {
      const email = 'Kdvek@jevfm';
      beforeEach(() => {
        cy.mockFirebase(email);
        cy.mockNotifications();
        cy.mockLogin(email, displayName, 'ROLE_CUSTOMER');
        cy.mockCreateAuthUri(false, []);
        cy.mockCustomerReservations();
      });

      it(`should register a new user in ${ name }`, () => {
        cy.visit('en-GB/auth');
        cy.mockFirebaseAppCheck();
        cy.get('button').contains('Sign in with Email').click();

        cy.get('form').within(() => {
          cy.get('input[name="email"]').should('be.visible');
          cy.get('input[name="email"]').type(email);

          cy.get('button').contains('Next').click();

          cy.get('input[name="displayName"]').should('be.visible');
          cy.get('input[name="displayName"]').type(displayName, { force: true });

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

    context('Login', () => {
      mapRole.forEach((value, role) => {
        const email = value.email;
        it(`Login with existing user with role: ${ role }`, () => {
          cy.visit('en-GB/auth');
          cy.mockFirebaseAppCheck();
          cy.mockNotifications();
          cy.mockCreateAuthUri(true, ['password'])
          cy.mockFirebase(email);
          cy.mockLogin(email, displayName, role);
          value.mocks.forEach(fn => fn());
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
});

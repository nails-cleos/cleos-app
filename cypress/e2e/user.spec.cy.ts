import '../support/commands';
import { breakpointToButtons, devices } from '../support/utils';
import { DEFAULT_LOCALE } from '@app/util/dates';

const mapRole = new Map([
  ['Customer', { url: 'customers', displayName: 'Customer 1', otherButtons: [] }],
  ['Professional', { url: 'professionals', displayName: 'Nails Cleos', otherButtons: ['merge'] }],
  ['Manager', { url: 'offices/managers', displayName: 'Nails Cleos', otherButtons: ['merge'] }],
]);

const waitForEmptyUsersState = () => {
  cy.get('.app-table-shell').should('be.visible');
  cy.contains('.no-content', 'No users', { timeout: 15000 }).should('be.visible');
};

const waitForUserRow = (displayName: string) => {
  cy.get('.app-table-shell').should('be.visible');
  cy.contains('tr.app-table-master-row', displayName, { timeout: 15000 }).should('exist');
};

const setColorInput = (dataCy: string, value: string) => {
  cy.get(`[data-cy="${ dataCy }"]`, { timeout: 15000 })
    .scrollIntoView()
    .should('exist')
    .and('not.be.disabled')
    .clear({ force: true })
    .type(value, { force: true });
};

devices.forEach(({ name, width, height, breakpoints }) => {
  describe(`Users with ${ name }`, () => {
    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      const email = 'nails.cleos@gmail.com';
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.mockNotifications();
      cy.mockCatalogues();
      cy.mockAdminDashboard(new Date(), 'CLEOS');

      cy.visit(`${DEFAULT_LOCALE}/dashboard`);
      cy.mockFirebaseAppCheck();
    });

    mapRole.forEach((value, role) => {
      it(`should create a new ${ role }`, () => {
        cy.mockApi('POST', `**/api/v1/${ value.url }`, {
          body: { name: value.displayName },
          alias: 'saveUser',
        });
        cy.intercept('POST', `**/api/v1/${ value.url }`).as('saveUser');

        cy.mockUsers(0);
        cy.openMenu(breakpoints, ['App settings', 'Users']);
        cy.wait('@getUsers');
        waitForEmptyUsersState();
        cy.get('button[id="add-button"]').click({ force: true });
        cy.get('.app-surface-eyebrow').contains('Add user');
        cy.selectOption('select-role', role);

        cy.formControlType('email', `${ role }@email.com`);
        cy.selectOption('select-lang', 'English');
        cy.formControlType('displayName', `${ role } Name`);

        cy.get('#phone').should('be.visible');
        cy.get('#phone').type('+310625250787');

        cy.get('[data-cy="dob-picker"]').click({ force: true });
        cy.get('.mat-calendar-previous-button').click({ force: true });
        cy.get('td[data-mat-row="1"][data-mat-col="1"]').find('button').click({ force: true });
        cy.get('td[data-mat-row="1"][data-mat-col="1"]').find('button').click({ force: true });
        cy.get('td[data-mat-row="1"][data-mat-col="1"]').find('button').click({ force: true });

        if (role !== 'Customer') {
          setColorInput('dark-color-picker', '#0f0');
          setColorInput('light-color-picker', '#00f');
        }

        cy.get('button[type="submit"]').click({ force: true });

        cy.wait('@saveUser').then(userData => {
          const body = userData.request.body;
          expect(body.email).to.eq(`${ role }@email.com`);
          expect(body.displayName).to.eq(`${ role } Name`);
          expect(body.locale).to.eq('en_GB');
          expect(body.phone).to.eq('+31 6 25250787');
          expect(body.dob).to.be.ok;
          if (role !== 'Customer') {
            expect(body.darkColor).to.eq('#00ff00');
            expect(body.lightColor).to.eq('#0000ff');
          }
        });

        cy.url().should('include', '/users');
      });

      it(`should edit a ${ role }`, () => {
        cy.mockUsers(undefined, value.displayName);
        cy.openMenu(breakpoints, ['App settings', 'Users']);
        cy.wait('@getUsers');
        waitForUserRow(value.displayName);

        cy.get('@selectedUser').then((user: any) => {
          cy.mockApi('PATCH', `**/api/v1/users/${ user.id }`, {
            body: { name: value.displayName },
            alias: 'updateUser',
          });
          cy.intercept('PATCH', `**/api/v1/users/${ user.id }`).as('updateUser');
          cy.mockUser(user.id, user);

          cy.buttonClickOnTable(breakpoints, user.displayName, 'app-table-master-row', 'app-table-detail-row', 'edit',
            breakpointToButtons(breakpoints, ['analytics', 'today', 'delete'], ['account_circle'], value.otherButtons));
          cy.wait('@getUser');

          cy.get('.app-surface-eyebrow').contains('Update user');
          cy.get('.app-crud-title').contains(value.displayName);
          cy.get('[data-cy="email-input"]').should('have.value', user.email);
          cy.get('[data-cy="displayName-input"]').should('have.value', user.displayName);
          cy.get('#select-lang').contains('English');
          cy.get('input[formControlName="numberControl"]').should('have.value', user.phone);

          if (user.dob) {
            const dob = new Date(user.dob);
            const formattedDob = dob.toLocaleDateString(DEFAULT_LOCALE);
            cy.get('[data-cy="dob-picker"]').should('have.value', formattedDob);
          }

          const phone = '+31 6 25251524';
          cy.formControlType('email', `${ role }@email.com`);
          cy.selectOption('select-lang', 'Español');
          cy.formControlType('displayName', `${ role } Name`);
          cy.get('#phone').find('input').clear().type(phone);
          cy.get('[data-cy="dob-picker"]').clear().click({ force: true });
          cy.get('td[data-mat-row="1"][data-mat-col="1"]').find('button').click({ force: true });
          cy.wait(50);
          cy.get('td[data-mat-row="1"][data-mat-col="1"]').find('button').click({ force: true });
          cy.wait(50);
          cy.get('td[data-mat-row="1"][data-mat-col="1"]').find('button').click({ force: true });
          cy.wait(50);

          cy.get('button[type="submit"]').click({ force: true });

          cy.wait('@updateUser').then(userData => {
            const body = userData.request.body;
            expect(body.email).to.eq(`${ role }@email.com`);
            expect(body.displayName).to.eq(`${ role } Name`);
            expect(body.locale).to.eq('es');
            expect(body.phone).to.eq(phone);
            expect(body.dob).to.be.ok;
          });

          cy.url().should('include', '/users');
        });
      });
    });

    afterEach(() => cy.logout());
  });
});

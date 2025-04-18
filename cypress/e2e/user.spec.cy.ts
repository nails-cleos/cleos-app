import '../support/commands';
import { breakpointToButtons, devices } from '../support/utils';

const mapRole = new Map([
  ['Customer', { url: 'customers', displayName: 'Customer 1', otherButtons: [] }],
  ['Professional', { url: 'professionals', displayName: 'Nails Cleos', otherButtons: ['merge'] }],
  ['Manager', { url: 'offices/managers', displayName: 'Nails Cleos', otherButtons: ['merge'] }],
]);

devices.forEach(({ name, width, height, breakpoints }) => {
  describe(`Users with ${ name }`, () => {
    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      const email = 'nails.cleos@gmail.com';
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.visit('en-GB/dashboard');
      cy.mockFirebaseAppCheck();
      cy.mockNotifications();
      cy.mockAdminDashboard(new Date(), 'CLEOS');
    });

    mapRole.forEach((value, role) => {
      it(`should create a new ${ role }`, () => {
        cy.intercept('POST', `**/api/v1/${ value.url }`, (req) => req.alias = 'saveUser');

        cy.openMenu(breakpoints, ['App settings', 'Users']);
        cy.mockUsers(0);
        cy.wait('@getUsers');
        cy.get('tr').contains('No users');
        cy.get('button[id="add-button"]').click({ force: true });
        cy.get('mat-card-title').contains('Add user');
        cy.selectOption('select-role', role);

        cy.formControlType('email', `${ role }@email.com`);
        cy.selectOption('select-lang', 'English');
        cy.formControlType('displayName', `${ role } Name`);

        cy.get('#phone').should('be.visible');
        cy.get('#phone').type('+310625250787');

        cy.get('input[formControlName="dob"]').click({ force: true });
        cy.get('.mat-calendar-previous-button').click({ force: true });
        cy.get('td[data-mat-row="1"][data-mat-col="1"]').find('button').click({ force: true });
        cy.get('td[data-mat-row="1"][data-mat-col="1"]').find('button').click({ force: true });
        cy.get('td[data-mat-row="1"][data-mat-col="1"]').find('button').click({ force: true });

        if (role !== 'Customer') {
          cy.get('#darkColorIcon').click({ force: true });
          cy.get('input[formControlName="darkColor"]').clear().type('#0f0');
          cy.get('#lightColorIcon').click({ force: true });
          cy.get('input[formControlName="lightColor"]').clear().type('#00f');
        }

        cy.get('button[type="submit"]').click({ force: true });

        cy.wait('@saveUser').then(userData => {
          const body = userData.request.body;
          expect(body.email).to.eq(`${ role }@email.com`);
          expect(body.displayName).to.eq(`${ role } Name`);
          expect(body.lang).to.eq('en_GB');
          expect(body.phone).to.eq('+31 6 25250787');
          expect(body.dob).to.be.ok;
          if (role !== 'Customer') {
            expect(body.darkColor).to.eq('#00ff00');
            expect(body.lightColor).to.eq('#0000ff');
          }
        });

        cy.url().should('include', '/users/add');
      });

      it(`should edit a ${ role }`, () => {
        cy.openMenu(breakpoints, ['App settings', 'Users']);
        cy.mockUsers(undefined, value.displayName);
        cy.wait('@getUsers');

        cy.get('@selectedUser').then((user: any) => {
          cy.intercept('PATCH', `**/api/v1/users/${ user.id }`, (req) => req.alias = 'updateUser');
          cy.mockUser(user.id, user);

          cy.buttonClickOnTable(breakpoints, user.displayName, 'user-row', 'user-detail-row.user-expanded-row', 'edit',
            breakpointToButtons(breakpoints, ['analytics', 'today', 'delete'], ['account_circle'], value.otherButtons));
          cy.wait('@getUser');

          cy.get('mat-card-title').contains('Update user');
          cy.get('mat-card-subtitle').contains(value.displayName);
          cy.get('input[formControlName="email"]').should('have.value', user.email);
          cy.get('input[formControlName="displayName"]').should('have.value', user.displayName);
          cy.get('#select-lang').contains('English');
          cy.get('input[formControlName="numberControl"]').should('have.value', user.phone);

          if (user.dob) {
            const dob = new Date(user.dob);
            const formattedDob = dob.toLocaleDateString('en-GB');
            cy.get('input[formControlName="dob"]').should('have.value', formattedDob);
          }

          const phone = '+31 6 25251524';
          cy.formControlType('email', `${ role }@email.com`);
          cy.selectOption('select-lang', 'Spanish');
          cy.formControlType('displayName', `${ role } Name`);
          cy.get('#phone').find('input').clear().type(phone);
          cy.get('input[formControlName="dob"]').clear().click({ force: true });
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
            expect(body.lang).to.eq('es');
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

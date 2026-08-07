import '../support/commands';
import { breakpointToButtons, devices } from '../support/utils';
import { DEFAULT_LOCALE } from '@app/util/dates';

devices.forEach(({ name, width, height, breakpoints }) => {
  describe(`Currency with ${ name }`, () => {
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

    it('should create a new currency', () => {
      const code = 'USD';
      const name = 'US Dollar';
      const icon = 'attach_money';

      cy.mockCurrencyList(true, 0);
      cy.mockApi('POST', '**/api/v1/currency', {
        body: { name },
        alias: 'saveCurrency',
      });
      cy.intercept('POST', '**/api/v1/currency').as('saveCurrency');
      cy.openMenu(breakpoints, ['Admin settings', 'Currency']);
      cy.wait('@getCurrencyList');
      cy.contains('.no-content', 'No currency', { timeout: 15000 }).should('be.visible');
      cy.get('button[id="add-button"]').click({ force: true });
      cy.url().should('include', '/currency/add');
      cy.get('.app-surface-eyebrow').contains('Add currency');

      cy.formControlType('code', code);
      cy.formControlType('name', name);
      cy.selectOption('select-icon', icon);

      cy.get('button[type="submit"]').click({ force: true });

      cy.wait('@saveCurrency').then(currencyData => {
        const body = currencyData.request.body;
        expect(body.name).to.eq(name);
        expect(body.code).to.eq(code);
        expect(body.icon).to.eq(icon);

        cy.url().should('include', '/currency');
      });
    });

    it('should edit a currency', () => {
      cy.mockCurrencyList(true, undefined, 'e5fa4fd7-74bb-4a02-bf11-fc30ad9fb358');
      cy.openMenu(breakpoints, ['Admin settings', 'Currency']);
      cy.wait('@getCurrencyList');
      cy.get('.app-table-shell').should('be.visible');

      cy.get('@selectedCurrency').then((currency: any) => {
        // Updates
        const code = 'USD';
        const name = 'US Dollar';
        const icon = 'attach_money';

        cy.mockCurrency(currency.id, currency);
        cy.mockApi('PATCH', `**/api/v1/currency/${ currency.id }`, {
          body: { name },
          alias: 'updateCurrency',
        });
        cy.intercept('PATCH', `**/api/v1/currency/${ currency.id }`).as('updateCurrency');

        cy.buttonClickOnTable(breakpoints, currency.name, 'app-table-master-row', 'app-table-detail-row', 'edit',
          breakpointToButtons(breakpoints, ['delete']));
        cy.wait('@getCurrency');

        cy.get('.app-surface-eyebrow').contains('Update currency');
        cy.get('.app-crud-title').contains(currency.code);
        cy.get('[data-cy="name-input"]').should('have.value', currency.name);
        cy.get('[data-cy="code-input"]').should('have.value', currency.code);
        cy.get('#select-icon').contains(currency.icon);

        cy.formControlType('code', code);
        cy.formControlType('name', name);
        cy.selectOption('select-icon', icon);

        cy.get('button[type="submit"]').click({ force: true });

        cy.wait('@updateCurrency').then(currencyData => {
          const body = currencyData.request.body;
          expect(body.name).to.eq(name);
          expect(body.code).to.eq(code);
          expect(body.icon).to.eq(icon);
        });

        cy.url().should('include', '/currency');
      });
    });

    afterEach(() => cy.logout());
  });
});

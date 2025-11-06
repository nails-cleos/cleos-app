import '../support/commands';
import { breakpointToButtons, devices } from '../support/utils';

devices.forEach(({ name, width, height, breakpoints }) => {
  describe(`Currency with ${ name }`, () => {
    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      const email = 'nails.cleos@gmail.com';
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.visit('en-GB/dashboard');
      cy.mockFirebaseAppCheck();
      cy.mockNotifications();
      cy.mockAdminDashboard(new Date(), 'CLEOS');
    });

    it('should create a new currency', () => {
      cy.mockCurrencyList(true, 0);
      cy.intercept('POST', '**/api/v1/currency', (req) => req.alias = 'saveCurrency');
      cy.openMenu(breakpoints, ['Admin settings', 'Currency']);
      cy.wait('@getCurrencyList');
      cy.get('tr').contains('No currency');
      cy.get('button[id="add-button"]').click({ force: true });
      cy.url().should('include', '/currency/add');
      cy.get('mat-card-title').contains('Add currency');

      const code = 'USD';
      const name = 'US Dollar';
      const icon = 'attach_money';

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

      cy.get('@selectedCurrency').then((currency: any) => {
        cy.mockCurrency(currency.id, currency);
        cy.intercept('PATCH', `**/api/v1/currency/${ currency.id }`, (req) => req.alias = 'updateCurrency');

        cy.buttonClickOnTable(breakpoints, currency.name, 'row', 'detail-row', 'edit',
          breakpointToButtons(breakpoints, ['delete']));
        cy.wait('@getCurrency');

        cy.get('mat-card-title').contains('Update currency');
        cy.get('mat-card-subtitle').contains(currency.code);
        cy.get('input[formControlName="code"]').should('have.value', currency.code);
        cy.get('input[formControlName="name"]').should('have.value', currency.name);
        cy.get('#select-icon').contains(currency.icon);

        // Updates
        const code = 'USD';
        const name = 'US Dollar';
        const icon = 'attach_money';
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

import '../support/commands';
import { breakpointToButtons, devices } from '../support/utils';

devices.forEach(({ name, width, height, breakpoints }) => {
  describe(`Discount with ${name}`, () => {
    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      const email = 'nails.cleos@gmail.com';
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.mockNotifications();
      cy.mockCatalogues();
      cy.mockAdminDashboard(new Date(), 'CLEOS');
      cy.mockCurrencyList(false);

      cy.visit('en-GB/dashboard');
      cy.mockFirebaseAppCheck();
    });

    it('should create a new discount', () => {
      const discountName = 'Discount';

      cy.mockDiscounts(0);
      cy.mockApi('POST', '**/api/v1/discounts', {
        body: { name: discountName },
        alias: 'saveDiscounts',
      });
      cy.intercept('POST', '**/api/v1/discounts').as('saveDiscounts');
      cy.openMenu(breakpoints, ['Admin settings', 'Discounts']);
      cy.wait('@getDiscounts');
      cy.contains('.no-content', 'No discounts', { timeout: 15000 }).should('be.visible');
      cy.get('button[id="add-button"]').click({ force: true });
      cy.url().should('include', '/discounts/add');

      cy.wait('@getCurrencyList');
      cy.get('.app-surface-eyebrow').contains('Add discount');

      cy.get('#mat-input-0').click();
      cy.get('#mat-input-0').type(discountName);
      cy.get('#mat-input-3').click();
      cy.get('#mat-option-2').click();
      cy.get('#mat-input-1').click();
      cy.get('#mat-input-1').type(`${discountName} Description`);
      cy.get('#mat-select-value-0 span.mat-mdc-select-min-line').click();
      cy.get('#mat-option-0').click();
      cy.get('#mat-input-2').click();
      cy.get('#mat-input-2').clear();
      cy.get('#mat-input-2').type('10');

      cy.get('button[type="submit"]').click({ force: true });

      cy.wait('@saveDiscounts').then((discountData: any) => {
        const body = discountData.request.body;
        expect(body.name).to.eq(discountName);
        expect(body.description).to.eq(`${discountName} Description`);
        cy.url().should('include', '/discount');
      });
    });

    it('should update a discount', () => {
      cy.mockDiscounts(undefined, '09ae64ab-547d-43b4-8c7b-a5947296e207');
      cy.openMenu(breakpoints, ['Admin settings', 'Discounts']);
      cy.wait('@getDiscounts');
      cy.get('.app-table-shell').should('be.visible');

      cy.get('@selectedDiscount').then((discount: any) => {
        cy.mockDiscount(discount.id, discount).then(() => {
          const discountName = 'Update Discount';

          cy.mockApi('PATCH', `**/api/v1/discounts/${discount.id}`, {
            body: { name: discountName },
            alias: 'updateDiscount',
          });

          cy.buttonClickOnTable(breakpoints, discount.name, 'app-table-master-row', 'app-table-detail-row', 'edit',
            breakpointToButtons(breakpoints, ['delete']));

          cy.get('.app-surface-eyebrow').contains('Update discount');
          cy.get('.app-crud-title').contains(discount.name);
          cy.get('#mat-input-0').should('have.value', discount.name);
          cy.get('#mat-input-2').should('have.value', discount.amount);

          cy.get('#mat-input-0').clear();
          cy.get('#mat-input-0').type(discountName);
          cy.get('#mat-input-1').click();
          cy.get('#mat-input-1').clear();
          cy.get('#mat-input-1').type(`${discountName} Description`);
          cy.get('#mat-select-value-0').click();
          cy.get('#mat-option-0').click();
          cy.get('#mat-input-2').click();
          cy.get('#mat-input-2').clear();
          cy.get('#mat-input-2').type('15');
          cy.get('mat-form-field:nth-child(5) div.mat-mdc-form-field-bottom-align').click();

          cy.get('button[type="submit"]').click({ force: true });

          cy.wait('@updateDiscount').then((discountData: any) => {
            const body = discountData.request.body;
            expect(body.name).to.eq(discountName);
            expect(body.description).to.eq(`${discountName} Description`);
            expect(body.type).to.eq('MONEY');
            expect(body.amount).to.eq(15);
          });

          cy.url().should('include', '/discounts');
        });
      });
    });


    afterEach(() => cy.logout());
  });
});

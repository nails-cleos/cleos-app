import '../support/commands';
import { breakpointToButtons, devices } from '../support/utils';

devices.forEach(({ name, width, height, breakpoints }) => {
  describe(`Color with ${ name }`, () => {
    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      const email = 'nails.cleos@gmail.com';
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.mockNotifications();
      cy.mockCatalogues();
      cy.mockAdminDashboard(new Date(), 'CLEOS');

      cy.visit('en-GB/dashboard');
      cy.mockFirebaseAppCheck();
    });

    it('should create a new color', () => {
      const colorName = 'Color';
      cy.mockColors(true, 0);
      cy.mockAdditionalList(0);
      cy.mockApi('POST', '**/api/v1/colors', {
        body: { name: colorName },
        alias: 'saveColor',
      });
      cy.intercept('POST', '**/api/v1/colors').as('saveColor');
      cy.openMenu(breakpoints, ['App settings', 'Color']);
      cy.wait('@getColors');
      cy.get('tr').contains('No Color');
      cy.get('button[id="add-button"]').click({ force: true });
      cy.url().should('include', '/colors/add');
      cy.get('mat-card-title').contains('Add color');

      cy.formControlType('name', colorName);
      cy.formControlType('description', `${ colorName } Description`, 'textarea');

      cy.get('button[type="submit"]').click({ force: true });

      cy.wait('@saveColor').then(colorData => {
        const body = colorData.request.body;
        expect(body.name).to.eq(colorName);
        expect(body.description).to.eq(`${ colorName } Description`);

        cy.url().should('include', '/colors');
      });
    });

    it('should edit a color', () => {
      cy.mockColors(true, undefined, 'deb71da5-4ded-4e94-89c2-44036ea00451');
      cy.openMenu(breakpoints, ['App settings', 'Color']);
      cy.wait('@getColors');

      cy.get('@selectedColor').then((color: any) => {
        // Updates
        const colorName = 'New Color';

        cy.mockColor(color.id, color);
        cy.mockApi('PATCH', `**/api/v1/colors/${ color.id }`, {
          body: { name: colorName },
          alias: 'updateColor',
        });
        cy.intercept('PATCH', `**/api/v1/colors/${ color.id }`).as('updateColor');

        cy.buttonClickOnTable(breakpoints, color.name, 'row', 'detail-row', 'edit',
          breakpointToButtons(breakpoints, ['delete']));
        cy.wait('@getColor');

        cy.get('mat-card-title').contains('Update Color');
        cy.get('mat-card-subtitle').contains(color.name);
        cy.get('[data-cy="name-input"]').should('have.value', color.name);
        cy.get('[data-cy="description-textarea"]').should('have.value', color.description);

        cy.formControlType('name', colorName);
        cy.formControlType('description', `${ colorName } Description`, 'textarea');

        cy.get('button[type="submit"]').click({ force: true });

        cy.wait('@updateColor').then(colorData => {
          const body = colorData.request.body;
          expect(body.name).to.eq(colorName);
          expect(body.description).to.eq(`${ colorName } Description`);
        });

        cy.url().should('include', '/colors');
      });
    });

    afterEach(() => cy.logout());
  });
});

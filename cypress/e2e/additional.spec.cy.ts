import '../support/commands';
import { breakpointToButtons, devices, zeroPad } from '../support/utils';

devices.forEach(({ name, width, height, breakpoints }) => {
  describe(`Additional with ${name}`, () => {
    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      const email = 'nails.cleos@gmail.com';
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.visit('en-GB/dashboard');
      cy.mockFirebaseAppCheck();
      cy.mockNotifications();
      cy.mockAdminDashboard(new Date(), 'CLEOS');
      cy.mockTreatments(false);
    });

    it('should create a new additional', () => {
      cy.mockAdditionalList(0);
      cy.intercept('POST', '**/api/v1/additional', (req) => req.alias = 'saveAdditional');
      cy.openMenu(breakpoints, ['Additional', 'Additional']);
      cy.wait('@getAdditionalList');
      cy.get('tr').contains('No additional');
      cy.get('button[id="add-button"]').click({ force: true });
      cy.url().should('include', '/additional/add');

      cy.wait('@getTreatments');
      cy.get('mat-card-title').contains('Add additional');

      const additionalName = 'Additional';
      const hour = '00';
      const minute = '30';

      cy.formControlType('name', additionalName);
      cy.formControlType('description', `${additionalName} Description`, 'textarea');

      cy.get('[data-cy="duration-input"]').click({ force: true });
      cy.setTime(hour, minute);

      cy.selectChip('Biab Treatment');
      cy.selectChip('GelPolish');

      cy.get('button[type="submit"]').click({ force: true });

      cy.wait('@saveAdditional').then(additionalData => {
        const body = additionalData.request.body;
        expect(body.name).to.eq(additionalName);
        expect(body.description).to.eq(`${additionalName} Description`);
        expect(body.groupIds).to.have.deep
          .members(['9c44aaf0-82c0-4e09-a8f9-bcc915d23ed3', '62f3c0db-7545-4afe-8238-08fac393dcf4']);
        expect(body.duration).to.eq(`${zeroPad(hour)}:${zeroPad(minute)}`);
        cy.url().should('include', '/additional');
      });
    });

    it('should edit an additional', () => {
      cy.mockAdditionalList(undefined, 'f78de201-b4dc-457d-9da4-1e8a5e45688a');
      cy.openMenu(breakpoints, ['Additional', 'Additional']);
      cy.wait('@getAdditionalList');

      cy.get('@selectedAdditional').then((additional: any) => {
        cy.mockAdditional(additional.id, additional).then(() => {
          cy.intercept('PATCH', `**/api/v1/additional/${additional.id}`, (req) => req.alias = 'updateAdditional');

          cy.buttonClickOnTable(breakpoints, additional.name, 'row', 'detail-row', 'edit',
            breakpointToButtons(breakpoints, ['delete']));
          cy.wait('@getAdditional');
          cy.wait('@getTreatments');

          cy.get('mat-card-title').contains('Update additional');
          cy.get('mat-card-subtitle').contains(additional.name);
          cy.get('[data-cy="name-input"]').should('have.value', additional.name);
          cy.get('[data-cy="description-textarea"]').should('have.value', additional.description);
          cy.get('[data-cy="duration-input"]').should('have.value', additional.duration.slice(0, 5));

          additional.groups.forEach((groups: any) => {
            cy.get('mat-chip-row').contains(groups.name).scrollIntoView().should('be.visible');
          });

          // Updates
          const additionalName = 'Additional Group';
          const hour = '00';
          const minute = '30';
          cy.formControlType('name', additionalName);
          cy.formControlType('description', `${additionalName} Description`, 'textarea');
          cy.get('[data-cy="duration-input"]').click({ force: true });
          cy.setTime(hour, minute);

          // Remove one treatment group
          cy.get('mat-chip-row').filter(':contains("GelPolish")').find('mat-icon').contains('cancel').click();
          cy.get('mat-chip-row').contains('GelPolish').should('not.exist');

          cy.get('button[type="submit"]').click({ force: true });

          cy.wait('@updateAdditional').then(additionalData => {
            const body = additionalData.request.body;
            expect(body.name).to.eq(additionalName);
            expect(body.description).to.eq(`${additionalName} Description`);
            expect(body.duration).to.eq(`${zeroPad(hour)}:${zeroPad(minute)}`);
            const expectedGroupIds = additional.groups.filter((group: { name: string }) => group.name !== 'GelPolish')
              .map((group: { id: string }) => group.id);
            expect(body.groupIds).to.include.deep.members(expectedGroupIds);
          });

          cy.url().should('include', '/additional');
        });
      });
    });

    afterEach(() => cy.logout());
  });
});

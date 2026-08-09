import '../support/commands';
import { breakpointToButtons, devices, zeroPad } from '../support/utils';
import { DEFAULT_LOCALE } from '@app/util/dates';

devices.forEach(({ name, width, height, breakpoints }) => {
  describe(`Additional with ${name}`, () => {
    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      const email = 'nails.cleos@gmail.com';
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.mockNotifications();
      cy.mockCatalogues();
      cy.mockAdminDashboard(new Date(), 'CLEOS');
      cy.mockTreatments(false);

      cy.visit(`${DEFAULT_LOCALE}/dashboard`);
      cy.mockFirebaseAppCheck();
    });

    it('should create a new additional', () => {
      const additionalName = 'Additional';
      const hour = '00';
      const minute = '30';

      cy.mockAdditionalList(0);
      cy.mockApi('POST', '**/api/v1/additional', {
        body: { name: additionalName },
        alias: 'saveAdditional',
      });
      cy.intercept('POST', '**/api/v1/additional').as('saveAdditional');
      cy.openMenu(breakpoints, ['Additional', 'Additional']);
      cy.wait('@getAdditionalList');
      cy.contains('.no-content', 'No additional', { timeout: 15000 }).should(
        'be.visible',
      );
      cy.get('button[id="add-button"]').click({ force: true });
      cy.url().should('include', '/additional/add');

      cy.wait('@getTreatments');
      cy.get('.app-surface-eyebrow').contains('Add additional');

      cy.formControlType('name', additionalName);
      cy.formControlType(
        'description',
        `${additionalName} Description`,
        'textarea',
      );

      cy.get('[data-cy="duration-input"]').click({ force: true });
      cy.setTime(hour, minute);

      cy.selectChip('Biab Treatment');
      cy.selectChip('GelPolish');

      cy.get('button[type="submit"]').click({ force: true });

      cy.wait('@saveAdditional').then((additionalData) => {
        const body = additionalData.request.body;
        expect(body.name).to.eq(additionalName);
        expect(body.description).to.eq(`${additionalName} Description`);
        expect(body.groupIds).to.have.deep.members([
          '9c44aaf0-82c0-4e09-a8f9-bcc915d23ed3',
          '62f3c0db-7545-4afe-8238-08fac393dcf4',
        ]);
        expect(body.duration).to.eq(`${zeroPad(hour)}:${zeroPad(minute)}`);
        cy.url().should('include', '/additional');
      });
    });

    it('should edit an additional', () => {
      cy.mockAdditionalList(undefined, 'f78de201-b4dc-457d-9da4-1e8a5e45688a');
      cy.openMenu(breakpoints, ['Additional', 'Additional']);
      cy.wait('@getAdditionalList');
      cy.get('.app-table-shell').should('be.visible');

      cy.get('@selectedAdditional').then((additional: any) => {
        cy.mockAdditional(additional.id, additional).then(() => {
          // Updates
          const additionalName = 'Additional Group';
          const hour = '00';
          const minute = '30';

          cy.mockApi('PATCH', `**/api/v1/additional/${additional.id}`, {
            body: { name: additionalName },
            alias: 'updateAdditional',
          });
          cy.intercept('PATCH', `**/api/v1/additional/${additional.id}`).as(
            'updateAdditional',
          );

          cy.buttonClickOnTable(
            breakpoints,
            additional.name,
            'app-table-master-row',
            'app-table-detail-row',
            'edit',
            breakpointToButtons(breakpoints, ['delete']),
          );
          cy.wait('@getAdditional');
          cy.wait('@getTreatments');

          cy.get('.app-surface-eyebrow').contains('Update additional');
          cy.get('.app-crud-title').contains(additional.name);
          cy.get('[data-cy="name-input"]').should(
            'have.value',
            additional.name,
          );
          cy.get('[data-cy="description-textarea"]').should(
            'have.value',
            additional.description,
          );
          cy.get('[data-cy="duration-input"]').should(
            'have.value',
            additional.duration.slice(0, 5),
          );

          additional.groups.forEach((group: any) => {
            cy.get('mat-chip-row')
              .contains(group.name)
              .then(($chip) => {
                cy.wrap($chip).scrollIntoView();

                cy.wrap($chip).should('be.visible');
              });
          });

          cy.formControlType('name', additionalName);
          cy.formControlType(
            'description',
            `${additionalName} Description`,
            'textarea',
          );
          cy.get('[data-cy="duration-input"]').click({ force: true });
          cy.setTime(hour, minute);

          // Remove one treatment group
          cy.get('mat-chip-row')
            .filter(':contains("GelPolish")')
            .find('mat-icon')
            .contains('cancel')
            .click();
          cy.get('mat-chip-row').contains('GelPolish').should('not.exist');

          cy.get('button[type="submit"]').click({ force: true });

          cy.wait('@updateAdditional').then((additionalData) => {
            const body = additionalData.request.body;
            expect(body.name).to.eq(additionalName);
            expect(body.description).to.eq(`${additionalName} Description`);
            expect(body.duration).to.eq(`${zeroPad(hour)}:${zeroPad(minute)}`);
            const expectedGroupIds = additional.groups
              .filter((group: { name: string }) => group.name !== 'GelPolish')
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

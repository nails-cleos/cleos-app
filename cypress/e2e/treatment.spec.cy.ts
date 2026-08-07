import '../support/commands';
import { breakpointToButtons, convertSecondsToTime, devices, zeroPad } from '../support/utils';
import { DEFAULT_LOCALE } from '@app/util/dates';

const getAddTreatmentInput = () =>
  cy.get('#add-treatment').scrollIntoView().should('exist').and('not.be.disabled');

devices.forEach(({ name, width, height, breakpoints }) => {
  describe(`Treatments with ${ name }`, () => {
    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      const email = 'nails.cleos@gmail.com';
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.mockNotifications();
      cy.mockCatalogues();
      cy.mockAdminDashboard(new Date(), 'CLEOS');
      cy.mockColors(false);

      cy.visit(`${DEFAULT_LOCALE}/dashboard`);
      cy.mockFirebaseAppCheck();
    });

    it('should create a new treatment', () => {
      const treatmentGroupName = 'Treatment Group';
      const priceFrom = 10.00;
      const treatments = [
        { name: 'Treatment 1', hour: '1', minute: 30 },
        { name: 'Treatment 2', hour: '2', minute: 45 },
        { name: 'Treatment 3', hour: '00', minute: 15 },
        { name: 'Treatment 4', hour: '3', minute: 0 },
      ];

      cy.mockTreatments(true, 0);
      cy.mockApi('POST', '**/api/v1/treatments', {
        body: { name: treatmentGroupName },
        alias: 'saveTreatment',
      });
      cy.intercept('POST', '**/api/v1/treatments').as('saveTreatment');
      cy.openMenu(breakpoints, ['Treatments', 'Treatments']);
      cy.wait('@getTreatments');
      cy.contains('.no-content', 'No treatments', { timeout: 15000 }).should('be.visible');
      cy.get('button[id="add-button"]').click({ force: true });
      cy.url().should('include', '/treatments/add');
      cy.wait('@getColors');
      cy.get('.app-surface-eyebrow').contains('Add treatment');

      cy.formControlType('name', treatmentGroupName);
      cy.formControlType('description', `${ treatmentGroupName } Description`, 'textarea');
      cy.formControlType('priceFrom', priceFrom);

      cy.selectChip('Demure');

      treatments.forEach((treatment) => {
        getAddTreatmentInput().clear({ force: true }).type(treatment.name, { force: true });
        cy.get('button[aria-label="Add treatment"]').click({ force: true });

        cy.get('mat-tab-body[aria-hidden="false"]').find('#treatment-description').scrollIntoView()
          .should('be.visible');
        cy.get('mat-tab-body[aria-hidden="false"]').find('#treatment-description').clear()
          .type(`${ treatment.name } Description`);

        cy.get('mat-tab-body[aria-hidden="false"]').find('#treatment-duration').click({ force: true });
        cy.setTime(treatment.hour, treatment.minute);
      });

      cy.get('button[type="submit"]').click({ force: true });

      cy.wait('@saveTreatment').then(treatmentData => {
        const body = treatmentData.request.body;
        expect(body.name).to.eq(treatmentGroupName);
        expect(body.description).to.eq(`${ treatmentGroupName } Description`);
        expect(body.priceFrom).to.eq(priceFrom);
        expect(body.colorIds).to.have.deep.members(['03336843-10cd-4139-888f-77c9499fde6b']);
        treatments.forEach((treatment, index) => {
          expect(body.treatments[index].primary).to.eq(index === 0);
          expect(body.treatments[index].name).to.eq(treatment.name);
          expect(body.treatments[index].description).to.eq(`${ treatment.name } Description`);
          expect(body.treatments[index].time).to.eq(`${ zeroPad(treatment.hour) }:${ zeroPad(treatment.minute) }`);
          expect(body.treatments[index].order).to.eq(index);
        });

        cy.url().should('include', '/treatments');
      });
    });

    it('should edit a treatment', () => {
      cy.mockTreatments(true, undefined, '9c44aaf0-82c0-4e09-a8f9-bcc915d23ed3');
      cy.openMenu(breakpoints, ['Treatments', 'Treatments']);
      cy.wait('@getTreatments');
      cy.get('.app-table-shell').should('be.visible');

      cy.get('@selectedTreatment').then((treatment: any) => {
        // Updates
        const treatmentGroupName = 'Treatment Group';
        const priceFrom = 80.00;

        cy.mockTreatment(treatment.id, treatment);
        cy.mockApi('PATCH', `**/api/v1/treatments/${ treatment.id }`, {
          body: { name: treatmentGroupName },
          alias: 'updateTreatment',
        });

        cy.buttonClickOnTable(breakpoints, treatment.name, 'app-table-master-row', 'app-table-detail-row', 'edit',
          breakpointToButtons(breakpoints, ['visibility', 'sort', 'delete']));
        cy.wait('@getColors');
        cy.wait('@getTreatment');

        cy.get('.app-surface-eyebrow').contains('Update treatments');
        cy.get('.app-crud-title').contains(treatment.name);
        cy.get('[data-cy="name-input"]').should('have.value', treatment.name);
        cy.get('[data-cy="description-textarea"]').should('have.value', treatment.description);
        cy.get('[data-cy="priceFrom-input"]').should('have.value', treatment.priceFrom);

        treatment.colors.forEach((color: any) => {
          cy.get('mat-chip-row').contains(color.name).scrollIntoView().should('be.visible');
        });

        treatment.treatments.forEach((treatment: any) => {
          cy.get('.mat-mdc-tab').contains(treatment.name).click({ force: true });
          cy.get('mat-tab-body[aria-hidden="false"]').find('#treatment-name').should('have.value', treatment.name);
          cy.get('mat-tab-body[aria-hidden="false"]').find('#treatment-description')
            .should('have.value', treatment.description);
        });

        cy.formControlType('name', treatmentGroupName);
        cy.formControlType('description', `${ treatmentGroupName } Description`, 'textarea');
        cy.formControlType('priceFrom', priceFrom);

        // Remove one color
        cy.get('mat-chip-row').filter(':contains("Jolie")').find('[matChipRemove]').click({ force: true });
        cy.get('mat-chip-row').contains('Jolie ').should('not.exist');

        // Remove one treatment
        cy.get('.mat-mdc-tab').contains('Biab Removal Basic ').click({ force: true });
        cy.get('mat-tab-body[aria-hidden="false"]').find('button').contains('delete').click();

        // Add a new treatment
        const newTreatment = {
          name: 'New Treatment',
          hour: '1',
          minute: 0,
        };
        const newTreatmentExpected = {
          name: newTreatment.name,
          primary: false,
          description: `${ newTreatment.name } Description`,
          errors: {},
          time: `${ zeroPad(newTreatment.hour) }:${ zeroPad(newTreatment.minute) }`,
          order: treatment.treatments.length - 1,
        };
        getAddTreatmentInput().clear({ force: true }).type(newTreatment.name, { force: true });
        cy.get('button[aria-label="Add treatment"]').click({ force: true });

        cy.get('mat-tab-body[aria-hidden="false"]').find('#treatment-description').scrollIntoView()
          .should('be.visible');
        cy.get('mat-tab-body[aria-hidden="false"]').find('#treatment-description').clear()
          .type(`${ newTreatment.name } Description`);

        cy.get('mat-tab-body[aria-hidden="false"]').find('#treatment-duration').click({ force: true });
        cy.setTime(newTreatment.hour, newTreatment.minute);

        cy.get('button[type="submit"]').click({ force: true });

        cy.wait('@updateTreatment').then(treatmentData => {
          const body = treatmentData.request.body;
          expect(body.name).to.eq(treatmentGroupName);
          expect(body.description).to.eq(`${ treatmentGroupName } Description`);
          expect(body.priceFrom).to.eq(priceFrom);
          const expectedColorIds = treatment.colors.filter((color: { name: string }) => color.name !== 'Jolie ')
            .map((color: { id: string }) => color.id);
          expect(body.colorIds).to.include.deep.members(expectedColorIds);

          const currentTreatment = [...treatment.treatments.filter(
            (treatment: { name: string }) => treatment.name !== 'Biab Removal Basic ')
            .map((treatmentData: { order: number; duration: number; }, index: number) => ({
              ...treatmentData,
              order: index,
              time: convertSecondsToTime(treatmentData.duration),
              errors: {},
              primary: false,
            })), newTreatmentExpected];
          expect(body.treatments).to.have.deep.members(currentTreatment);
        });

        cy.url().should('include', '/treatments');
      });
    });

    afterEach(() => cy.logout());
  });
});

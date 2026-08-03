import '../support/commands';
import { devices } from '../support/utils';
import { DEFAULT_LOCALE } from '../../src/app/util/dates';

devices.forEach(({ name, width, height }) => {
  describe(`Me reservation flow  with ${ name }`, () => {
    const email = 'Kdvek@jevfm';
    const customerId = '1c27715c-21a3-4255-97ac-9263d9f177e7';
    const roomId = 'c18629ee-40c8-4bf4-b182-b2fea79dd881';
    const professionalId = '57ceebd2-a012-42a3-af9a-5d546c193200';
    const treatmentId = '34c3e5ff-b59c-41c1-9321-4d8a25a9fed1';
    const groupId = '9c44aaf0-82c0-4e09-a8f9-bcc915d23ed3';
    const reservationId = '0addd9e7-1bce-44a4-9ef1-18caeddfe8b1';

    const reservationDate = new Date();
    reservationDate.setMonth(reservationDate.getMonth() + 1, 1);

    const day = reservationDate.getDay();
    const diffToWednesday = (3 - day + 7) % 7 || 7;
    reservationDate.setDate(reservationDate.getDate() + diffToWednesday);
    reservationDate.setHours(13, 30, 0, 0);

    const formattedDate = reservationDate.toLocaleDateString(DEFAULT_LOCALE);

    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      cy.viewport(1512, 982);

      cy.mockAuthentication(email, 'ROLE_CUSTOMER');
      cy.mockNotifications();
      cy.mockCatalogues();
      cy.mockPaymentOptions();
      cy.mockMeReservationFlow(
        reservationId,
        reservationDate,
        customerId,
        roomId,
        professionalId,
        treatmentId,
        groupId,
      );

      cy.visit(`${DEFAULT_LOCALE}/me/reservation`);
      cy.mockFirebaseAppCheck();
    });

    it('should create a reservation from the customer flow', () => {
      cy.wait('@getPaymentOptions');
      cy.wait('@loadUpcoming');
      cy.wait('@getRooms');

      cy.contains('mat-form-field', 'Office').find('input').should('have.value', 'Nails Cleos');

      cy.get('button[name="toStepTwo"]').click({ force: true });

      cy.wait('@getTreatments');
      cy.get('[data-cy="date-picker"]').click({ force: true });
      cy.get('.mat-calendar-next-button').click({ force: true });

      cy.wait(50);
      cy.get(`button[aria-label="${ formattedDate }"]`).click({ force: true });

      cy.get('[data-cy="group-input"]').click({ force: true });
      cy.contains('mat-option', 'Biab Treatment').click({ force: true });

      cy.get('[data-cy="treatment-input"]').click({ force: true });
      cy.contains('mat-option', 'Biab + Single Color').click({ force: true });

      cy.get('[data-cy="date-picker"]').should('have.value', formattedDate);
      cy.get('[data-cy="group-input"]').should('have.value', 'Biab Treatment ');
      cy.get('[data-cy="treatment-input"]').should('have.value', 'Biab + Single Color ');

      cy.get('button[name="toStepThree"]').click({ force: true });

      cy.wait('@getAdditional').its('response.statusCode').should('eq', 200);

      cy.contains('mat-list-option', 'Biab Removal').click({ force: true });
      cy.get('button[name="toStepFour"]').click({ force: true });

      cy.wait('@searchCustomerReservation');

      cy.contains('.availability-grid button', '13:30').click({ force: true });
      cy.get('button[name="toStepFive"]').click({ force: true });

      cy.contains('.step-heading h2', 'Booking summary').should('exist');
      cy.contains('.booking-summary__price', '€ 90.00').should('exist');
      cy.get('mat-checkbox').contains('Accept').click({ force: true });

      cy.get('button[name="create"]').click({ force: true });

      cy.wait('@createReservation').then(({ request, response }) => {
        expect(response?.statusCode).to.eq(201);
        expect(request.body.customerId).to.eq(customerId);
        expect(request.body.roomId).to.eq(roomId);
        expect(request.body.professionalId).to.eq(professionalId);
        expect(request.body.treatmentId).to.eq(treatmentId);
        expect(request.body.additionalIds).to.deep.eq(['397bce4b-27ba-459f-801a-dcceea330b8d']);
        expect(request.body.phone).to.eq('+31 6 25250787');
        expect(request.body.payment).to.eq(undefined);
      });

      cy.wait('@loadAllByCustomer');
      cy.url().should('include', '/me/reservations');
      cy.get('.upcoming-section').should('exist');
      cy.contains('.app-surface-eyebrow', reservationId).should('exist');
    });
  });

  describe(`Me reservation with ${ name }`, () => {
    const email = 'Kdvek@jevfm';
    const reservationId = '7de89ece-c39c-4f9f-99fe-fb6133315cab';
    const customerId = '1c27715c-21a3-4255-97ac-9263d9f177e7';
    const professionalId = '57ceebd2-a012-42a3-af9a-5d546c193200';
    const roomId = 'c18629ee-40c8-4bf4-b182-b2fea79dd881';
    const treatmentId = '34c3e5ff-b59c-41c1-9321-4d8a25a9fed1';
    const additionalIds = [
      '557c6520-035a-4b0a-9bd4-f2f1dce27f6d',
      '397bce4b-27ba-459f-801a-dcceea330b8d',
    ];

    beforeEach(() => cy.viewport(width, height));

    beforeEach(() => {
      const reservationDate = new Date();
      reservationDate.setDate(reservationDate.getDate() + 3);
      reservationDate.setHours(13, 30, 0, 0);

      cy.mockAuthentication(email, 'ROLE_CUSTOMER');
      cy.mockNotifications();
      cy.mockCatalogues();
      cy.mockMeReservations(
        reservationId,
        reservationDate,
        customerId,
        roomId,
        professionalId,
        treatmentId,
        additionalIds,
      );

      cy.visit(`${DEFAULT_LOCALE}/me/reservations`);
      cy.mockFirebaseAppCheck();
    });

    it('should render customer upcoming reservation and reservation list', () => {
      cy.wait('@loadAllByCustomer').its('response.statusCode').should('eq', 200);

      cy.get('.upcoming-section').should('exist').within(() => {
        cy.contains('.app-surface-eyebrow', '7de89ece-c39c-4f9f-99fe-fb6133315cab').should('exist');
        cy.contains('.app-surface-item__value', 'Nails Cleos').should('exist');
        cy.contains('.app-surface-item__value', 'Mock address').should('exist');
        cy.contains('.price-row', 'Biab + Single Color').should('contain.text', '€ 85.00');
        cy.contains('.price-row', 'Biab Removal').should('contain.text', '€ 5.00');
        cy.contains('.price-row', 'Powder').should('contain.text', '€ 15.00');
        cy.get('.price-row--total').should('contain.text', '€ 105.00');
        cy.contains('button', 'Edit').should('exist');
        cy.contains('button', 'View').should('exist');
      });

      cy.get('table').within(() => {
        cy.contains('td', 'Biab + Single Color').should('exist');
        cy.contains('td', 'APPROVED').should('not.exist');
        cy.contains('td', 'Approved').should('exist');
      });
    });

    it('should open reservation detail from customer reservation view', () => {
      cy.wait('@loadAllByCustomer');

      cy.get('.upcoming-section').contains('button', 'View').click({ force: true });

      cy.wait('@getReservation').its('response.statusCode').should('eq', 200);
      cy.wait('@getPayments').its('response.statusCode').should('eq', 204);
      cy.wait('@getHistory').its('response.statusCode').should('eq', 204);

      cy.url().should('include', '/reservation/7de89ece-c39c-4f9f-99fe-fb6133315cab');
      cy.get('.detail-shell').should('exist');
      cy.contains('.app-detail-title', 'Customer 1').should('exist');
      cy.contains('.app-detail-chip', 'Approved').should('exist');
      cy.contains('.app-surface-item__value', 'Biab + Single Color').should('exist');
      cy.contains('.app-surface-item__value', 'Nails Cleos').should('exist');
    });
  });
});

import '../support/commands';
import { breakpointToDays, devices, zeroPad } from '../support/utils';
import { DEFAULT_LOCALE } from '@app/util/dates';

devices.forEach(({ name, width, height, breakpoints }) => {
  const days = breakpointToDays('reservation', breakpoints);
  describe(`Reservation with ${ name }`, () => {
    beforeEach(() => cy.viewport(width, height));
    const email = 'nails.cleos@gmail.com';
    const customerId = '1c27715c-21a3-4255-97ac-9263d9f177e7';
    const customerName = 'Customer 1';
    const roomId = 'c18629ee-40c8-4bf4-b182-b2fea79dd881';
    const professionalId = '57ceebd2-a012-42a3-af9a-5d546c193200';
    const treatmentId = '34c3e5ff-b59c-41c1-9321-4d8a25a9fed1';
    const groupId = '9c44aaf0-82c0-4e09-a8f9-bcc915d23ed3';
    const hour = 13;
    const hourFormat = zeroPad(hour);
    const minute = 30;
    const minuteFormat = zeroPad(minute);
    const reservationTime = `${ hourFormat }:${ minuteFormat }`;

    const reservationDate = new Date();
    reservationDate.setMonth(reservationDate.getMonth() + 1, 1);

    // move to next Wednesday
    const day = reservationDate.getDay(); // 0 = Sun
    const diffToWednesday = (3 - day + 7) % 7 || 7;
    reservationDate.setDate(reservationDate.getDate() + diffToWednesday);
    beforeEach(() => {
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.mockNotifications();
      cy.mockCatalogues();
      cy.mockCustomersData(customerId, treatmentId);
      cy.mockRoomData(customerId);
      cy.mockSearch(customerId, roomId, groupId, professionalId, reservationDate, days);

      cy.visit(`${DEFAULT_LOCALE}/reservation`);
      cy.mockFirebaseAppCheck();
    });

    it('should create a reservation', () => {
      cy.wait('@getCustomers').its('response.statusCode').should('eq', 200);
      // Select a customer
      cy.get('input[name="customer"]').should('be.visible');
      cy.get('input[name="customer"]').type('c', { force: true });

      cy.get('mat-option').contains(customerName).should('be.visible');
      cy.get('mat-option').contains('Carla Lujan').should('be.visible');

      cy.get('mat-option').contains(customerName).click({ force: true });
      cy.get('button[name="toStepTwo"]').click({ force: true });

      cy.wait('@getRooms').its('response.statusCode').should('eq', 200);
      cy.wait('@getTreatmentSearch').its('response.statusCode').should('eq', 200);
      cy.get('button[name="toStepThree"]').click({ force: true });

      // Select treatment and date time
      const formattedDate = reservationDate.toLocaleDateString(DEFAULT_LOCALE);

      cy.get('[data-cy="date-picker"]').click({ force: true });
      cy.get('.mat-calendar-next-button').click({ force: true });

      cy.get(`button[aria-label="${ formattedDate }"]`)
        .should('be.visible')
        .click({ force: true });

      cy.get('[data-cy="start-picker"]').click({ force: true });
      cy.setTime(hourFormat, minuteFormat);

      cy.get('[data-cy="date-picker"]').should('have.value', formattedDate);
      cy.get('[data-cy="start-picker"]').should('have.value', reservationTime);
      cy.get('[data-cy="group-input"]').should('have.value', 'Biab Treatment ');
      cy.get('[data-cy="treatment-input"]').should('have.value', 'Biab + Single Color ');

      cy.get('button[name="toStepFour"]').click({ force: true });

      cy.wait('@getAdditionalSearch').its('response.statusCode').should('eq', 200);

      // Select additional
      cy.get('mat-list-option').contains('Powder').click({ force: true });
      cy.get('mat-list-option').contains('Powder').closest('mat-list-option').find('input[type="checkbox"]')
        .should('be.checked');
      cy.get('mat-list-option').contains('Biab Removal').closest('mat-list-option').find('input[type="checkbox"]')
        .should('be.checked');
      cy.get('mat-list-option').contains('GelPolish Removal').closest('mat-list-option').find('input[type="checkbox"]')
        .should('be.not.checked');
      cy.get('mat-list-option').contains('Removal from other salon').closest('mat-list-option')
        .find('input[type="checkbox"]').should('be.not.checked');

      cy.get('button[name="toStepFive"]').click({ force: true });

      // Configuration
      cy.get('button[name="toStepSix"]').click({ force: true });

      cy.wait('@searchReservations').its('response.statusCode').should('eq', 200);

      // Calendar
      cy.checkAppDialog('Update reservation',
        `Are you sure to change reservation to ${ formattedDate }, ${ reservationTime }:00?`, 'Yes');

      cy.wait(500);
      calendarExpectations(reservationTime)[days].forEach((events, dayIndex) => validateCalendar(dayIndex, events));

      cy.get('.booking-summary').within(() => {
        cy.contains('.summary-item__label', 'Customer').parent().should('contain.text', customerName);
        cy.contains('.summary-item__label', 'Room').parent().should('contain.text', 'Nails Cleos - EUR (€)');
        cy.contains('.summary-item__label', 'Professional').parent().should('contain.text', 'Nails Cleos');
        cy.contains('.summary-item__label', 'Treatment').parent().should('contain.text', 'Biab + Single Color');
        cy.contains('.summary-item__label', 'Additional').parent().should('contain.text', 'Biab Removal')
          .and('contain.text', 'Powder');
        cy.contains('.summary-item__label', 'Date & time').parent().should('contain.text', reservationTime);
        cy.contains('.price-row', 'Biab + Single Color').should('contain.text', '€ 85.00');
        cy.contains('.price-row', 'Biab Removal').should('contain.text', '€ 5.00');
        cy.contains('.price-row', 'Powder').should('contain.text', '€ 15.00');
        cy.contains('.price-row--total', 'Current total').should('contain.text', '€ 105.00');
      });

      cy.get('button[name="toStepSeven"]').click({ force: true });

      // Booking summary / preview
      cy.contains('.step-heading h2', 'Booking summary').should('exist');
      cy.contains('.support-card__header h3', 'Appointment').should('exist');
      cy.get('.support-card').contains('Appointment').parents('.support-card').within(() => {
        cy.contains('.info-item', customerName).should('exist');
        cy.contains('.info-item', 'Nails Cleos - EUR (€)').should('exist');
        cy.contains('.info-item', 'Nails Cleos').should('exist');
        cy.contains('.info-item', 'Biab + Single Color').should('exist');
        cy.contains('.info-item', 'Biab Removal').should('exist');
        cy.contains('.info-item', 'Powder').should('exist');
        cy.contains('.info-item', '02:00').should('exist');
        cy.contains('.info-item', 'Mock address').should('exist');
        cy.get('.booking-summary__slot').should('contain.text', reservationTime)
          .and('contain.text', `${ zeroPad(hour) }:${ minuteFormat }`);
      });

      cy.contains('.support-card__header h3', 'Price').should('exist');
      cy.get('.support-card').contains('Price').parents('.support-card').within(() => {
        cy.contains('.price-row', 'Biab + Single Color').should('contain.text', '€ 85.00');
        cy.contains('.price-row', 'Biab Removal').should('contain.text', '€ 5.00');
        cy.contains('.price-row', 'Powder').should('contain.text', '€ 15.00');
        cy.contains('.price-row--total', 'Total').should('contain.text', '€ 105.00');
      });

      reservationDate.setHours(hour, minute, 0, 0);
      cy.randomUUID().then(reservationId => {
        cy.mockCreateReservation(reservationId, customerId, reservationDate, professionalId, roomId, treatmentId,
          ['397bce4b-27ba-459f-801a-dcceea330b8d', '557c6520-035a-4b0a-9bd4-f2f1dce27f6d']);

        cy.get('button[name="create"]').click({ force: true });

        cy.wait('@createReservation').then(reservationData => {
          expect(reservationData.response?.statusCode).to.eq(201);
          const body = reservationData.request.body;
          expect(body.customerId).to.eq(customerId);
          expect(body.start).to.eq(reservationDate.toLocaleString(DEFAULT_LOCALE));
          expect(body.timeZone).to.eq('Europe/Amsterdam');
          expect(body.additionalIds).to.have
            .members(['557c6520-035a-4b0a-9bd4-f2f1dce27f6d', '397bce4b-27ba-459f-801a-dcceea330b8d']);
          expect(body.canCustomerChange).to.eq(false);
          expect([null, undefined]).to.include(body.reference);
          expect([null, undefined]).to.include(body.note);
          expect([null, undefined]).to.include(body.payment);
          expect(body.treatmentId).to.eq(treatmentId);
          expect(body.roomId).to.eq(roomId);
          expect(body.professionalId).to.eq(professionalId);
          expect([null, undefined]).to.include(body.discountId);
        });

        cy.url().should('include', `reservation/${ reservationId }`);
        cy.wait('@getReservation').its('response.statusCode').should('eq', 200);
        cy.wait('@getPayments').its('response.statusCode').should('eq', 204);
        cy.wait('@getHistory').its('response.statusCode').should('eq', 204);
      });
    });

    afterEach(() => cy.logout());
  });
});

const dailyCheck = { text: '16:45 - 17:15', length: 1 };

const defaultEvents = [{ text: 'Out of work', length: 2 }, { text: 'Lunch time', length: 1 }, dailyCheck];

const wednesday = (reservationTime: string) => [
  ...defaultEvents,
  { text: '10:00 - 11:30', length: 1 },
  { text: '15:30 - 17:00', length: 1 },
  { text: `${ reservationTime } - 15:30`, length: 1 },
];
const thursday = [{ text: 'All day', length: 1 }];
const weekend = [{ text: 'Out of work', length: 1 }];

const monday = defaultEvents;
const tuesday = defaultEvents;
const friday = [...defaultEvents, { text: '10:00 - 10:30', length: 1 }, { text: '17:30 - 18:30', length: 1 }];

const calendarExpectations = (reservationTime: string): Record<number, { text: string, length: number }[][]> => ({
  3: [tuesday, wednesday(reservationTime), thursday],
  7: [weekend, monday, tuesday, wednesday(reservationTime), thursday, friday, weekend],
});

const validateCalendar = (day: number, events: { text: string, length: number }[]) => {
  cy.get('mwl-calendar-week-view').find('.cal-day-column').eq(day).find('mwl-calendar-week-view-event')
    .then(eventsList => {
      events.forEach(
        event => cy.wrap(eventsList).filter(`:contains("${ event.text }")`).should('have.length', event.length));
    });
};

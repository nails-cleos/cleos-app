import '../support/commands';
import { breakpointToDays, devices, zeroPad } from "../support/utils";
import { API_LOCALE } from "../../src/app/util/dates";

devices.forEach(({ name, width, height, breakpoints }) => {
  const days = breakpointToDays('reservation', breakpoints);
  describe(`Reservation with ${ name }`, () => {
    beforeEach(() => cy.viewport(width, height));
    const email = 'nails.cleos@gmail.com';
    const customerId = '1c27715c-21a3-4255-97ac-9263d9f177e7';
    const customerName = 'Customer 1'
    const roomId = 'c18629ee-40c8-4bf4-b182-b2fea79dd881';
    const professionalId = '57ceebd2-a012-42a3-af9a-5d546c193200';
    const treatmentId = '34c3e5ff-b59c-41c1-9321-4d8a25a9fed1';
    const groupId = '9c44aaf0-82c0-4e09-a8f9-bcc915d23ed3';
    const hour = 13;
    const hourFormat = zeroPad(hour);
    const minute = 30;
    const minuteFormat = zeroPad(minute);
    const reservationTime = `${ hourFormat }:${ minuteFormat }`;
    beforeEach(() => {
      cy.mockAuthentication(email, 'ROLE_ADMIN');
      cy.visit('en-GB/reservation');
      cy.mockFirebaseAppCheck();
      cy.mockNotifications();
      cy.mockCustomersData(customerId, treatmentId);
      cy.mockRoomData(customerId);
      cy.mockTreatments(customerId, roomId, groupId);
    });

    it('should create a reservation', () => {
      cy.wait('@getCustomers').its('response.statusCode').should('eq', 200);
      // Select a customer
      cy.get('input[name="customer"]').should('be.visible');
      cy.get('input[name="customer"]').type("c");

      cy.get('mat-option').contains(customerName).should('be.visible');
      cy.get('mat-option').contains('Carla Lujan').should('be.visible');

      cy.get('mat-option').contains(customerName).click();
      cy.get('button[name="toStepTwo"]').click();

      cy.wait('@getRooms').its('response.statusCode').should('eq', 200);
      cy.wait('@getTreatments').its('response.statusCode').should('eq', 200);

      // Select treatment and date time
      const reservationDate = new Date();
      reservationDate.setMonth(reservationDate.getMonth() + 1);
      reservationDate.setDate(15);
      // Next Wednesday
      reservationDate.setDate(reservationDate.getDate() + ((10 - reservationDate.getDay()) % 7 || 7));

      cy.mockSearch(roomId, professionalId, reservationDate, days);

      const formattedDate = reservationDate.toLocaleDateString('en-GB');

      cy.get('input[formControlName="date"]').click({ force: true });
      cy.get('.mat-calendar-next-button').click();

      cy.get(`button[aria-label="${ formattedDate }"]`).click();

      cy.get('input[formControlName="start"]').click({ force: true });
      cy.get('ngx-material-timepicker-content').contains(hourFormat).click();
      cy.get('ngx-material-timepicker-content').contains(minuteFormat).click();
      cy.get('.timepicker-button').contains('Ok').click();

      cy.get('input[formControlName="date"]').should('have.value', formattedDate);
      cy.get('input[formControlName="start"]').should('have.value', reservationTime);
      cy.get('input[formControlName="group"]').should('have.value', 'Biab Treatment ');
      cy.get('input[formControlName="treatment"]').should('have.value', 'Biab + Single Color ');

      cy.get('button[name="toStepFour"]').click({ force: true });

      cy.wait('@getAdditional').its('response.statusCode').should('eq', 200);

      // Select additional
      cy.get('mat-list-option').contains('Powder').click();
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

      cy.wait(50);
      calendarExpectations(reservationTime)[days].forEach((events, dayIndex) => validateCalendar(dayIndex, events));
      cy.get('button[name="toStepSeven"]').click();

      // Preview
      cy.get('mat-card-title').contains('Preview').should('exist');
      cy.checkMatList('Customer', 'wash', customerName);

      cy.get('div[mat-subheader]').contains('Room').should('exist');
      cy.checkMatList('Name', 'store', 'Nails Cleos - EUR (€)');
      cy.checkMatList('Professional', 'person_pin', 'Nails Cleos');
      cy.checkMatList('Address', 'room', 'Mock address');

      cy.get('div[mat-subheader]').contains('Treatment').should('exist');
      cy.checkMatList('Name', 'spa', 'Biab + Single Color');
      cy.checkMatList('Duration', 'timer', '01:30');
      cy.checkMatList('Price', 'euro', '85.00');

      cy.get('div[mat-subheader]').contains('Additional').should('exist');
      cy.checkMatList('Biab Removal', 'add_post', '€ 5.00', '⏲ 00:15');
      cy.checkMatList('Powder', 'add_post', '€ 5.00', '⏲ 00:15');

      cy.get('div[mat-subheader]').contains('Appointment').should('exist');
      cy.checkMatList(`${ formattedDate }, ${ reservationTime }`, 'spa',
        `${ formattedDate }, ${ zeroPad(hour + 2) }:${ minuteFormat }`);
      cy.checkMatList('Duration', 'timer', '02:00');
      cy.checkMatList('Total', 'euro', '105.00');

      reservationDate.setHours(hour, minute, 0, 0);
      cy.randomUUID().then(reservationId => {
        cy.mockCreateReservation(reservationId, customerId, reservationDate, professionalId, roomId, treatmentId,
          ['397bce4b-27ba-459f-801a-dcceea330b8d', '557c6520-035a-4b0a-9bd4-f2f1dce27f6d']);

        cy.get('button[name="create"]').click();

        cy.wait('@createReservation').then(reservationData => {
          expect(reservationData.response?.statusCode).to.eq(201);
          const body = reservationData.request.body;
          expect(body.customerId).to.eq(customerId);
          expect(body.start).to.eq(reservationDate.toLocaleString(API_LOCALE));
          expect(body.timeZone).to.eq('Europe/Amsterdam');
          expect(body.additionalIds).to.have
            .members(['557c6520-035a-4b0a-9bd4-f2f1dce27f6d', '397bce4b-27ba-459f-801a-dcceea330b8d']);
          expect(body.canCustomerChange).to.eq(null);
          expect(body.reference).to.eq(null);
          expect(body.note).to.eq(null);
          expect(body.payment).to.eq(undefined);
          expect(body.treatmentId).to.eq(treatmentId);
          expect(body.roomId).to.eq(roomId);
          expect(body.professionalId).to.eq(professionalId);
          expect(body.discountId).to.eq(undefined);
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
const thursday = [...defaultEvents, { text: 'All day', length: 1 }];
const weekend = [{ text: 'Out of work', length: 1 }, dailyCheck];

const monday = defaultEvents;
const tuesday = defaultEvents;
const friday = [...defaultEvents, { text: '10:00 - 10:30', length: 1 }, { text: '17:30 - 18:30', length: 1 }];

const calendarExpectations = (reservationTime: string): Record<number, { text: string, length: number }[][]> => ({
  3: [tuesday, wednesday(reservationTime), thursday],
  7: [weekend, monday, tuesday, wednesday(reservationTime), thursday, friday, weekend]
});

const validateCalendar = (day: number, events: { text: string, length: number }[]) => {
  cy.get('mwl-calendar-week-view').find('.cal-day-column').eq(day).find('mwl-calendar-week-view-event')
    .then(eventsList => {
      events.forEach(
        event => cy.wrap(eventsList).filter(`:contains("${ event.text }")`).should('have.length', event.length));
    });
};

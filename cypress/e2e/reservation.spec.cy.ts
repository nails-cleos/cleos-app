import '../support/commands';

describe('Reservation', () => {
  const email = 'nails.cleos@gmail.com';
  const customerId = '1c27715c-21a3-4255-97ac-9263d9f177e7';
  const customerName = 'Customer 1'
  const roomId = 'c18629ee-40c8-4bf4-b182-b2fea79dd881';
  const professionalId = '57ceebd2-a012-42a3-af9a-5d546c193200';
  const treatmentId = '34c3e5ff-b59c-41c1-9321-4d8a25a9fed1';
  const groupId = '9c44aaf0-82c0-4e09-a8f9-bcc915d23ed3';
  const hour = 13;
  const minute = 30;
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
    cy.get('button').contains('Next').click();

    cy.wait('@getRooms').its('response.statusCode').should('eq', 200);
    cy.wait('@getTreatments').its('response.statusCode').should('eq', 200);

    // Select treatment and date time
    const reservationDate = new Date();
    reservationDate.setMonth(reservationDate.getMonth() + 1);
    reservationDate.setDate(15);
    // Next Wednesday
    reservationDate.setDate(reservationDate.getDate() + ((10 - reservationDate.getDay()) % 7 || 7));

    cy.mockSearch(roomId, professionalId, reservationDate);

    const formattedDate = reservationDate.toLocaleDateString('en-GB');

    cy.get('input[formControlName="date"]').click();
    cy.get('.mat-calendar-next-button').click();

    cy.get(`button[aria-label="${ formattedDate }"]`).click();

    cy.get('input[formControlName="start"]').click();
    cy.get('ngx-material-timepicker-content').contains(`${ hour }`).click();
    cy.get('ngx-material-timepicker-content').contains(`${ minute }`).click();
    cy.get('.timepicker-button').contains('Ok').click();

    cy.get('input[formControlName="date"]').should('have.value', formattedDate);
    cy.get('input[formControlName="start"]').should('have.value', `${ hour }:${ minute }`);
    cy.get('input[formControlName="group"]').should('have.value', 'Biab Treatment ');
    cy.get('input[formControlName="treatment"]').should('have.value', 'Biab + Single Color ');

    cy.get('button[name="toStepFour"]').contains('Next').click();

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

    cy.get('button[name="toStepFive"]').contains('Next').click();

    // Configuration
    cy.get('button[name="toStepSix"]').contains('Next').click();

    cy.wait('@searchReservations').its('response.statusCode').should('eq', 200);

    // Calendar
    cy.checkAppDialog('Update reservation',
      `Are you sure to change reservation to ${ formattedDate }, ${ hour }:${ minute }:00?`, 'Yes');

    cy.wait(50);

    // Sunday
    validateCalendar(0, [{ text: 'Out of work', length: 1 }, { text: '16:45 - 17:15', length: 1 }]);
    // Monday
    validateCalendar(1, [
      { text: 'Out of work', length: 2 }, { text: 'Lunch time', length: 1 }, { text: '16:45 - 17:15', length: 1 }
    ]);
    // Tuesday
    validateCalendar(2, [
      { text: 'Out of work', length: 2 }, { text: 'Lunch time', length: 1 }, { text: '16:45 - 17:15', length: 1 }
    ]);
    // Wednesday
    validateCalendar(3, [
      { text: 'Out of work', length: 2 },
      { text: 'Lunch time', length: 1 },
      { text: '10:00 - 11:30', length: 1 },
      { text: '15:30 - 17:00', length: 1 },
      { text: `${ hour }:${ minute } - 15:30`, length: 1 },
      { text: '16:45 - 17:15', length: 1 }
    ]);
    // Thursday
    validateCalendar(4, [
      { text: 'Out of work', length: 2 },
      { text: 'Lunch time', length: 1 },
      { text: '16:45 - 17:15', length: 1 },
      { text: 'All day', length: 1 }
    ]);
    // Friday
    validateCalendar(5, [
      { text: 'Out of work', length: 2 },
      { text: 'Lunch time', length: 1 },
      { text: '10:00 - 10:30', length: 1 },
      { text: '17:30 - 18:30', length: 1 },
      { text: '16:45 - 17:15', length: 1 }
    ]);
    // Saturday
    validateCalendar(6, [{ text: 'Out of work', length: 1 }, { text: '16:45 - 17:15', length: 1 }]);

    cy.get('button[name="toStepSeven"]').contains('Next').click();

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
    cy.checkMatList(`${ formattedDate }, ${ hour }:${ minute }`, 'spa',
      `${ formattedDate }, ${ hour + 2 }:${ minute }`);
    cy.checkMatList('Duration', 'timer', '02:00');
    cy.checkMatList('Total', 'euro', '105.00');

    reservationDate.setHours(hour, minute);
    cy.randomUUID().then(reservationId => {
      cy.mockCreateReservation(reservationId, customerId, reservationDate, professionalId, roomId, treatmentId,
        ['397bce4b-27ba-459f-801a-dcceea330b8d', '557c6520-035a-4b0a-9bd4-f2f1dce27f6d']);

      cy.get('button[name="create"]').contains('Reserve').click();

      cy.wait('@createReservation').its('response.statusCode').should('eq', 201);

      cy.url().should('include', `reservation/${ reservationId }`);
      cy.wait('@getReservation').its('response.statusCode').should('eq', 200);
      cy.wait('@getPayments').its('response.statusCode').should('eq', 204);
      cy.wait('@getHistory').its('response.statusCode').should('eq', 204);

      cy.logout();
    });
  });
});

const validateCalendar = (day: number, events: { text: string, length: number }[]) => {
  cy.get('mwl-calendar-week-view').find('.cal-day-column').eq(day).find('mwl-calendar-week-view-event')
    .then(eventsList => {
      events.forEach(
        event => cy.wrap(eventsList).filter(`:contains("${ event.text }")`).should('have.length', event.length));
    });
};

import '../support/commands';

describe('Users', () => {
  const email = 'nails.cleos@gmail.com';

  beforeEach(() => {
    cy.mockAuthentication(email, 'ROLE_ADMIN');
    cy.visit('en-GB/users');
    cy.mockFirebaseAppCheck();
    cy.mockNotifications();
  });

  it('should create a new user', () => {

    cy.logout();
  });
});

describe('Basic tests', () => {
  it('Visits the homepage', () => {
    cy.viewport(390, 844);
    cy.on('uncaught:exception', (err, runnable) => {
      if (
        err.message.includes('Hydration failed') ||
        err.message.includes('There was an error while hydrating')
      ) {
        return false;
      }
      return true;
    });
    cy.visit('http://localhost:3000/');
  });
});

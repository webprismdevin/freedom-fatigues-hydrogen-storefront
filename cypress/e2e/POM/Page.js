import 'cypress-map';
import spok from 'cy-spok';
class Page {
  visitHomePage() {
    cy.visit('/');
  }
  VerifyHeroBtnisVisible() {
    cy.get('.text-right > .inline-block').should('be.visible');
  }
  clickHeroButton() {
    cy.get('.text-right > .inline-block').click({force: true});
  }
  VerifyURL(URL) {
    cy.url().should('equal', `${URL}`);
  }
  NewsLetterEmail(email) {
    cy.wait(3000);
    cy.get('[type="email"]').scrollIntoView();
    this.CloseNewsletter();
    cy.wait(3000);
    cy.get('.p-12:contains("Subscribe")')
      .find('[type="email"]')
      .first()
      .type(email);
  }
  SubmitNewsLetter() {
    cy.get('.border-b-white').find('[type="submit"]').click({force: true});
  }
  VerifyNewsLetterMessage() {
    cy.get('[action="/newsletter/subscribe"]')
      .find('p', {timeout: 20000})
      .contains('Thanks for subscribing!', {timeout: 10000});
  }
  CloseBtn() {
    cy.contains('.text-lg', 'close', {matchCase: false});
    // .should(()=>{}).then($closeBtn=>{
    //     if(!$closeBtn.length){
    //         cy.log('No CLose Button')
    //     }else{
    //         cy.wrap($closeBtn).click()
    //     }
    // })
  }

  CloseNewsletter() {
    cy.get('circle').click({force: true});
  }

  RandomEmail() {
    const uuid = () => Cypress._.random(0, 1e6);
    const id = uuid();
    const testname = `testname${id}@gmail.com`;
    return testname;
  }
  OpenMenuAndVerifylist() {
    cy.get('.h-nav > .justify-start > :nth-child(1)', {timeout: 10000}).click();
    cy.wait(3000);
    cy.get('nav.grid').within(() => {
      cy.get('div')
        .map('innerText')
        .should(
          spok([
            'Home',
            "Men's",
            "Women's",
            'Hats',
            'ACCESSORIES',
            'American Made',
            'Collaborations',
          ]),
        );
    });
  }

  ClickSearchBtn() {
    cy.get('form[action="/search"]:visible', {timeout: 10000}).click({
      force: true,
    });
  }
  SearchItem(item) {
    cy.get('[action="/search?q="]', {timeout: 10000}).type(item);
  }
  ClickGo() {
    cy.contains('[type="submit"]', 'go', {matchCase: false}).click({
      force: true,
    });
  }
  VerifySearchResult() {
    cy.get('section', {timeout: 10000})
      .find('.grid-flow-row > .flex')
      .should('be.visible');
  }
  ClickItem(index) {
    cy.get('section', {timeout: 10000})
      .find('.grid-flow-row > .flex')
      .should('be.visible')
      .eq(index)
      .click();
  }
  SelectSize(index) {
    cy.contains('.flex', 'size', {matchCase: false}).within(() => {
      cy.get('.flex').find('.max-w-prose').eq(index).click();
    });
  }
  ClickCheckout() {
    cy.contains('[type="submit"]', 'add to bag', {
      matchCase: false,
      timeout: 10000,
    })
      .should('be.visible')
      .click({force: true});
  }
  ContinueToCheckout() {
    cy.contains('.mt-2 > .inline-block', 'Continue to Checkout', {
      matchCase: false,
      timeout: 10000,
    })
      .should('be.visible')
      .click();
  }
}
export default Page;

import DataObject from './POM/Page'
const Page = new DataObject();

describe('Test cases for Freedom Fatigues', () => {
  beforeEach(() => {
    Page.visitHomePage() //Visit Homepage
  })

  it('Verify that it is clicking the hero butona and check URL', () => {
    Page.VerifyHeroBtnisVisible() // Checking the Hero Learn More button is visible
    Page.clickHeroButton() // clicking the Learn more button
    Page.VerifyURL('https://beta.freedomfatigues.com/pages/govx-id') // Verifying the URL
  })

  it('Submit News Letter', () => {
    Page.NewsLetterEmail(Page.RandomEmail())
    Page.SubmitNewsLetter()
    Page.VerifyNewsLetterMessage()
  })

  it('Open side menu and verify listig', () => {
    Page.OpenMenuAndVerifylist()

  })

  it('Search the item', () => {
    cy.visit('/search?q=')
    Page.ClickSearchBtn()
    cy.wait(2000)
    Page.SearchItem('Mens')
    Page.ClickGo()
    cy.wait(3000)
    Page.VerifySearchResult()

  })

  it('Search , Add to card and checkout ',()=>{
    cy.visit('/search?q=')
    Page.ClickSearchBtn()
    cy.wait(2000)
    Page.SearchItem('Mens')
    Page.ClickGo()
    Page.VerifySearchResult()

    //Open Product detail Page 
    Page.ClickItem(0)
    cy.wait(2000)
    Page.SelectSize(4)
    cy.wait(3000)
    Page.ClickCheckout()
    Page.ContinueToCheckout()

  })
  /*
  
  visits home
  - Selects the button in the hero & checks that page destination loads
  - submits a newsletter form
  - opens the mobile menu
  
  - searches a product from the search bar
  
  - visits product page
  - Selects a product & adds to cart
  - Initiates checkout
  */

})
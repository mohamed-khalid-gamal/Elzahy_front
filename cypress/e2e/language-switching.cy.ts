// E2E Test for Language Switching
// This is a basic test structure - adjust according to your E2E testing framework

describe('Language Switching', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/');
  });

  it('should switch language from English to Arabic', () => {
    // Check initial state (English)
    cy.get('html').should('have.attr', 'lang', 'en');
    cy.get('html').should('have.attr', 'dir', 'ltr');

    // Check if English text is displayed
    cy.contains('ELZAHY GROUP').should('be.visible');
    cy.contains('Home').should('be.visible');

    // Click language switcher
    cy.get('[data-cy="language-switcher"]').click();

    // Select Arabic
    cy.get('[data-cy="language-option-ar"]').click();

    // Verify language switch
    cy.get('html').should('have.attr', 'lang', 'ar');
    cy.get('html').should('have.attr', 'dir', 'rtl');

    // Check if Arabic text is displayed
    cy.contains('مجموعة الزاهي').should('be.visible');
    cy.contains('الرئيسية').should('be.visible');
  });

  it('should persist language selection across page reloads', () => {
    // Switch to Arabic
    cy.get('[data-cy="language-switcher"]').click();
    cy.get('[data-cy="language-option-ar"]').click();

    // Reload page
    cy.reload();

    // Verify Arabic is still selected
    cy.get('html').should('have.attr', 'lang', 'ar');
    cy.get('html').should('have.attr', 'dir', 'rtl');
    cy.contains('مجموعة الزاهي').should('be.visible');
  });

  it('should display correct meta titles for different languages', () => {
    // Check English meta title
    cy.title().should('contain', 'ELZAHY GROUP');

    // Switch to Arabic
    cy.get('[data-cy="language-switcher"]').click();
    cy.get('[data-cy="language-option-ar"]').click();

    // Check Arabic meta title (should be updated)
    cy.title().should('contain', 'مجموعة الزاهي');
  });

  it('should show correct RTL layout for Arabic', () => {
    // Switch to Arabic
    cy.get('[data-cy="language-switcher"]').click();
    cy.get('[data-cy="language-option-ar"]').click();

    // Check RTL specific styling
    cy.get('html[dir="rtl"]').should('exist');

    // Check text alignment (this would depend on your specific CSS)
    cy.get('.hero-section').should('have.css', 'text-align', 'right');
  });

  it('should format dates and numbers correctly for each locale', () => {
    // This test assumes you have dates/numbers displayed
    // You might need to navigate to a page that shows formatted data

    // In English
    cy.visit('/projects'); // or any page with dates/numbers
    // Check English formatting (this would be specific to your content)

    // Switch to Arabic
    cy.get('[data-cy="language-switcher"]').click();
    cy.get('[data-cy="language-option-ar"]').click();

    // Check Arabic formatting
    // This would test that dates/numbers are displayed in Arabic locale format
  });
});

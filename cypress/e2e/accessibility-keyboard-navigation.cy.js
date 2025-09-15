describe('Accessibility - Keyboard Navigation', () => {
  beforeEach(() => {
    // Visit the main library page
    cy.visit('/');
    
    // Wait for the page to load
    cy.get('[data-testid="music-library"]', { timeout: 10000 }).should('exist');
  });

  it('should navigate through filter controls with Tab key', () => {
    // Start from the search input
    cy.get('input[type="text"]').first().focus();
    
    // Tab through filter controls
    cy.focused().should('have.attr', 'role', 'searchbox');
    cy.focused().tab();
    
    // Check if we're on mood filter
    cy.focused().should('have.id', 'mood-filter');
    cy.focused().tab();
    
    // Check if we're on category filter
    cy.focused().should('have.id', 'category-filter');
    cy.focused().tab();
    
    // Check if we're on energy filter
    cy.focused().should('have.id', 'energy-filter');
  });

  it('should navigate through track cards with Tab key', () => {
    // Wait for tracks to load
    cy.get('[role="article"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    
    // Focus on the first track card's play button
    cy.get('[role="article"]').first().within(() => {
      cy.get('button[aria-label*="Play"]').first().focus();
    });
    
    // Tab through track card buttons
    cy.focused().should('have.attr', 'aria-label').and('include', 'Play');
    cy.focused().tab();
    
    // Should be on like button
    cy.focused().should('have.attr', 'aria-label').and('include', 'Like');
    cy.focused().tab();
    
    // Should be on playlist button
    cy.focused().should('have.attr', 'aria-label').and('include', 'Playlist');
    cy.focused().tab();
    
    // Should be on copy attribution button
    cy.focused().should('have.attr', 'aria-label').and('include', 'Copy attribution');
  });

  it('should activate buttons with Enter and Space keys', () => {
    // Wait for tracks to load
    cy.get('[role="article"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    
    // Focus on play button
    cy.get('[role="article"]').first().within(() => {
      cy.get('button[aria-label*="Play"]').first().focus();
    });
    
    // Press Enter to activate
    cy.focused().type('{enter}');
    
    // Check that the button state changed (aria-pressed or similar)
    cy.focused().should('have.attr', 'aria-pressed', 'true');
    
    // Press Space to toggle back
    cy.focused().type(' ');
    
    // Check that the button state changed back
    cy.focused().should('have.attr', 'aria-pressed', 'false');
  });

  it('should have visible focus indicators', () => {
    // Wait for tracks to load
    cy.get('[role="article"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    
    // Focus on a button
    cy.get('[role="article"]').first().within(() => {
      cy.get('button[aria-label*="Play"]').first().focus();
    });
    
    // Check that focus ring is visible
    cy.focused().should('have.class', 'focus:ring-2');
    cy.focused().should('have.class', 'focus:ring-blue-500');
  });

  it('should announce filter changes to screen readers', () => {
    // Check for live region
    cy.get('[aria-live="polite"]').should('exist');
    
    // Change a filter
    cy.get('#mood-filter').select('energetic');
    
    // Wait for filter to apply and check if live region gets updated
    cy.get('[aria-live="polite"]', { timeout: 3000 }).should('contain.text', 'tracks found');
  });

  it('should announce track playback changes to screen readers', () => {
    // Wait for tracks to load
    cy.get('[role="article"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    
    // Click play button
    cy.get('[role="article"]').first().within(() => {
      cy.get('button[aria-label*="Play"]').first().click();
    });
    
    // Check if live region announces playback
    cy.get('[aria-live="polite"]', { timeout: 2000 }).should('contain.text', 'playing');
  });

  it('should maintain logical tab order across components', () => {
    // Start from search input
    cy.get('input[type="text"]').first().focus();
    
    // Tab through all focusable elements and verify logical order
    const expectedOrder = [
      'searchbox',
      'mood-filter',
      'category-filter', 
      'energy-filter'
    ];
    
    expectedOrder.forEach((expectedId, index) => {
      if (expectedId === 'searchbox') {
        cy.focused().should('have.attr', 'role', 'searchbox');
      } else {
        cy.focused().should('have.id', expectedId);
      }
      
      if (index < expectedOrder.length - 1) {
        cy.focused().tab();
      }
    });
  });

  it('should handle Shift+Tab for reverse navigation', () => {
    // Start from a filter control
    cy.get('#energy-filter').focus();
    
    // Shift+Tab back to category filter
    cy.focused().type('{shift+tab}');
    cy.focused().should('have.id', 'category-filter');
    
    // Shift+Tab back to mood filter
    cy.focused().type('{shift+tab}');
    cy.focused().should('have.id', 'mood-filter');
    
    // Shift+Tab back to search
    cy.focused().type('{shift+tab}');
    cy.focused().should('have.attr', 'role', 'searchbox');
  });

  it('should skip disabled elements in tab order', () => {
    // If there are any disabled elements, they should not be focusable
    cy.get('[disabled]').should('not.be.focused');
    
    // All focusable elements should not have tabindex="-1" unless they're meant to be skipped
    cy.get('[tabindex="-1"]').should('not.be.focused');
  });

  it('should have proper ARIA labels on all interactive elements', () => {
    // Check that all buttons have aria-label or aria-labelledby
    cy.get('button').each(($button) => {
      cy.wrap($button).should('satisfy', ($el) => {
        const hasAriaLabel = $el.attr('aria-label');
        const hasAriaLabelledBy = $el.attr('aria-labelledby');
        const hasVisibleText = $el.text().trim().length > 0;
        
        return hasAriaLabel || hasAriaLabelledBy || hasVisibleText;
      });
    });
    
    // Check that all form controls have proper labels
    cy.get('input, select, textarea').each(($input) => {
      cy.wrap($input).should('satisfy', ($el) => {
        const hasAriaLabel = $el.attr('aria-label');
        const hasAriaLabelledBy = $el.attr('aria-labelledby');
        const hasAssociatedLabel = $el.attr('id') && cy.get(`label[for="${$el.attr('id')}"]`).length > 0;
        
        return hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel;
      });
    });
  });
});




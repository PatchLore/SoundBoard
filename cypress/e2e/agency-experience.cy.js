/// <reference types="cypress" />

const USER_KEY = 'stream_soundboard_user';

const agencyUser = {
  id: 'agency-1',
  email: 'agency@streamsoundboard.com',
  userType: 'agency',
  plan: 'small-agency',
  isAuthenticated: true,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

describe('Agency Experience', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(USER_KEY, JSON.stringify(agencyUser));
      }
    });

    cy.injectAxe && cy.injectAxe();
  });

  it('loads as an agency user', () => {
    // Header shows user and Agency Dashboard button should be visible
    cy.contains('Stream Soundboard').should('exist');
    cy.contains('Agency Dashboard').should('exist');
  });

  it('uploads a track', () => {
    // Navigate to admin/upload flow
    cy.get('[data-testid="admin-panel-button"]').click();
    cy.get('[data-testid="upload-track-button"]').click();

    // Fill out upload form
    cy.get('[data-testid="track-file-input"]').attachFile('test-track.mp3');
    cy.get('[data-testid="track-title-input"]').clear().type('My Test Track');
    cy.get('[data-testid="track-category-select"]').select('Chill Gaming');
    cy.get('[data-testid="upload-submit-button"]').click();

    // Validate success by seeing the new track in library or success text
    cy.contains(/upload complete|uploaded successfully/i).should('exist');
  });

  it('checks branding & analytics tabs', () => {
    cy.get('[data-testid="admin-panel-button"]').click();

    cy.get('[data-testid="branding-tab"]').click();
    cy.contains(/branding/i).should('exist');

    cy.get('[data-testid="analytics-tab"]').click();
    cy.contains(/analytics/i).should('exist');
  });

  it('checks accessibility on agency dashboard', () => {
    cy.checkA11y && cy.checkA11y();
  });
});











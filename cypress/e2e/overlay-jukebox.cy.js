/// <reference types="cypress" />

const USER_KEY = 'stream_soundboard_user';
const streamer = {
  id: 'demo-123',
  email: 'demo@streamsoundboard.com',
  userType: 'streamer',
  plan: 'pro',
  isAuthenticated: true,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

describe('Overlay Jukebox', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(USER_KEY, JSON.stringify(streamer));
      }
    });
    cy.injectAxe && cy.injectAxe();

    // Navigate via header button
    cy.contains('Overlay Jukebox').click();
    cy.contains('🎵 Music Jukebox').should('be.visible');
  });

  it('loads with overlay content visible', () => {
    cy.contains('Perfect background music for your stream').should('be.visible');
  });

  it('can start and stop playback using the toggle button', () => {
    cy.contains('Play').click();
    cy.contains('Pause').should('be.visible');
    cy.contains('Pause').click();
    cy.contains('Play').should('be.visible');
  });

  it('passes basic accessibility checks', () => {
    cy.checkA11y && cy.checkA11y();
  });
});











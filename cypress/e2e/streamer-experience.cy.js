/// <reference types="cypress" />

const USER_KEY = 'stream_soundboard_user';
const TRACKS_KEY = 'music_tracks';

const demoUser = {
  id: 'demo-123',
  email: 'demo@streamsoundboard.com',
  userType: 'streamer',
  plan: 'pro',
  isAuthenticated: true,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

const seedTracks = [
  {
    id: 'track-1',
    title: 'Chill Gaming Track',
    description: 'Relaxed background',
    mood: 'chill',
    genre: 'lofi',
    energyLevel: '2',
    streamingCategory: 'Chill Gaming',
    audioUrl: '/tracks/track1.mp3',
    tags: ['chill', 'gaming'],
    usageTracking: { usageCount: 0, lastUsed: new Date().toISOString() }
  },
  {
    id: 'track-2',
    title: 'Epic Stream Starting',
    description: 'Upbeat intro',
    mood: 'epic',
    genre: 'orchestral',
    energyLevel: '4',
    streamingCategory: 'Stream Starting',
    audioUrl: '/tracks/track2.mp3',
    tags: ['intro', 'epic'],
    usageTracking: { usageCount: 0, lastUsed: new Date().toISOString() }
  }
];

describe('Streamer Experience', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
        win.localStorage.setItem(TRACKS_KEY, JSON.stringify(seedTracks));
      }
    });

    // Optional a11y if cypress-axe is installed
    cy.injectAxe && cy.injectAxe();
  });

  it('loads the library for a streamer', () => {
    cy.contains('Stream Soundboard').should('exist');
    cy.get('[data-testid="music-library"]').should('be.visible');
    cy.get('[data-testid="track-card"]').should('have.length.at.least', 1);
  });

  it('filters and plays a track', () => {
    cy.get('[data-testid="category-filter"]').click();
    cy.get('[data-testid="category-option-Chill Gaming"]').click();

    cy.window().then((win) => {
      cy.stub(win.HTMLAudioElement.prototype, 'play').resolves();
      cy.stub(win.HTMLAudioElement.prototype, 'pause').resolves();
    });

    cy.get('[data-testid="track-card"]').first().within(() => {
      cy.get('[data-testid="play-button"]').click();
    });

    cy.get('audio').should('exist');
  });

  it('checks accessibility on the main library', () => {
    cy.checkA11y && cy.checkA11y();
  });
});











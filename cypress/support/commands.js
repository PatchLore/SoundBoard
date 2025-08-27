// Custom commands for music platform testing

// Login as specific user type
Cypress.Commands.add('loginAs', (userType) => {
  const userData = userType === 'agency' 
    ? {
        id: 'agency-1',
        userType: 'agency',
        permissions: ['upload_tracks', 'manage_users', 'customize_branding', 'view_analytics']
      }
    : {
        id: 'streamer-1',
        userType: 'streamer',
        permissions: ['manage_playlists'],
        agencyId: 'agency-1'
      }

  cy.intercept('GET', '/api/auth/current-user', {
    statusCode: 200,
    body: userData
  }).as('getCurrentUser')

  cy.visit('/')
  cy.wait('@getCurrentUser')
})

// Upload track
Cypress.Commands.add('uploadTrack', ({ title, artist, category, filePath }) => {
  cy.get('[data-testid="admin-panel-button"]').click()
  cy.get('[data-testid="upload-track-button"]').click()
  
  cy.get('[data-testid="track-title-input"]').type(title)
  cy.get('[data-testid="track-artist-input"]').type(artist)
  cy.get('[data-testid="track-category-select"]').select(category)
  cy.get('[data-testid="track-file-input"]').attachFile(filePath)
  cy.get('[data-testid="upload-submit-button"]').click()
})

// Assign track to streamer
Cypress.Commands.add('assignTrackToStreamer', (trackId, streamerId) => {
  cy.get('[data-testid="admin-panel-button"]').click()
  cy.get('[data-testid="user-management-tab"]').click()
  
  cy.get(`[data-testid="streamer-${streamerId}"]`).within(() => {
    cy.get('[data-testid="assign-tracks-button"]').click()
  })
  
  cy.get(`[data-testid="track-${trackId}"]`).click()
  cy.get('[data-testid="confirm-assignment-button"]').click()
})

// Play track
Cypress.Commands.add('playTrack', (trackSelector) => {
  cy.window().then((win) => {
    cy.stub(win.HTMLAudioElement.prototype, 'play').resolves()
    cy.stub(win.HTMLAudioElement.prototype, 'pause').resolves()
  })

  cy.get(trackSelector).within(() => {
    cy.get('[data-testid="play-button"]').click()
  })
})

// Update branding
Cypress.Commands.add('updateBranding', (settings) => {
  cy.get('[data-testid="admin-panel-button"]').click()
  cy.get('[data-testid="branding-tab"]').click()
  
  if (settings.primaryColor) {
    cy.get('[data-testid="primary-color-picker"]').click()
    cy.get(`[data-testid="color-picker-${settings.primaryColor}"]`).click()
  }
  
  if (settings.logoUrl) {
    cy.get('[data-testid="logo-upload-input"]').attachFile(settings.logoUrl)
    cy.get('[data-testid="upload-logo-button"]').click()
  }
  
  if (settings.customCSS) {
    cy.get('[data-testid="custom-css-textarea"]').clear().type(settings.customCSS)
  }
  
  cy.get('[data-testid="save-branding-button"]').click()
})

// Create playlist
Cypress.Commands.add('createPlaylist', (name) => {
  cy.get('[data-testid="create-playlist-button"]').click()
  cy.get('[data-testid="playlist-name-input"]').type(name)
  cy.get('[data-testid="save-playlist-button"]').click()
})

// Add track to playlist
Cypress.Commands.add('addTrackToPlaylist', (trackSelector, playlistName) => {
  cy.get(trackSelector).within(() => {
    cy.get('[data-testid="add-to-playlist-button"]').click()
  })
  
  cy.get('[data-testid="playlist-selector"]').click()
  cy.get(`[data-testid="playlist-option-${playlistName}"]`).click()
  cy.get('[data-testid="confirm-add-button"]').click()
})

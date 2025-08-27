describe('Complete Manual QA Workflow', () => {
  beforeEach(() => {
    // Setup test data
    cy.fixture('test-track.mp3').as('testTrackFile')
    cy.fixture('test-logo.png').as('testLogoFile')
  })

  it('should complete full workflow: Agency upload → Streamer access → Branding update', () => {
    // Step 1: Agency uploads track
    cy.loginAs('agency')
    
    // Mock track upload
    cy.intercept('POST', '/api/tracks/upload', {
      statusCode: 200,
      body: {
        success: true,
        track: {
          id: 'workflow-track-1',
          title: 'Workflow Test Track',
          artist: 'Test Agency',
          duration: 180,
          category: 'chill-gaming',
          approved: true
        }
      }
    }).as('uploadTrack')

    cy.uploadTrack({
      title: 'Workflow Test Track',
      artist: 'Test Agency',
      category: 'chill-gaming',
      filePath: 'test-track.mp3'
    })

    cy.wait('@uploadTrack')
    cy.get('[data-testid="success-message"]').should('contain', 'Track uploaded successfully')

    // Step 2: Agency assigns track to streamer
    cy.intercept('POST', '/api/tracks/assign', {
      statusCode: 200,
      body: { success: true }
    }).as('assignTrack')

    cy.assignTrackToStreamer('workflow-track-1', 'streamer-1')
    cy.wait('@assignTrack')
    cy.get('[data-testid="success-message"]').should('contain', 'Track assigned successfully')

    // Step 3: Agency updates branding
    cy.intercept('PUT', '/api/branding/colors', {
      statusCode: 200,
      body: { success: true }
    }).as('updateBranding')

    cy.updateBranding({
      primaryColor: 'purple',
      customCSS: `
        .custom-header {
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
        }
      `
    })

    cy.wait('@updateBranding')
    cy.get('[data-testid="success-message"]').should('contain', 'Branding updated successfully')

    // Step 4: Streamer logs in and accesses track
    cy.loginAs('streamer')

    // Mock assigned tracks for streamer
    cy.intercept('GET', '/api/tracks/assigned', {
      statusCode: 200,
      body: [
        {
          id: 'workflow-track-1',
          title: 'Workflow Test Track',
          artist: 'Test Agency',
          duration: 180,
          category: 'chill-gaming',
          audioUrl: '/tracks/workflow-test-track.mp3',
          approved: true
        }
      ]
    }).as('getAssignedTracks')

    cy.wait('@getAssignedTracks')

    // Verify track is visible to streamer
    cy.get('[data-testid="track-card"]').should('have.length', 1)
    cy.get('[data-testid="track-card"]').should('contain', 'Workflow Test Track')

    // Step 5: Streamer plays the track
    cy.playTrack('[data-testid="track-card"]')
    
    // Verify play state
    cy.get('[data-testid="track-card"]').within(() => {
      cy.get('[data-testid="play-button"]').should('have.attr', 'data-playing', 'true')
    })

    // Step 6: Streamer creates playlist and adds track
    cy.createPlaylist('Workflow Test Playlist')
    cy.get('[data-testid="playlist-list"]').should('contain', 'Workflow Test Playlist')

    cy.addTrackToPlaylist('[data-testid="track-card"]', 'Workflow Test Playlist')
    
    // Verify track in playlist
    cy.get('[data-testid="playlist-Workflow Test Playlist"]').click()
    cy.get('[data-testid="playlist-tracks"]').should('contain', 'Workflow Test Track')

    // Step 7: Verify branding changes are applied
    cy.get('[data-testid="custom-header"]')
      .should('have.css', 'background-image')
      .and('include', 'linear-gradient')
  })

  it('should handle error scenarios gracefully', () => {
    // Test upload failure
    cy.loginAs('agency')
    
    cy.intercept('POST', '/api/tracks/upload', {
      statusCode: 500,
      body: { error: 'Upload failed' }
    }).as('uploadFailure')

    cy.uploadTrack({
      title: 'Failed Track',
      artist: 'Test Artist',
      category: 'chill-gaming',
      filePath: 'test-track.mp3'
    })

    cy.wait('@uploadFailure')
    cy.get('[data-testid="error-message"]').should('contain', 'Upload failed')

    // Test unauthorized access
    cy.loginAs('streamer')
    cy.get('[data-testid="admin-panel-button"]').should('not.exist')
  })

  it('should test responsive design across devices', () => {
    cy.loginAs('streamer')

    // Test mobile viewport
    cy.viewport(375, 667)
    cy.get('[data-testid="music-library"]').should('be.visible')
    cy.get('[data-testid="track-card"]').should('be.visible')

    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.get('[data-testid="music-library"]').should('be.visible')

    // Test desktop viewport
    cy.viewport(1280, 720)
    cy.get('[data-testid="music-library"]').should('be.visible')
  })

  it('should test performance with large library', () => {
    // Mock large track library
    const largeTrackList = Array.from({ length: 100 }, (_, i) => ({
      id: `track-${i}`,
      title: `Track ${i}`,
      artist: 'Test Artist',
      duration: 180,
      category: 'chill-gaming',
      approved: true
    }))

    cy.intercept('GET', '/api/tracks/assigned', {
      statusCode: 200,
      body: largeTrackList
    }).as('getLargeLibrary')

    cy.loginAs('streamer')
    cy.wait('@getLargeLibrary')

    // Verify performance
    cy.get('[data-testid="track-card"]').should('have.length', 100)
    
    // Test search performance
    cy.get('[data-testid="search-input"]').type('Track 50')
    cy.get('[data-testid="track-card"]').should('have.length', 1)
  })

  it('should test accessibility features', () => {
    cy.loginAs('streamer')

    // Test keyboard navigation
    cy.get('body').tab()
    cy.focused().should('have.attr', 'data-testid', 'search-input')

    // Test screen reader compatibility
    cy.get('[data-testid="track-card"]').first().should('have.attr', 'aria-label')
    cy.get('[data-testid="play-button"]').should('have.attr', 'aria-label')

    // Test color contrast
    cy.get('[data-testid="track-card"]').should('have.css', 'color')
      .and('not.eq', 'rgba(0, 0, 0, 0)')
  })
})

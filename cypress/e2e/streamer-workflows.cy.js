describe('Streamer Workflows', () => {
  beforeEach(() => {
    // Mock authentication for streamer user
    cy.intercept('GET', '/api/auth/current-user', {
      statusCode: 200,
      body: {
        id: 'streamer-1',
        userType: 'streamer',
        permissions: ['manage_playlists'],
        agencyId: 'agency-1'
      }
    }).as('getCurrentUser')

    // Mock assigned tracks
    cy.intercept('GET', '/api/tracks/assigned', {
      statusCode: 200,
      body: [
        {
          id: 'track-1',
          title: 'Chill Gaming Track',
          artist: 'Agency Artist',
          duration: 180,
          category: 'chill-gaming',
          audioUrl: '/tracks/chill-gaming.mp3',
          approved: true
        },
        {
          id: 'track-2',
          title: 'Epic Stream Starting',
          artist: 'Agency Artist',
          duration: 120,
          category: 'stream-starting',
          audioUrl: '/tracks/epic-stream.mp3',
          approved: true
        }
      ]
    }).as('getAssignedTracks')

    cy.visit('/')
    cy.wait('@getCurrentUser')
    cy.wait('@getAssignedTracks')
  })

  describe('Library Browsing', () => {
    it('should allow streamer to browse assigned tracks', () => {
      cy.get('[data-testid="music-library"]').should('be.visible')
      cy.get('[data-testid="track-card"]').should('have.length', 2)
      cy.get('[data-testid="track-card"]').first().should('contain', 'Chill Gaming Track')
      cy.get('[data-testid="track-card"]').last().should('contain', 'Epic Stream Starting')
    })

    it('should allow filtering by category', () => {
      cy.get('[data-testid="category-filter"]').click()
      cy.get('[data-testid="category-option-chill-gaming"]').click()
      
      cy.get('[data-testid="track-card"]').should('have.length', 1)
      cy.get('[data-testid="track-card"]').should('contain', 'Chill Gaming Track')
    })

    it('should allow searching tracks', () => {
      cy.get('[data-testid="search-input"]').type('Epic')
      
      cy.get('[data-testid="track-card"]').should('have.length', 1)
      cy.get('[data-testid="track-card"]').should('contain', 'Epic Stream Starting')
    })
  })

  describe('Track Playback', () => {
    it('should allow streamer to play tracks', () => {
      // Mock audio element
      cy.window().then((win) => {
        cy.stub(win.HTMLAudioElement.prototype, 'play').resolves()
        cy.stub(win.HTMLAudioElement.prototype, 'pause').resolves()
      })

      cy.get('[data-testid="track-card"]').first().within(() => {
        cy.get('[data-testid="play-button"]').click()
      })

      // Verify play state
      cy.get('[data-testid="track-card"]').first().within(() => {
        cy.get('[data-testid="play-button"]').should('have.attr', 'data-playing', 'true')
      })
    })

    it('should show track details on hover', () => {
      cy.get('[data-testid="track-card"]').first().trigger('mouseover')
      
      cy.get('[data-testid="track-details"]').should('be.visible')
      cy.get('[data-testid="track-duration"]').should('contain', '3:00')
      cy.get('[data-testid="track-category"]').should('contain', 'Chill Gaming')
    })
  })

  describe('Access Control', () => {
    it('should not show admin controls for streamers', () => {
      cy.get('[data-testid="admin-panel-button"]').should('not.exist')
      cy.get('[data-testid="track-management-section"]').should('not.exist')
      cy.get('[data-testid="upload-track-button"]').should('not.exist')
    })

    it('should only show assigned tracks', () => {
      // Mock all tracks (including unassigned)
      cy.intercept('GET', '/api/tracks', {
        statusCode: 200,
        body: [
          {
            id: 'track-1',
            title: 'Chill Gaming Track',
            assigned: true
          },
          {
            id: 'track-3',
            title: 'Unassigned Track',
            assigned: false
          }
        ]
      }).as('getAllTracks')

      cy.visit('/')
      cy.wait('@getAllTracks')

      // Should only show assigned tracks
      cy.get('[data-testid="track-card"]').should('have.length', 1)
      cy.get('[data-testid="track-card"]').should('contain', 'Chill Gaming Track')
      cy.get('[data-testid="track-card"]').should('not.contain', 'Unassigned Track')
    })
  })

  describe('Playlist Management', () => {
    it('should allow streamer to create playlists', () => {
      cy.get('[data-testid="create-playlist-button"]').click()
      cy.get('[data-testid="playlist-name-input"]').type('My Gaming Playlist')
      cy.get('[data-testid="save-playlist-button"]').click()

      cy.get('[data-testid="playlist-list"]').should('contain', 'My Gaming Playlist')
    })

    it('should allow adding tracks to playlist', () => {
      // Create playlist first
      cy.get('[data-testid="create-playlist-button"]').click()
      cy.get('[data-testid="playlist-name-input"]').type('Test Playlist')
      cy.get('[data-testid="save-playlist-button"]').click()

      // Add track to playlist
      cy.get('[data-testid="track-card"]').first().within(() => {
        cy.get('[data-testid="add-to-playlist-button"]').click()
      })

      cy.get('[data-testid="playlist-selector"]').click()
      cy.get('[data-testid="playlist-option-Test Playlist"]').click()
      cy.get('[data-testid="confirm-add-button"]').click()

      // Verify track added
      cy.get('[data-testid="playlist-Test Playlist"]').click()
      cy.get('[data-testid="playlist-tracks"]').should('contain', 'Chill Gaming Track')
    })
  })
})

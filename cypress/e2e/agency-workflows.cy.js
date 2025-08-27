describe('Agency Workflows', () => {
  beforeEach(() => {
    // Mock authentication for agency user
    cy.intercept('GET', '/api/auth/current-user', {
      statusCode: 200,
      body: {
        id: 'agency-1',
        userType: 'agency',
        permissions: ['upload_tracks', 'manage_users', 'customize_branding', 'view_analytics']
      }
    }).as('getCurrentUser')

    cy.visit('/')
    cy.wait('@getCurrentUser')
  })

  describe('Track Upload Workflow', () => {
    it('should allow agency to upload track and see it in library', () => {
      // Mock track upload API
      cy.intercept('POST', '/api/tracks/upload', {
        statusCode: 200,
        body: {
          success: true,
          track: {
            id: 'new-track-1',
            title: 'Test Upload Track',
            artist: 'Test Artist',
            duration: 180,
            category: 'chill-gaming',
            approved: true
          }
        }
      }).as('uploadTrack')

      // Mock library refresh
      cy.intercept('GET', '/api/tracks', {
        statusCode: 200,
        body: [
          {
            id: 'new-track-1',
            title: 'Test Upload Track',
            artist: 'Test Artist',
            duration: 180,
            category: 'chill-gaming',
            approved: true
          }
        ]
      }).as('getTracks')

      // Navigate to admin panel
      cy.get('[data-testid="admin-panel-button"]').click()
      
      // Upload new track
      cy.get('[data-testid="upload-track-button"]').click()
      cy.get('[data-testid="track-title-input"]').type('Test Upload Track')
      cy.get('[data-testid="track-artist-input"]').type('Test Artist')
      cy.get('[data-testid="track-category-select"]').select('chill-gaming')
      cy.get('[data-testid="track-file-input"]').attachFile('test-track.mp3')
      cy.get('[data-testid="upload-submit-button"]').click()

      cy.wait('@uploadTrack')

      // Verify track appears in library
      cy.get('[data-testid="music-library"]').should('contain', 'Test Upload Track')
      cy.get('[data-testid="track-card"]').should('have.length.at.least', 1)
    })

    it('should show track management interface for agency users', () => {
      cy.get('[data-testid="admin-panel-button"]').click()
      cy.get('[data-testid="track-management-section"]').should('be.visible')
      cy.get('[data-testid="upload-new-track-button"]').should('be.visible')
      cy.get('[data-testid="bulk-upload-button"]').should('be.visible')
    })
  })

  describe('Streamer Assignment Workflow', () => {
    it('should allow agency to assign tracks to streamers', () => {
      // Mock streamer list
      cy.intercept('GET', '/api/streamers', {
        statusCode: 200,
        body: [
          {
            id: 'streamer-1',
            name: 'Test Streamer',
            email: 'test@example.com',
            isActive: true
          }
        ]
      }).as('getStreamers')

      // Mock track assignment
      cy.intercept('POST', '/api/tracks/assign', {
        statusCode: 200,
        body: { success: true }
      }).as('assignTrack')

      cy.get('[data-testid="admin-panel-button"]').click()
      cy.get('[data-testid="user-management-tab"]').click()
      
      cy.wait('@getStreamers')
      
      // Assign track to streamer
      cy.get('[data-testid="streamer-row"]').first().within(() => {
        cy.get('[data-testid="assign-tracks-button"]').click()
      })
      
      cy.get('[data-testid="track-selector"]').click()
      cy.get('[data-testid="track-option"]').first().click()
      cy.get('[data-testid="confirm-assignment-button"]').click()

      cy.wait('@assignTrack')
      cy.get('[data-testid="success-message"]').should('contain', 'Track assigned successfully')
    })
  })

  describe('Analytics Dashboard', () => {
    it('should display analytics for agency users', () => {
      // Mock analytics data
      cy.intercept('GET', '/api/analytics', {
        statusCode: 200,
        body: {
          totalTracks: 25,
          totalStreamers: 5,
          totalPlayTime: 1200,
          popularTracks: [
            { id: '1', title: 'Popular Track', plays: 150 }
          ]
        }
      }).as('getAnalytics')

      cy.get('[data-testid="admin-panel-button"]').click()
      cy.get('[data-testid="analytics-tab"]').click()
      
      cy.wait('@getAnalytics')
      
      cy.get('[data-testid="total-tracks-stat"]').should('contain', '25')
      cy.get('[data-testid="total-streamers-stat"]').should('contain', '5')
      cy.get('[data-testid="popular-tracks-list"]').should('be.visible')
    })
  })
})

describe('Overlay Jukebox Tests', () => {
  beforeEach(() => {
    // Mock demo tracks for overlay
    const demoTracks = [
      {
        id: 'demo_1',
        title: 'Epic Boss Battle',
        artist: 'Demo Artist',
        duration: 180,
        audioUrl: '/audio/demo-1.mp3',
        category: 'boss-battle',
        mood: 'epic',
        energy: 5,
        bpm: 140,
        tags: ['epic', 'battle', 'boss']
      },
      {
        id: 'demo_2',
        title: 'Chill Gaming',
        artist: 'Relax Artist',
        duration: 240,
        audioUrl: '/audio/demo-2.mp3',
        category: 'chill-gaming',
        mood: 'chill',
        energy: 2,
        bpm: 85,
        tags: ['chill', 'gaming', 'relaxing']
      },
      {
        id: 'demo_3',
        title: 'Hype Raid',
        artist: 'Energy Artist',
        duration: 120,
        audioUrl: '/audio/demo-3.mp3',
        category: 'hype-raid',
        mood: 'energetic',
        energy: 4,
        bpm: 128,
        tags: ['hype', 'raid', 'energetic']
      }
    ];

    // Mock tracks API for overlay
    cy.intercept('GET', '/api/tracks', {
      statusCode: 200,
      body: demoTracks
    }).as('getDemoTracks');
  });

  describe('OBS Viewport Compatibility', () => {
    it('should display correctly in 800x600 viewport (OBS standard)', () => {
      // Set viewport to OBS standard size
      cy.viewport(800, 600);
      
      // Visit overlay page
      cy.visit('/overlay');
      
      // Wait for tracks to load
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
      
      // Verify main elements are visible
      cy.get('[data-testid="track-title"]').should('be.visible');
      cy.get('[data-testid="track-artist"]').should('be.visible');
      cy.get('[data-testid="track-tags"]').should('be.visible');
      
      // Verify controls are visible and properly sized
      cy.get('[data-testid="play-pause-btn"]').should('be.visible');
      cy.get('[data-testid="previous-btn"]').should('be.visible');
      cy.get('[data-testid="next-btn"]').should('be.visible');
      cy.get('[data-testid="shuffle-btn"]').should('be.visible');
      
      // Check that elements fit within viewport
      cy.get('[data-testid="overlay-jukebox"]').should('have.css', 'width').and('be.lessThan', 800);
      cy.get('[data-testid="overlay-jukebox"]').should('have.css', 'height').and('be.lessThan', 600);
      
      // Verify text is readable at this size
      cy.get('[data-testid="track-title"]').should('have.css', 'font-size').and('be.greaterThan', '14px');
    });

    it('should display correctly in 1920x1080 viewport (HD OBS)', () => {
      // Set viewport to HD size
      cy.viewport(1920, 1080);
      
      // Visit overlay page
      cy.visit('/overlay');
      
      // Wait for tracks to load
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
      
      // Verify main elements are visible
      cy.get('[data-testid="track-title"]').should('be.visible');
      cy.get('[data-testid="track-artist"]').should('be.visible');
      cy.get('[data-testid="track-tags"]').should('be.visible');
      
      // Verify controls are visible and properly sized
      cy.get('[data-testid="play-pause-btn"]').should('be.visible');
      cy.get('[data-testid="previous-btn"]').should('be.visible');
      cy.get('[data-testid="next-btn"]').should('be.visible');
      cy.get('[data-testid="shuffle-btn"]').should('be.visible');
      
      // Check that elements scale appropriately for HD
      cy.get('[data-testid="track-title"]').should('have.css', 'font-size').and('be.greaterThan', '16px');
    });

    it('should maintain aspect ratio and positioning', () => {
      cy.viewport(800, 600);
      cy.visit('/overlay');
      
      // Wait for content to load
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
      
      // Check that overlay is centered
      cy.get('[data-testid="overlay-jukebox"]').should('have.css', 'display', 'flex');
      cy.get('[data-testid="overlay-jukebox"]').should('have.css', 'justify-content', 'center');
      cy.get('[data-testid="overlay-jukebox"]').should('have.css', 'align-items', 'center');
      
      // Check that content is vertically centered
      cy.get('[data-testid="track-info"]').should('be.visible');
      cy.get('[data-testid="controls"]').should('be.visible');
    });
  });

  describe('Overlay Controls', () => {
    beforeEach(() => {
      cy.viewport(800, 600);
      cy.visit('/overlay');
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
    });

    it('should display current track information', () => {
      // Verify track info is displayed
      cy.get('[data-testid="track-title"]').should('contain.text', 'Epic Boss Battle');
      cy.get('[data-testid="track-artist"]').should('contain.text', 'Demo Artist');
      cy.get('[data-testid="track-tags"]').should('contain.text', 'epic');
      
      // Verify track metadata
      cy.get('[data-testid="track-energy"]').should('contain.text', '5');
      cy.get('[data-testid="track-bpm"]').should('contain.text', '140');
      cy.get('[data-testid="track-duration"]').should('contain.text', '3:00');
    });

    it('should handle play/pause button correctly', () => {
      // Initially should show play button
      cy.get('[data-testid="play-pause-btn"]').should('contain.text', 'Play');
      
      // Click play
      cy.get('[data-testid="play-pause-btn"]').click();
      
      // Should show pause button
      cy.get('[data-testid="play-pause-btn"]').should('contain.text', 'Pause');
      
      // Click pause
      cy.get('[data-testid="play-pause-btn"]').click();
      
      // Should show play button again
      cy.get('[data-testid="play-pause-btn"]').should('contain.text', 'Play');
    });

    it('should navigate between tracks with next/previous buttons', () => {
      // Verify we're on first track
      cy.get('[data-testid="track-title"]').should('contain.text', 'Epic Boss Battle');
      
      // Click next
      cy.get('[data-testid="next-btn"]').click();
      
      // Should show second track
      cy.get('[data-testid="track-title"]').should('contain.text', 'Chill Gaming');
      cy.get('[data-testid="track-artist"]').should('contain.text', 'Relax Artist');
      
      // Click next again
      cy.get('[data-testid="next-btn"]').click();
      
      // Should show third track
      cy.get('[data-testid="track-title"]').should('contain.text', 'Hype Raid');
      cy.get('[data-testid="track-artist"]').should('contain.text', 'Energy Artist');
      
      // Click previous
      cy.get('[data-testid="previous-btn"]').click();
      
      // Should go back to second track
      cy.get('[data-testid="track-title"]').should('contain.text', 'Chill Gaming');
    });

    it('should handle shuffle functionality', () => {
      // Verify shuffle button exists and is clickable
      cy.get('[data-testid="shuffle-btn"]').should('be.visible');
      
      // Click shuffle
      cy.get('[data-testid="shuffle-btn"]').click();
      
      // Verify shuffle state is indicated
      cy.get('[data-testid="shuffle-btn"]').should('have.class', 'active');
      
      // Click shuffle again to turn off
      cy.get('[data-testid="shuffle-btn"]').click();
      
      // Verify shuffle is turned off
      cy.get('[data-testid="shuffle-btn"]').should('not.have.class', 'active');
    });

    it('should handle track looping correctly', () => {
      // Go to last track
      cy.get('[data-testid="next-btn"]').click();
      cy.get('[data-testid="next-btn"]').click();
      
      // Verify we're on last track
      cy.get('[data-testid="track-title"]').should('contain.text', 'Hype Raid');
      
      // Click next to loop back to first
      cy.get('[data-testid="next-btn"]').click();
      
      // Should be back on first track
      cy.get('[data-testid="track-title"]').should('contain.text', 'Epic Boss Battle');
      
      // Go to first track and click previous
      cy.get('[data-testid="previous-btn"]').click();
      
      // Should loop to last track
      cy.get('[data-testid="track-title"]').should('contain.text', 'Hype Raid');
    });
  });

  describe('Auto-advance Functionality', () => {
    beforeEach(() => {
      cy.viewport(800, 600);
      cy.visit('/overlay');
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
    });

    it('should auto-advance when track ends', () => {
      // Start playing first track
      cy.get('[data-testid="play-pause-btn"]').click();
      
      // Verify we're playing
      cy.get('[data-testid="play-pause-btn"]').should('contain.text', 'Pause');
      cy.get('[data-testid="track-title"]').should('contain.text', 'Epic Boss Battle');
      
      // Simulate track end (mock audio end event)
      cy.window().then((win) => {
        const audioElement = win.document.querySelector('audio');
        if (audioElement) {
          audioElement.dispatchEvent(new Event('ended'));
        }
      });
      
      // Should auto-advance to next track
      cy.get('[data-testid="track-title"]', { timeout: 2000 }).should('contain.text', 'Chill Gaming');
      
      // Should still be playing
      cy.get('[data-testid="play-pause-btn"]').should('contain.text', 'Pause');
    });

    it('should auto-advance with shuffle enabled', () => {
      // Enable shuffle
      cy.get('[data-testid="shuffle-btn"]').click();
      
      // Start playing
      cy.get('[data-testid="play-pause-btn"]').click();
      
      // Get current track title
      cy.get('[data-testid="track-title"]').invoke('text').then((currentTitle) => {
        // Simulate track end
        cy.window().then((win) => {
          const audioElement = win.document.querySelector('audio');
          if (audioElement) {
            audioElement.dispatchEvent(new Event('ended'));
          }
        });
        
        // Should advance to a different track (not necessarily next in sequence)
        cy.get('[data-testid="track-title"]', { timeout: 2000 }).should('not.contain.text', currentTitle);
      });
    });

    it('should handle auto-advance at end of playlist', () => {
      // Go to last track
      cy.get('[data-testid="next-btn"]').click();
      cy.get('[data-testid="next-btn"]').click();
      
      // Verify we're on last track
      cy.get('[data-testid="track-title"]').should('contain.text', 'Hype Raid');
      
      // Start playing
      cy.get('[data-testid="play-pause-btn"]').click();
      
      // Simulate track end
      cy.window().then((win) => {
        const audioElement = win.document.querySelector('audio');
        if (audioElement) {
          audioElement.dispatchEvent(new Event('ended'));
        }
      });
      
      // Should loop back to first track
      cy.get('[data-testid="track-title"]', { timeout: 2000 }).should('contain.text', 'Epic Boss Battle');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to different viewport sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.visit('/overlay');
      
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
      
      // Verify elements are still visible and properly sized
      cy.get('[data-testid="track-title"]').should('be.visible');
      cy.get('[data-testid="controls"]').should('be.visible');
      
      // Test tablet viewport
      cy.viewport(768, 1024);
      cy.reload();
      
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
      cy.get('[data-testid="track-title"]').should('be.visible');
      
      // Test desktop viewport
      cy.viewport(1440, 900);
      cy.reload();
      
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
      cy.get('[data-testid="track-title"]').should('be.visible');
    });

    it('should maintain touch-friendly controls on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/overlay');
      
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
      
      // Verify buttons are large enough for touch
      cy.get('[data-testid="play-pause-btn"]').should('have.css', 'min-height').and('be.greaterThan', '40px');
      cy.get('[data-testid="next-btn"]').should('have.css', 'min-height').and('be.greaterThan', '40px');
      cy.get('[data-testid="previous-btn"]').should('have.css', 'min-height').and('be.greaterThan', '40px');
    });
  });

  describe('Error Handling', () => {
    it('should handle loading errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/tracks', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getTracksError');

      cy.viewport(800, 600);
      cy.visit('/overlay');
      
      // Should show error message
      cy.contains('Failed to load tracks', { timeout: 10000 }).should('be.visible');
      cy.contains('Please try refreshing the page').should('be.visible');
    });

    it('should handle empty track list', () => {
      // Mock empty response
      cy.intercept('GET', '/api/tracks', {
        statusCode: 200,
        body: []
      }).as('getEmptyTracks');

      cy.viewport(800, 600);
      cy.visit('/overlay');
      
      // Should show empty state
      cy.contains('No tracks available', { timeout: 10000 }).should('be.visible');
      cy.contains('Please upload some tracks first').should('be.visible');
    });

    it('should handle network connectivity issues', () => {
      // Mock network failure
      cy.intercept('GET', '/api/tracks', {
        forceNetworkError: true
      }).as('networkError');

      cy.viewport(800, 600);
      cy.visit('/overlay');
      
      // Should show network error
      cy.contains('Network error', { timeout: 10000 }).should('be.visible');
      cy.contains('Please check your connection').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('should load quickly in OBS viewport', () => {
      const startTime = Date.now();
      
      cy.viewport(800, 600);
      cy.visit('/overlay');
      
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
      
      // Should load within reasonable time for OBS
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds max for OBS
      });
    });

    it('should handle rapid track switching', () => {
      cy.viewport(800, 600);
      cy.visit('/overlay');
      
      cy.get('[data-testid="overlay-jukebox"]', { timeout: 10000 }).should('exist');
      
      // Rapidly click next button
      cy.get('[data-testid="next-btn"]').click();
      cy.get('[data-testid="next-btn"]').click();
      cy.get('[data-testid="next-btn"]').click();
      
      // Should handle rapid switching without errors
      cy.get('[data-testid="track-title"]').should('be.visible');
      cy.get('[data-testid="track-artist"]').should('be.visible');
    });
  });
});




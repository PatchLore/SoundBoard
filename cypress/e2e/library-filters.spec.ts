describe('Library Filters and Search Tests', () => {
  beforeEach(() => {
    // Load mock tracks data
    cy.fixture('tracks').as('tracksData');
    
    // Mock authentication
    cy.intercept('POST', '/api/auth', {
      statusCode: 200,
      body: {
        success: true,
        token: 'mock-token-123',
        user: { email: 'test@example.com', role: 'agency' }
      }
    }).as('loginSuccess');

    // Mock tracks API
    cy.intercept('GET', '/api/tracks', {
      statusCode: 200,
      body: []
    }).as('getTracks');

    // Login and visit library
    cy.visit('/');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginSuccess');
  });

  describe('Filter Combinations', () => {
    it('should filter by mood correctly', () => {
      cy.get('@tracksData').then((tracks) => {
        // Mock tracks with different moods
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksWithMoods');

        cy.visit('/');
        cy.wait('@getTracksWithMoods');

        // Filter by epic mood
        cy.get('#mood-filter').select('epic');
        
        // Should show only epic tracks
        cy.get('[role="article"]').should('have.length', 2); // Epic Battle Theme and Gaming Action Pack
        
        // Verify track titles
        cy.contains('Epic Battle Theme').should('be.visible');
        cy.contains('Gaming Action Pack').should('be.visible');
        cy.contains('Chill Gaming Vibes').should('not.exist');

        // Filter by chill mood
        cy.get('#mood-filter').select('chill');
        
        // Should show chill tracks
        cy.get('[role="article"]').should('have.length', 2); // Chill Gaming Vibes and Talk Show Background
        
        // Verify track titles
        cy.contains('Chill Gaming Vibes').should('be.visible');
        cy.contains('Talk Show Background').should('be.visible');
        cy.contains('Epic Battle Theme').should('not.exist');
      });
    });

    it('should filter by energy level correctly', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksWithEnergy');

        cy.visit('/');
        cy.wait('@getTracksWithEnergy');

        // Filter by high energy (4-5)
        cy.get('#energy-filter').select('high');
        
        // Should show high energy tracks
        cy.get('[role="article"]').should('have.length', 3); // Epic Battle Theme, Hype Raid Music, Gaming Action Pack
        
        // Verify energy levels are high
        cy.contains('Epic Battle Theme').should('be.visible');
        cy.contains('Hype Raid Music').should('be.visible');
        cy.contains('Gaming Action Pack').should('be.visible');

        // Filter by low energy (1-2)
        cy.get('#energy-filter').select('low');
        
        // Should show low energy tracks
        cy.get('[role="article"]').should('have.length', 3); // Break Time Vibes, Talk Show Background, Chill Gaming Vibes
      });
    });

    it('should filter by category correctly', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksWithCategories');

        cy.visit('/');
        cy.wait('@getTracksWithCategories');

        // Filter by boss-battle category
        cy.get('#category-filter').select('boss-battle');
        
        // Should show boss battle tracks
        cy.get('[role="article"]').should('have.length', 2); // Epic Battle Theme and Mysterious Dungeon
        
        // Verify categories
        cy.contains('Epic Battle Theme').should('be.visible');
        cy.contains('Mysterious Dungeon').should('be.visible');
        cy.contains('Chill Gaming Vibes').should('not.exist');

        // Filter by chill-gaming category
        cy.get('#category-filter').select('chill-gaming');
        
        // Should show only chill gaming tracks
        cy.get('[role="article"]').should('have.length', 1);
        cy.contains('Chill Gaming Vibes').should('be.visible');
      });
    });

    it('should combine multiple filters correctly', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForCombined');

        cy.visit('/');
        cy.wait('@getTracksForCombined');

        // Apply multiple filters: epic mood + high energy + boss-battle category
        cy.get('#mood-filter').select('epic');
        cy.get('#energy-filter').select('high');
        cy.get('#category-filter').select('boss-battle');
        
        // Should show only tracks matching all criteria
        cy.get('[role="article"]').should('have.length', 1);
        cy.contains('Epic Battle Theme').should('be.visible');
        cy.contains('Gaming Action Pack').should('not.exist'); // Wrong category
        cy.contains('Hype Raid Music').should('not.exist'); // Wrong category
      });
    });

    it('should clear filters and show all tracks', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getAllTracks');

        cy.visit('/');
        cy.wait('@getAllTracks');

        // Apply some filters
        cy.get('#mood-filter').select('epic');
        cy.get('#energy-filter').select('high');
        
        // Should show filtered results
        cy.get('[role="article"]').should('have.length', 2);

        // Clear filters
        cy.get('#mood-filter').select('all');
        cy.get('#energy-filter').select('all');
        cy.get('#category-filter').select('all');
        
        // Should show all tracks
        cy.get('[role="article"]').should('have.length', 8);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should search by track title accurately', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForSearch');

        cy.visit('/');
        cy.wait('@getTracksForSearch');

        // Search for "epic"
        cy.get('input[role="searchbox"]').type('epic');
        
        // Should show tracks containing "epic"
        cy.get('[role="article"]').should('have.length', 1);
        cy.contains('Epic Battle Theme').should('be.visible');
        cy.contains('Chill Gaming Vibes').should('not.exist');

        // Clear search and search for "gaming"
        cy.get('input[role="searchbox"]').clear().type('gaming');
        
        // Should show gaming-related tracks
        cy.get('[role="article"]').should('have.length', 2);
        cy.contains('Chill Gaming Vibes').should('be.visible');
        cy.contains('Gaming Action Pack').should('be.visible');
      });
    });

    it('should search by artist name', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForArtistSearch');

        cy.visit('/');
        cy.wait('@getTracksForArtistSearch');

        // Search for "Composer"
        cy.get('input[role="searchbox"]').type('Composer');
        
        // Should show tracks by Composer One
        cy.get('[role="article"]').should('have.length', 1);
        cy.contains('Epic Battle Theme').should('be.visible');
        cy.contains('Composer One').should('be.visible');
      });
    });

    it('should search by tags', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForTagSearch');

        cy.visit('/');
        cy.wait('@getTracksForTagSearch');

        // Search for "ambient" tag
        cy.get('input[role="searchbox"]').type('ambient');
        
        // Should show tracks with ambient tag
        cy.get('[role="article"]').should('have.length', 1);
        cy.contains('Chill Gaming Vibes').should('be.visible');
        cy.contains('Ambient Artist').should('be.visible');
      });
    });

    it('should handle case-insensitive search', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForCaseInsensitive');

        cy.visit('/');
        cy.wait('@getTracksForCaseInsensitive');

        // Search with different cases
        cy.get('input[role="searchbox"]').type('EPIC');
        
        // Should find tracks regardless of case
        cy.get('[role="article"]').should('have.length', 1);
        cy.contains('Epic Battle Theme').should('be.visible');

        // Try lowercase
        cy.get('input[role="searchbox"]').clear().type('chill');
        
        // Should find chill tracks
        cy.get('[role="article"]').should('have.length', 2);
        cy.contains('Chill Gaming Vibes').should('be.visible');
        cy.contains('Talk Show Background').should('be.visible');
      });
    });

    it('should combine search with filters', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForCombinedSearch');

        cy.visit('/');
        cy.wait('@getTracksForCombinedSearch');

        // Search for "gaming" and filter by high energy
        cy.get('input[role="searchbox"]').type('gaming');
        cy.get('#energy-filter').select('high');
        
        // Should show only high energy gaming tracks
        cy.get('[role="article"]').should('have.length', 1);
        cy.contains('Gaming Action Pack').should('be.visible');
        cy.contains('Chill Gaming Vibes').should('not.exist'); // Low energy
      });
    });
  });

  describe('Smart Playlist Membership', () => {
    it('should validate featured tracks playlist rules', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForFeatured');

        cy.visit('/');
        cy.wait('@getTracksForFeatured');

        // Filter to show only featured tracks
        cy.get('[data-testid="featured-filter"]').click();
        
        // Should show only featured tracks
        cy.get('[role="article"]').should('have.length', 4); // Epic Battle Theme, Hype Raid Music, Gaming Action Pack, and one more
        
        // Verify featured badge is visible
        cy.get('[role="article"]').each(($article) => {
          cy.wrap($article).within(() => {
            cy.contains('⭐ Featured').should('be.visible');
          });
        });
      });
    });

    it('should validate DMCA safe playlist rules', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForDMCASafe');

        cy.visit('/');
        cy.wait('@getTracksForDMCASafe');

        // Filter to show only DMCA safe tracks
        cy.get('[data-testid="dmca-safe-filter"]').click();
        
        // Should show only DMCA safe tracks (all tracks in our fixture)
        cy.get('[role="article"]').should('have.length', 8);
        
        // Verify DMCA safe badge
        cy.get('[role="article"]').each(($article) => {
          cy.wrap($article).within(() => {
            cy.contains('✅ DMCA Safe').should('be.visible');
          });
        });
      });
    });

    it('should validate loop friendly playlist rules', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForLoopFriendly');

        cy.visit('/');
        cy.wait('@getTracksForLoopFriendly');

        // Filter to show only loop friendly tracks
        cy.get('[data-testid="loop-friendly-filter"]').click();
        
        // Should show loop friendly tracks (most tracks in our fixture)
        cy.get('[role="article"]').should('have.length.greaterThan', 4);
        
        // Verify loop friendly badge
        cy.get('[role="article"]').each(($article) => {
          cy.wrap($article).within(() => {
            cy.contains('🔄 Loop Friendly').should('be.visible');
          });
        });
      });
    });

    it('should show playlist membership counts', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForCounts');

        cy.visit('/');
        cy.wait('@getTracksForCounts');

        // Check featured tracks count
        cy.get('[data-testid="featured-count"]').should('contain', '4');
        
        // Check DMCA safe count
        cy.get('[data-testid="dmca-safe-count"]').should('contain', '8');
        
        // Check loop friendly count
        cy.get('[data-testid="loop-friendly-count"]').should('contain', '6');
      });
    });
  });

  describe('Filter Results Display', () => {
    it('should show correct result counts', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForCounts');

        cy.visit('/');
        cy.wait('@getTracksForCounts');

        // Should show total count initially
        cy.contains('8 tracks').should('be.visible');

        // Apply mood filter
        cy.get('#mood-filter').select('epic');
        
        // Should update count
        cy.contains('1 track').should('be.visible');

        // Apply category filter
        cy.get('#category-filter').select('chill-gaming');
        
        // Should show no results
        cy.contains('0 tracks').should('be.visible');
        cy.contains('No tracks found').should('be.visible');
      });
    });

    it('should handle empty search results gracefully', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForEmptyResults');

        cy.visit('/');
        cy.wait('@getTracksForEmptyResults');

        // Search for non-existent term
        cy.get('input[role="searchbox"]').type('nonexistent');
        
        // Should show no results message
        cy.contains('No tracks found').should('be.visible');
        cy.contains('Try adjusting your search or filters').should('be.visible');
        
        // Should show clear filters button
        cy.get('[data-testid="clear-filters"]').should('be.visible');
      });
    });

    it('should maintain filter state during search', () => {
      cy.get('@tracksData').then((tracks) => {
        cy.intercept('GET', '/api/tracks', {
          statusCode: 200,
          body: tracks
        }).as('getTracksForFilterState');

        cy.visit('/');
        cy.wait('@getTracksForFilterState');

        // Apply filters
        cy.get('#mood-filter').select('energetic');
        cy.get('#energy-filter').select('high');
        
        // Search
        cy.get('input[role="searchbox"]').type('gaming');
        
        // Should maintain filter state
        cy.get('#mood-filter').should('have.value', 'energetic');
        cy.get('#energy-filter').should('have.value', 'high');
        
        // Should show filtered and searched results
        cy.get('[role="article"]').should('have.length', 1);
        cy.contains('Gaming Action Pack').should('be.visible');
      });
    });
  });
});







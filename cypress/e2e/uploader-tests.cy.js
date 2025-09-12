describe('Track Uploader Tests', () => {
  beforeEach(() => {
    // Visit the app and ensure we're logged in as an agency user
    cy.visit('/');
    
    // Mock authentication for agency user
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'mock-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 'agency-user',
        email: 'agency@test.com',
        userType: 'agency'
      }));
    });
  });

  describe('Uploader Success Flow', () => {
    it('should successfully upload a track with valid metadata', () => {
      // Intercept the upload API call
      cy.intercept('POST', '/api/upload', {
        statusCode: 200,
        body: { success: true, trackId: 'test-track-123' }
      }).as('uploadTrack');

      // Click the upload button
      cy.get('[data-testid="upload-button"]').click();

      // Wait for uploader modal to appear
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('h2').should('contain', 'Upload New Track');

      // Upload a test audio file
      const testFile = new File(['test audio content'], 'test-track.mp3', {
        type: 'audio/mpeg'
      });
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('test audio content'),
        fileName: 'test-track.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      // Wait for metadata form to appear
      cy.get('input[id="track-title"]').should('be.visible');
      
      // Fill in required metadata
      cy.get('input[id="track-title"]').clear().type('Test Track Title');
      cy.get('input[id="track-artist"]').clear().type('Test Artist');
      cy.get('select[id="track-category"]').select('chill-gaming');
      cy.get('select[id="track-mood"]').select('chill');
      cy.get('select[id="track-energy"]').select('3');

      // Fill optional metadata
      cy.get('input[id="track-subcategory"]').type('electronic');
      cy.get('input[id="track-bpm"]').type('120');
      cy.get('input[id="track-key"]').type('C major');
      cy.get('input[id="track-tags"]').type('test, electronic, chill');
      cy.get('textarea[id="track-description"]').type('A test track for upload testing');

      // Check some properties
      cy.get('input[type="checkbox"][name="streamSafe"]').check();
      cy.get('input[type="checkbox"][name="loopFriendly"]').check();

      // Click upload button
      cy.get('button').contains('Upload Track').click();

      // Wait for upload to complete
      cy.wait('@uploadTrack');

      // Check for success toast
      cy.get('[role="alert"]').should('be.visible');
      cy.get('[role="alert"]').should('contain', 'Track uploaded successfully!');

      // Check for "View in Library" action
      cy.get('button').contains('View in Library').should('be.visible');

      // Click "View in Library" to test navigation
      cy.get('button').contains('View in Library').click();

      // Verify modal closes
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should show drag and drop visual feedback', () => {
      // Open uploader
      cy.get('[data-testid="upload-button"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      // Get the drop zone
      const dropZone = cy.get('[role="button"]').contains('Upload Audio Track').parent();

      // Test drag over effect
      dropZone.trigger('dragover');
      cy.get('[role="button"]').contains('Drop your audio file here').should('be.visible');
      
      // Test drag leave effect
      dropZone.trigger('dragleave');
      cy.get('[role="button"]').contains('Upload Audio Track').should('be.visible');
    });

    it('should validate file requirements', () => {
      // Open uploader
      cy.get('[data-testid="upload-button"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      // Try to upload an invalid file type
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('not audio content'),
        fileName: 'test.txt',
        mimeType: 'text/plain'
      }, { force: true });

      // Check for validation error
      cy.get('[role="alert"]').should('be.visible');
      cy.get('[role="alert"]').should('contain', 'Please select an audio file');
    });

    it('should validate metadata requirements', () => {
      // Open uploader and upload valid file
      cy.get('[data-testid="upload-button"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      const testFile = new File(['test audio content'], 'test-track.mp3', {
        type: 'audio/mpeg'
      });
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('test audio content'),
        fileName: 'test-track.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      // Wait for metadata form
      cy.get('input[id="track-title"]').should('be.visible');

      // Try to upload without required fields
      cy.get('button').contains('Upload Track').click();

      // Check for validation errors
      cy.get('[role="alert"]').should('be.visible');
      cy.get('[role="alert"]').should('contain', 'Title is required');
    });
  });

  describe('Uploader Authorization Tests', () => {
    it('should show 401 error for unauthorized user', () => {
      // Clear authentication
      cy.window().then((win) => {
        win.localStorage.removeItem('authToken');
        win.localStorage.removeItem('user');
      });

      // Reload page
      cy.reload();

      // Intercept upload API to return 401
      cy.intercept('POST', '/api/upload', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('uploadUnauthorized');

      // Try to access upload functionality (should not be visible)
      cy.get('[data-testid="upload-button"]').should('not.exist');
    });

    it('should show 403 error for non-agency user', () => {
      // Set up as streamer user
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'mock-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: 'streamer-user',
          email: 'streamer@test.com',
          userType: 'streamer'
        }));
      });

      // Reload page
      cy.reload();

      // Upload button should not be visible for streamer
      cy.get('[data-testid="upload-button"]').should('not.exist');
    });

    it('should handle 403 error during upload', () => {
      // Set up as agency user but with invalid permissions
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'invalid-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: 'agency-user',
          email: 'agency@test.com',
          userType: 'agency'
        }));
      });

      // Intercept upload API to return 403
      cy.intercept('POST', '/api/upload', {
        statusCode: 403,
        body: { error: 'Forbidden: No upload rights' }
      }).as('uploadForbidden');

      // Open uploader
      cy.get('[data-testid="upload-button"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      // Upload file and fill metadata
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('test audio content'),
        fileName: 'test-track.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.get('input[id="track-title"]').type('Test Track');
      cy.get('input[id="track-artist"]').type('Test Artist');

      // Try to upload
      cy.get('button').contains('Upload Track').click();

      // Wait for API call
      cy.wait('@uploadForbidden');

      // Check for error toast
      cy.get('[role="alert"]').should('be.visible');
      cy.get('[role="alert"]').should('contain', 'Upload failed: Forbidden: No upload rights');
    });
  });

  describe('Accessibility Tests', () => {
    it('should be keyboard navigable', () => {
      // Open uploader
      cy.get('[data-testid="upload-button"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      // Test keyboard navigation
      cy.get('body').tab();
      cy.focused().should('contain', 'Choose File');

      // Test escape key closes modal
      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should have proper ARIA labels and descriptions', () => {
      // Open uploader
      cy.get('[data-testid="upload-button"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      // Check for ARIA attributes
      cy.get('[role="button"]').should('have.attr', 'aria-describedby');
      cy.get('input[id="track-title"]').should('have.attr', 'aria-describedby');
      cy.get('input[id="track-artist"]').should('have.attr', 'aria-describedby');

      // Check for live region
      cy.get('[aria-live="polite"]').should('exist');
    });

    it('should announce upload progress to screen readers', () => {
      // Intercept upload API
      cy.intercept('POST', '/api/upload', {
        statusCode: 200,
        body: { success: true, trackId: 'test-track-123' }
      }).as('uploadTrack');

      // Open uploader and start upload
      cy.get('[data-testid="upload-button"]').click();
      cy.get('[role="dialog"]').should('be.visible');

      // Upload file and fill metadata
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('test audio content'),
        fileName: 'test-track.mp3',
        mimeType: 'audio/mpeg'
      }, { force: true });

      cy.get('input[id="track-title"]').type('Test Track');
      cy.get('input[id="track-artist"]').type('Test Artist');

      // Start upload
      cy.get('button').contains('Upload Track').click();

      // Check for progress announcement
      cy.get('[aria-live="polite"]').should('contain', 'Starting upload process');
    });
  });
});

describe('Authentication and Upload Tests', () => {
  beforeEach(() => {
    // Clear any existing authentication state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('Authentication Flow', () => {
    it('should login with valid credentials and show uploader', () => {
      // Mock successful authentication
      cy.intercept('POST', '/api/auth', {
        statusCode: 200,
        body: {
          success: true,
          token: 'mock-token-123',
          user: { email: 'dnbmashup1@gmail.com', role: 'agency' }
        }
      }).as('loginSuccess');

      // Visit the app
      cy.visit('/');

      // Should show login form
      cy.get('form').should('exist');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');

      // Fill in valid credentials
      cy.get('input[type="email"]').type('dnbmashup1@gmail.com');
      cy.get('input[type="password"]').type('DnB2024!Secure');

      // Submit login form
      cy.get('button[type="submit"]').click();

      // Wait for login request
      cy.wait('@loginSuccess');

      // Should show main app interface
      cy.get('[data-testid="music-library"]').should('exist');
      
      // Should show upload button for authenticated agency user
      cy.contains('Upload Track').should('be.visible');
      
      // Should show user profile with role
      cy.contains('dnbmashup1@gmail.com').should('be.visible');
      cy.contains('agency').should('be.visible');
    });

    it('should reject invalid credentials', () => {
      // Mock failed authentication
      cy.intercept('POST', '/api/auth', {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      }).as('loginFailure');

      cy.visit('/');

      // Fill in invalid credentials
      cy.get('input[type="email"]').type('invalid@example.com');
      cy.get('input[type="password"]').type('wrongpassword');

      // Submit login form
      cy.get('button[type="submit"]').click();

      // Wait for login request
      cy.wait('@loginFailure');

      // Should show error message
      cy.contains('Invalid credentials').should('be.visible');
      
      // Should still be on login page
      cy.get('form').should('exist');
      cy.get('input[type="email"]').should('be.visible');
    });

    it('should hide uploader for unauthorized users', () => {
      // Mock unauthorized user
      cy.intercept('GET', '/api/auth/current-user', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedUser');

      cy.visit('/');

      // Should not show upload button
      cy.contains('Upload Track').should('not.exist');
      
      // Should not show admin panel
      cy.get('[data-testid="admin-panel"]').should('not.exist');
    });
  });

  describe('Upload Functionality', () => {
    beforeEach(() => {
      // Mock authenticated user for upload tests
      cy.intercept('POST', '/api/auth', {
        statusCode: 200,
        body: {
          success: true,
          token: 'mock-token-123',
          user: { email: 'dnbmashup1@gmail.com', role: 'agency' }
        }
      }).as('loginSuccess');

      // Login first
      cy.visit('/');
      cy.get('input[type="email"]').type('dnbmashup1@gmail.com');
      cy.get('input[type="password"]').type('DnB2024!Secure');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginSuccess');
    });

    it('should allow file upload for authorized user', () => {
      // Mock successful upload
      cy.intercept('POST', '/api/upload', {
        statusCode: 200,
        body: {
          success: true,
          message: 'File uploaded successfully!',
          filename: 'test-track.mp3',
          size: 1024000,
          type: 'audio/mpeg'
        }
      }).as('uploadSuccess');

      // Click upload button
      cy.contains('Upload Track').click();

      // Should show upload modal/form
      cy.get('input[type="file"]').should('exist');

      // Create a test file
      const fileName = 'test-track.mp3';
      const fileContent = new Uint8Array(1024); // 1KB test file
      const file = new File([fileContent], fileName, { type: 'audio/mpeg' });

      // Select file
      cy.get('input[type="file"]').then(input => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input[0].files = dataTransfer.files;
      });

      // Fill in metadata
      cy.get('input[name="title"]').type('Test Track');
      cy.get('input[name="artist"]').type('Test Artist');
      cy.get('select[name="category"]').select('chill-gaming');
      cy.get('select[name="mood"]').select('chill');
      cy.get('input[name="energy"]').type('3');
      cy.get('input[name="bpm"]').type('120');

      // Submit upload
      cy.get('button[type="submit"]').click();

      // Wait for upload request
      cy.wait('@uploadSuccess');

      // Should show success message
      cy.contains('File uploaded successfully!').should('be.visible');
    });

    it('should reject upload from unauthorized user', () => {
      // Mock unauthorized upload attempt
      cy.intercept('POST', '/api/upload', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('uploadUnauthorized');

      // Try to upload without proper authentication
      cy.request({
        method: 'POST',
        url: '/api/upload',
        failOnStatusCode: false,
        body: {
          file: {
            name: 'test.mp3',
            type: 'audio/mpeg',
            size: 1024
          }
        }
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq('Unauthorized');
      });
    });

    it('should reject upload from user without upload rights', () => {
      // Mock user without upload rights
      cy.intercept('POST', '/api/upload', {
        statusCode: 403,
        body: { error: 'Forbidden: No upload rights' }
      }).as('uploadForbidden');

      // Try to upload with insufficient permissions
      cy.request({
        method: 'POST',
        url: '/api/upload',
        failOnStatusCode: false,
        headers: {
          'Authorization': 'Bearer invalid-token'
        },
        body: {
          file: {
            name: 'test.mp3',
            type: 'audio/mpeg',
            size: 1024
          }
        }
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body.error).to.contain('Forbidden');
      });
    });

    it('should validate file type and size', () => {
      // Mock file validation failure
      cy.intercept('POST', '/api/upload', {
        statusCode: 400,
        body: { error: 'Invalid file type. Only audio files allowed.' }
      }).as('uploadInvalidType');

      // Try to upload invalid file type
      cy.request({
        method: 'POST',
        url: '/api/upload',
        failOnStatusCode: false,
        headers: {
          'Authorization': 'Bearer mock-token-123'
        },
        body: {
          file: {
            name: 'test.txt',
            type: 'text/plain',
            size: 1024
          }
        }
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.contain('Invalid file type');
      });

      // Mock file size validation failure
      cy.intercept('POST', '/api/upload', {
        statusCode: 400,
        body: { error: 'File too large. Maximum size is 50MB.' }
      }).as('uploadTooLarge');

      // Try to upload oversized file
      cy.request({
        method: 'POST',
        url: '/api/upload',
        failOnStatusCode: false,
        headers: {
          'Authorization': 'Bearer mock-token-123'
        },
        body: {
          file: {
            name: 'large-track.mp3',
            type: 'audio/mpeg',
            size: 60 * 1024 * 1024 // 60MB
          }
        }
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.contain('File too large');
      });
    });

    it('should handle upload form validation', () => {
      // Click upload button
      cy.contains('Upload Track').click();

      // Try to submit without required fields
      cy.get('button[type="submit"]').click();

      // Should show validation errors
      cy.get('input[name="title"]:invalid').should('exist');
      cy.get('input[name="artist"]:invalid').should('exist');

      // Should not proceed with upload
      cy.url().should('not.contain', 'upload');
    });
  });

  describe('Session Management', () => {
    it('should persist authentication across page refreshes', () => {
      // Mock successful login
      cy.intercept('POST', '/api/auth', {
        statusCode: 200,
        body: {
          success: true,
          token: 'mock-token-123',
          user: { email: 'dnbmashup1@gmail.com', role: 'agency' }
        }
      }).as('loginSuccess');

      // Mock token verification
      cy.intercept('GET', '/api/auth', {
        statusCode: 200,
        body: {
          success: true,
          user: { email: 'dnbmashup1@gmail.com', role: 'agency' }
        }
      }).as('verifyToken');

      // Login
      cy.visit('/');
      cy.get('input[type="email"]').type('dnbmashup1@gmail.com');
      cy.get('input[type="password"]').type('DnB2024!Secure');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginSuccess');

      // Verify we're logged in
      cy.contains('dnbmashup1@gmail.com').should('be.visible');

      // Refresh the page
      cy.reload();

      // Should still be logged in
      cy.contains('dnbmashup1@gmail.com').should('be.visible');
      cy.contains('Upload Track').should('be.visible');
    });

    it('should logout and clear session', () => {
      // Mock successful login
      cy.intercept('POST', '/api/auth', {
        statusCode: 200,
        body: {
          success: true,
          token: 'mock-token-123',
          user: { email: 'dnbmashup1@gmail.com', role: 'agency' }
        }
      }).as('loginSuccess');

      // Mock logout
      cy.intercept('DELETE', '/api/auth', {
        statusCode: 200,
        body: { success: true }
      }).as('logoutSuccess');

      // Login
      cy.visit('/');
      cy.get('input[type="email"]').type('dnbmashup1@gmail.com');
      cy.get('input[type="password"]').type('DnB2024!Secure');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginSuccess');

      // Click logout
      cy.contains('Logout').click();
      cy.wait('@logoutSuccess');

      // Should return to login page
      cy.get('form').should('exist');
      cy.get('input[type="email"]').should('be.visible');
      cy.contains('Upload Track').should('not.exist');
    });
  });
});












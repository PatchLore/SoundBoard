import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleGuard from '../../components/RoleGuard';
import { UserRole } from '../../types/agency';

// Mock data for testing
const mockStreamerRole: UserRole = {
  type: 'streamer',
  permissions: ['manage_playlists'],
  userId: 'streamer-1',
  agencyId: 'agency-1'
};

const mockAgencyRole: UserRole = {
  type: 'agency',
  permissions: [
    'upload_tracks',
    'manage_users',
    'customize_branding',
    'view_analytics'
  ],
  userId: 'agency-user-1',
  agencyId: 'agency-1'
};

describe('RoleGuard Component', () => {
  describe('Role-Based Access Control', () => {
    test('should render children when user has allowed role', () => {
      render(
        <RoleGuard userRole={mockAgencyRole} allowedRoles={['agency']}>
          <div data-testid="agency-content">Agency Content</div>
        </RoleGuard>
      );

      expect(screen.getByTestId('agency-content')).toBeInTheDocument();
      expect(screen.getByText('Agency Content')).toBeInTheDocument();
    });

    test('should not render children when user lacks required role', () => {
      render(
        <RoleGuard userRole={mockStreamerRole} allowedRoles={['agency']}>
          <div data-testid="agency-content">Agency Content</div>
        </RoleGuard>
      );

      expect(screen.queryByTestId('agency-content')).not.toBeInTheDocument();
    });

    test('should render fallback when user lacks required role', () => {
      render(
        <RoleGuard 
          userRole={mockStreamerRole} 
          allowedRoles={['agency']}
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="agency-content">Agency Content</div>
        </RoleGuard>
      );

      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByTestId('agency-content')).not.toBeInTheDocument();
    });

    test('should render nothing when no fallback is provided', () => {
      const { container } = render(
        <RoleGuard userRole={mockStreamerRole} allowedRoles={['agency']}>
          <div data-testid="agency-content">Agency Content</div>
        </RoleGuard>
      );

      expect(container.firstChild).toBeNull();
    });

    test('should support multiple allowed roles', () => {
      render(
        <RoleGuard userRole={mockAgencyRole} allowedRoles={['agency', 'admin']}>
          <div data-testid="multi-role-content">Multi-Role Content</div>
        </RoleGuard>
      );

      expect(screen.getByTestId('multi-role-content')).toBeInTheDocument();
    });

    test('should work with streamer roles', () => {
      render(
        <RoleGuard userRole={mockStreamerRole} allowedRoles={['streamer']}>
          <div data-testid="streamer-content">Streamer Content</div>
        </RoleGuard>
      );

      expect(screen.getByTestId('streamer-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty allowedRoles array', () => {
      render(
        <RoleGuard userRole={mockAgencyRole} allowedRoles={[]}>
          <div data-testid="content">Content</div>
        </RoleGuard>
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    test('should handle undefined fallback', () => {
      const { container } = render(
        <RoleGuard 
          userRole={mockStreamerRole} 
          allowedRoles={['agency']}
          fallback={undefined}
        >
          <div data-testid="content">Content</div>
        </RoleGuard>
      );

      expect(container.firstChild).toBeNull();
    });

    test('should handle complex children components', () => {
      const ComplexComponent = () => (
        <div>
          <h1>Complex Title</h1>
          <p>Complex description</p>
          <button>Complex Button</button>
        </div>
      );

      render(
        <RoleGuard userRole={mockAgencyRole} allowedRoles={['agency']}>
          <ComplexComponent />
        </RoleGuard>
      );

      expect(screen.getByText('Complex Title')).toBeInTheDocument();
      expect(screen.getByText('Complex description')).toBeInTheDocument();
      expect(screen.getByText('Complex Button')).toBeInTheDocument();
    });
  });

  describe('Permission Integration', () => {
    test('should work with users having multiple permissions', () => {
      const multiPermissionUser: UserRole = {
        type: 'agency',
        permissions: ['upload_tracks', 'manage_users', 'customize_branding'],
        userId: 'multi-perm-user',
        agencyId: 'agency-1'
      };

      render(
        <RoleGuard userRole={multiPermissionUser} allowedRoles={['agency']}>
          <div data-testid="multi-perm-content">Multi Permission Content</div>
        </RoleGuard>
      );

      expect(screen.getByTestId('multi-perm-content')).toBeInTheDocument();
    });

    test('should handle users without permissions array', () => {
      const noPermissionsUser: UserRole = {
        type: 'streamer',
        permissions: [],
        userId: 'no-perm-user',
        agencyId: 'agency-1'
      };

      render(
        <RoleGuard userRole={noPermissionsUser} allowedRoles={['streamer']}>
          <div data-testid="no-perm-content">No Permission Content</div>
        </RoleGuard>
      );

      expect(screen.getByTestId('no-perm-content')).toBeInTheDocument();
    });
  });
});


import React from 'react';
import { RoleGuardProps } from '../types/agency';

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  userRole, 
  allowedRoles, 
  children, 
  fallback = null 
}) => {
  if (!allowedRoles.includes(userRole.type)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default RoleGuard;


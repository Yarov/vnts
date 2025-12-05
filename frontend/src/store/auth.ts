import { atomWithStorage } from 'jotai/utils';

// Tipos
export type UserRole = 'admin' | 'seller';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  organizationId?: string;
  branchId?: string;
  activeBranchId?: string;  // Sucursal activa para la sesión del vendedor
  activeBranchName?: string;  // Nombre de la sucursal activa
}

// Atom para el usuario actual con persistencia en localStorage
export const userAtom = atomWithStorage<User | null>('vnts-user', null);

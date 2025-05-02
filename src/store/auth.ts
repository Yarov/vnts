import { atomWithStorage } from 'jotai/utils';

// Tipos
export type UserRole = 'admin' | 'seller';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

// Atom para el usuario actual con persistencia en localStorage
export const userAtom = atomWithStorage<User | null>('vnts-user', null);

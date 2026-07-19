export type UserRole = 'admin' | 'site_engineer';
export type UserStatus = 'active' | 'inactive';

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  assignedProjects?: string[];
  createdAt?: string;
}

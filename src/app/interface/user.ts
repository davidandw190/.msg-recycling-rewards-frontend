/**
 * Represents the structure of a User object.
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  address?: string;
  phone?: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
  notificationsEnabled: string;
  enabled: boolean;
  notLocked: boolean;
  usingMfa: boolean;
  createdAt?: Date;
  roleName: string;
  permissions: string;
}

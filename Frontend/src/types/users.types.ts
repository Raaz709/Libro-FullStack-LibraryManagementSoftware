export interface UserAdmin {
  id: number;
  roleId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  passwordHash?: string;
  status: string;
  membershipNumber: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  roleId: number;
  status: string;
}

export interface UpdateUserPayload {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  roleId: number;
  status: string;
}
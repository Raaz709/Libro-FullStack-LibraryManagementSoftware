export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
}

export type RoleName = "Student" | "Faculty" | "Librarian" | "Admin";

// Raw shape of the decoded JWT payload - matches ASP.NET Core's
// default long-form ClaimTypes URIs
export interface RawDecodedToken {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": RoleName;
  exp: number;
  iss: string;
  aud: string;
}

// Clean shape the rest of the app actually uses
export interface DecodedUser {
  userId: number;
  email: string;
  role: RoleName;
  exp: number;
  firstName?: string;
  lastName?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message: string;
  userId: number;
}

export interface RawDecodedToken {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": RoleName;
  exp: number;
  iss: string;
  aud: string;
}

export enum Role {
  SURVEY_MANAGER= 'SURVEY_MANAGER',
  PLATFORM_ADMIN= 'PLATFORM_ADMIN',
  PARTICIPANT= 'PARTICIPANT'
}


export interface AuthResponseUser {
  userId: string;
  email: string;
  name: string;
  role: Role; 
}

export interface AdminUserView {
    userId: string;
    email: string;
    name: string;
    firstName?: string | null; // Optional string or null
    lastName?: string | null;  // Optional string or null
    role: Role;
    isActive: boolean;        // Assuming this is always returned for admin view
    lastLogin?: string | null; // Date comes as string | null from JSON
    createdAt: string;        // Date comes as string from JSON
    updatedAt: string;        // Date comes as string from JSON
}
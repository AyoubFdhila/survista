export enum Role {
  SURVEY_MANAGER= 'SURVEY_MANAGER',
  PLATFORM_ADMIN= 'PLATFORM_ADMIN',
  PARTICIPANT= 'PARTICIPANT'
}


export interface AuthResponseUser {
  userId: string;
  email: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  role: Role; 
}

export interface AdminUserView {
    userId: string;
    email: string;
    name: string;
    firstName?: string | null; 
    lastName?: string | null;  
    role: Role;
    isActive: boolean;       
    lastLogin?: string | null; 
    createdAt: string;        
    updatedAt: string;       
}
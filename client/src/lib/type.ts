export enum Role {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  USER = "USER",
}


export interface AuthResponseUser {
  userId: string;
  email: string;
  name: string;
  role: Role; 
}
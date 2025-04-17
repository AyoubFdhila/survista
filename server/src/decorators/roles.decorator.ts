import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client'; 

export const ROLES_KEY = 'roles';

/**
 * Custom decorator to assign required roles to a route handler.
 * Example usage: @Roles(Role.PLATFORM_ADMIN, Role.SURVEY_MANAGER)
 * @param roles - One or more Role enum values allowed to access the route.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);


/**
 * Custom decorator to mark a route handler as public, bypassing authentication checks.
 * Example usage: @Public()
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
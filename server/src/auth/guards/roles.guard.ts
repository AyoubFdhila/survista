// server/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client'; // Import your Role enum
import { ROLES_KEY } from 'src/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the @Roles() decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),  
    ]);

    // If no @Roles() decorator is applied, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user object from the request
    // JwtAuthGuard ran first and attached user to request
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      return false;
    }

    // Check if the user's role matches any of the required roles
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    return hasRequiredRole;
  }
}
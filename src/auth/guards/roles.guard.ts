import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

        // Si no se define @Roles(), DENEGAR acceso
        if (!requiredRoles || requiredRoles.length === 0) {
            throw new ForbiddenException('No role specified for this route');
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('User role not found');
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException(`Access denied for role: ${user.role}`);
        }

        return true;
    }
}

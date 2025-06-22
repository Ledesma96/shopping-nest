import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true; // Si no se define @Roles() en el endpoint, permite el acceso
        }
        const { user } = context.switchToHttp().getRequest();
        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Insufficient permissions');
        }
        return true;
    }
}

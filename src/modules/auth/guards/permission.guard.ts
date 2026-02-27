import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  // Check if the user has the required permissions
  private matchPermissions = (
    permissions: string[],
    userPermissions: string[],
    request: any,
    decodedToken: any,
  ): boolean => {
    for (const permission of permissions) {
      const userPermission = userPermissions.find((p) =>
        p.startsWith(permission),
      );

      if (userPermission) {
        if (userPermission.endsWith('.any')) {
          return true;
        } else if (userPermission.endsWith('.own')) {
          // Update the request with ownedBy field
          request.ownedBy = new Types.ObjectId(decodedToken.sub);
          return true;
        }
      }
    }
    return false;
  };

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!permissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }
    const decodedToken = this.jwtService.decode(token);

    const userPermissions = decodedToken['permissions'] || [];

    // Check if the user has the required permissions
    return this.matchPermissions(
      permissions,
      userPermissions,
      request,
      decodedToken,
    );
  }
}

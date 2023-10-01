import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/** Services */
import { UsersService } from 'src/security/users/users.service';
import { userPermissionCodeName } from '../utils/util';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    const userData = await this.usersService.findByEmail(user.email);

    const userPermissions = await userPermissionCodeName(userData.roles);

    if (!userPermissions.includes(requiredPermissions[0])) return false;

    return true;
  }
}

import { Injectable } from '@nestjs/common';

/** Services */
import { PermissionsService } from 'src/security/permissions/permissions.service';
import { RolesService } from 'src/security/roles/roles.service';
import { UsersService } from 'src/security/users/users.service';

@Injectable()
export class SeedService {
  public constructor(
    private readonly permissionsService: PermissionsService,
    private readonly rolesServices: RolesService,
    private readonly usersServices: UsersService,
  ) {}

  public async seed() {
    await this.permissionsService.seed();
    await this.rolesServices.seed();
    await this.usersServices.seed();
  }
}

import { Module } from '@nestjs/common';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PermissionsModule, RolesModule, UsersModule, AuthModule],
  providers: [],
  exports: [PermissionsModule, RolesModule, UsersModule, AuthModule],
})
export class SecurityModule {}

import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

/** Services */
import { AuthService } from './auth.service';

/** Controllers */
import { AuthController } from './auth.controller';

/** Guards & Strategies */
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { PermissionsGuard } from './guards/permissions.guard';

/** Modules */
import { UsersModule } from '../users/users.module';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    PermissionsGuard,
  ],
})
@Global()
export class AuthModule {}

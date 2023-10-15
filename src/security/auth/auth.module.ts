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

/** Custom Validators */
import { PasswordMatchesValidator } from './validators/password-matches.validator';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    PermissionsGuard,
    PasswordMatchesValidator,
  ],
})
@Global()
export class AuthModule {}

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

/** DTOs */
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

/** Guards */
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

/** Services */
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(@Body() data: AuthDto, @Req() req: Request) {
    return await this.authService.signIn(data, req.res);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    return this.authService.logout(req.user['id'], req.res);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh-token')
  async refreshTokens(@Req() req: Request) {
    const email = req.user['email'];
    const refreshToken = req.cookies.refresh_token;

    return this.authService.refreshToken(email, refreshToken, req.res);
  }

  @UseGuards(AccessTokenGuard)
  @Post('change-password')
  async changePassword(@Body() data: ChangePasswordDto, @Req() req: Request) {
    return await this.authService.changePassword(data, req.user['id'], req.res);
  }
}

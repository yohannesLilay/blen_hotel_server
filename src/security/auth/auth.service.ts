import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** Entities */
import { User } from '../users/entities/user.entity';

/** 3rd Party Imports */
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

/** DTOs */
import { AuthDto } from './dto/auth.dto';

/** Services */
import { UsersService } from '../users/users.service';

/** Util */
import { parseTimeToMilliseconds, userPermissionCodeName } from './utils/util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(data: AuthDto, res: any) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user)
      throw new BadRequestException(
        'Unable to authenticate with provided credentials.',
      );

    if (!user.status)
      throw new BadRequestException(
        'Your account is not active.Please contact the administrator!',
      );

    const passwordMatches = await this.compareData(
      data.password,
      user.password,
    );
    if (!passwordMatches)
      throw new BadRequestException(
        'Unable to authenticate with provided credentials.',
      );

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    await this.updateRefreshToken(user.id, refreshToken);
    await this.setLastLogin(user.id);
    await this.setAuthCookies(res, accessToken, refreshToken);

    res.status(200);
    return {
      statusCode: 200,
      message: 'Logged in successfully',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((role) => role.name),
        permissions: await userPermissionCodeName(user.roles),
      },
    };
  }

  async logout(userId: number, res: any) {
    await this.updateRefreshToken(userId, null);
    await this.clearAuthCookies(res);

    res.status(200);
    return { statusCode: 200, message: 'Logged out successfully.' };
  }

  async refreshToken(email: string, refreshToken: string, res: any) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.refresh_token)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await this.compareData(
      refreshToken,
      user.refresh_token,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const accessToken = await this.generateAccessToken(user);

    await this.updateRefreshToken(user.id, refreshToken);
    await this.setAuthCookies(res, accessToken, refreshToken);

    res.status(200);
    return { statusCode: 200, message: 'Token Updated successfully.' };
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    if (refreshToken === null)
      await this.usersService.updateRefreshToken(userId, null);
    else {
      const hashedRefreshToken = await this.hashData(refreshToken);
      await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
    }
  }

  async setLastLogin(userId: number) {
    await this.usersService.setLastLogin(userId);
  }

  async generateAccessToken(user: User) {
    const payload = { id: user.id, email: user.email };
    return await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
  }

  async generateRefreshToken(user: User) {
    const payload = { id: user.id, email: user.email };
    return await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
  }

  async setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: parseTimeToMilliseconds(process.env.ACCESS_TOKEN_EXPIRATION),
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: parseTimeToMilliseconds(process.env.REFRESH_TOKEN_EXPIRATION),
    });
  }

  async clearAuthCookies(res: any) {
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      expires: new Date(0),
    });
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      expires: new Date(0),
    });
  }

  async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUND));

    return await bcrypt.hash(data, salt);
  }

  async compareData(value1, value2): Promise<boolean> {
    return await bcrypt.compare(value1, value2);
  }
}

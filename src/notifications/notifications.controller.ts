import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

/** Guards and Decorators */
import { AccessTokenGuard } from 'src/security/auth/guards/access-token.guard';
import { PermissionsGuard } from 'src/security/auth/guards/permissions.guard';
import { Permissions } from 'src/security/auth/decorators/permissions.decorator';
import { User } from 'src/security/auth/decorators/user.decorator';

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('excludeRead', ParseBoolPipe) excludeRead = true,
    @User('id', ParseIntPipe) userId: number,
  ) {
    return this.notificationsService.findAll(page, limit, excludeRead, +userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch('mark-as-read')
  markAsRead(@Body() notificationIds: number[]) {
    return this.notificationsService.markAsRead(notificationIds);
  }

  @Delete(':id')
  @Permissions('delete_notification')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}

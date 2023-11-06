import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { NotificationsService } from './notifications.service';

/** Controllers */
import { NotificationsController } from './notifications.controller';

/** Entities */
import { Notification } from './entities/notification.entity';

/** Modules */
import { UsersModule } from 'src/security/users/users.module';

/** Custom Validations */
import { ValidRecipientValidator } from './validators/valid-recipient.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), UsersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, ValidRecipientValidator],
  exports: [NotificationsService],
})
export class NotificationsModule {}

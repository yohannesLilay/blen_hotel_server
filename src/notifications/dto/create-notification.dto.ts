import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import { NotificationType } from '../constants/notification-type.enum';
import { ValidRecipientValidator } from '../validators/valid-recipient.validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Validate(ValidRecipientValidator)
  recipient: number;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  notification_type: NotificationType;
}

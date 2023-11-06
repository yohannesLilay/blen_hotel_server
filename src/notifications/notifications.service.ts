import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

/** DTOs */
import { CreateNotificationDto } from './dto/create-notification.dto';

/** Entities */
import { Notification } from './entities/notification.entity';

/** Services */
import { UsersService } from 'src/security/users/users.service';

/** Constants*/
import { NotificationType } from './constants/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      message: createNotificationDto.message,
      notification_type: createNotificationDto.notification_type,
      read: false,
    });
    notification.recipient = await this.usersService.findOne(
      createNotificationDto.recipient,
    );

    return await this.notificationRepository.save(notification);
  }

  async findAll(
    page: number,
    limit: number,
    excludeRead: boolean,
    userId: number,
  ): Promise<{
    notifications: Notification[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .orderBy('notification.id', 'DESC')
      .where('notification.recipientId = :userId', { userId });

    if (excludeRead) queryBuilder.andWhere('notification.read = false');

    const [notifications, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { notifications, total, currentPage, totalPages };
  }

  async template() {
    return { notificationTypeOptions: NotificationType };
  }

  async findOne(id: number): Promise<Notification> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  async findByIds(notificationIds: number[]): Promise<Notification[]> {
    return await this.notificationRepository.findBy({
      id: In(notificationIds),
    });
  }

  async markAsRead(ids: number[]): Promise<Notification[]> {
    const notifications = await this.findByIds(ids);

    if (notifications.length === 0)
      throw new NotFoundException('Notifications not found.');

    notifications.forEach((notification) => {
      notification.read = true;
    });

    return await this.notificationRepository.save(notifications);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    if (!notification) throw new NotFoundException('Notification not found.');

    await this.notificationRepository.remove(notification);
  }
}

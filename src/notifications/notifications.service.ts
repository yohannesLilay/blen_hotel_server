import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

/** DTOs */
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MarkNotificationAsReadDto } from './dto/mark-notification-as-read.dto';

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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        relations: ['recipient'],
        where: {
          recipient: { id: userId },
          ...(excludeRead ? { read: false } : {}),
          created_at: MoreThanOrEqual(thirtyDaysAgo),
        },
        order: { id: 'DESC' },
        skip,
        take: limit,
      });

    const currentPage = page;
    const totalPages = Math.ceil(total / limit);

    return { notifications, total, currentPage, totalPages };
  }

  async template() {
    return { notificationTypeOptions: NotificationType };
  }

  async getUnreadCount(userId: number): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.notificationRepository.count({
      where: {
        read: false,
        recipient: { id: userId },
        created_at: MoreThanOrEqual(thirtyDaysAgo),
      },
    });
  }

  async findOne(id: number): Promise<Notification> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  async findByIds(notificationIds: number[]): Promise<Notification[]> {
    return await this.notificationRepository.findBy({
      id: In(notificationIds),
    });
  }

  async markAsRead(
    markNotificationAsReadDto: MarkNotificationAsReadDto,
  ): Promise<Notification[]> {
    const notifications = await this.findByIds(
      markNotificationAsReadDto.notification_ids,
    );

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

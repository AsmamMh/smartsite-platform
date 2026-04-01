import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notifModel: Model<Notification>,
  ) {}

  async getAllNotifications() {
    return await this.notifModel.find().exec();
  }

  async getNotificationsByRecipientId(recipientId: string) {
    return await this.notifModel.find({ recipentId: recipientId }).exec();
  }

  async getNotiFicationByUserId(userId: string) {
    return await this.getNotificationsByRecipientId(userId);
  }

  async getNotificationsByTeamId(teamId: string) {
    return await this.getNotificationsByRecipientId(teamId);
  }

  async createNotification(notification: Partial<Notification>) {
    const newNotification = new this.notifModel(notification);
    return await newNotification.save();
  }

  async markAsRead(notificationId: string) {
    return await this.notifModel.findByIdAndUpdate(notificationId, {
      isRead: true,
    });
  }

  async deleteNotificationById(notificationId: string) {
    return await this.notifModel.findByIdAndDelete(notificationId);
  }

  async getUnreadNotificationsByUserId(userId: string) {
    return await this.notifModel
      .find({ recipentId: userId, isRead: false })
      .exec();
  }

  async getUnreadNotificationsByTeamId(teamId: string) {
    return await this.notifModel
      .find({ recipentId: teamId, isRead: false })
      .exec();
  }

  async getReadNotificationsByUserId(userId: string) {
    return await this.notifModel
      .find({ recipentId: userId, isRead: true })
      .exec();
  }

  async getReadNotificationsByTeamId(teamId: string) {
    return await this.notifModel
      .find({ recipentId: teamId, isRead: true })
      .exec();
  }

  async getUnreadNotificationLengthByserId(userId: string) {
    return await this.notifModel
      .countDocuments({ recipentId: userId, isRead: false })
      .exec();
  }

  async getUnreadNotificationLengthByTeamId(teamId: string) {
    return await this.notifModel
      .countDocuments({ recipentId: teamId, isRead: false })
      .exec();
  }
}

import { Injectable } from '@nestjs/common';
import { BaseConsumer } from '../kafka.consumer';
import { EachMessagePayload } from 'kafkajs';
import { KAFKA_TOPICS } from '../topics';
import { NotificationSendEvent } from '../../types';

@Injectable()
export class NotificationConsumer extends BaseConsumer {
  constructor() {
    super(
      process.env.KAFKA_GROUP_ID
        ? process.env.KAFKA_GROUP_ID + '-notification'
        : 'sv-consumer-notification',
      [
        KAFKA_TOPICS.NOTIFICATION_SEND,
        KAFKA_TOPICS.BROADCAST_POPUP_SEND,
        KAFKA_TOPICS.ORDER_STATUS_UPDATED,
      ],
    );
  }

  // Assuming firebaseAdmin is injected or globally available for this mock
  private firebaseAdmin: any = {
    messaging: () => ({
      sendMulticast: async (data: any) => {
        console.log('Mock FCM Send:', data);
      },
    }),
  };

  async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
    if (!message.value) return;
    const payload = JSON.parse(message.value.toString());

    switch (topic) {
      case KAFKA_TOPICS.NOTIFICATION_SEND: {
        const notificationEvent = payload as NotificationSendEvent;
        this.logger.log(
          `Dispatching push notification to ${notificationEvent.fcmTokens.length} tokens: ${notificationEvent.title}`,
        );
        break;
      }

      case KAFKA_TOPICS.BROADCAST_POPUP_SEND: {
        await this.firebaseAdmin.messaging().sendMulticast({
          tokens: payload.fcmTokens,
          data: {
            type: 'popup_message',
            id: payload.messageId,
            title: payload.title,
            body: payload.body,
            messageType: payload.type,
            isDismissable: String(payload.isDismissable),
            actionLabel: payload.actionLabel ?? '',
            actionUrl: payload.actionUrl ?? '',
          },
          android: { priority: 'high' },
          apns: { payload: { aps: { contentAvailable: true } } },
        });
        break;
      }

      case KAFKA_TOPICS.ORDER_STATUS_UPDATED: {
        if (payload.fcmToken) {
          await this.firebaseAdmin.messaging().send({
            token: payload.fcmToken,
            notification: {
              title: 'Order Update',
              body: `Your order #${payload.orderId} is now ${payload.newStatus}`,
            },
            data: { type: 'order', orderId: String(payload.orderId) },
          });
        }
        break;
      }
    }
  }
}

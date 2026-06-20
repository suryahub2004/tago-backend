"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafka_consumer_1 = require("../kafka.consumer");
const topics_1 = require("../topics");
let NotificationConsumer = class NotificationConsumer extends kafka_consumer_1.BaseConsumer {
    constructor() {
        super(process.env.KAFKA_GROUP_ID
            ? process.env.KAFKA_GROUP_ID + '-notification'
            : 'sv-consumer-notification', [
            topics_1.KAFKA_TOPICS.NOTIFICATION_SEND,
            topics_1.KAFKA_TOPICS.BROADCAST_POPUP_SEND,
            topics_1.KAFKA_TOPICS.ORDER_STATUS_UPDATED,
        ]);
    }
    firebaseAdmin = {
        messaging: () => ({
            sendMulticast: async (data) => {
                console.log('Mock FCM Send:', data);
            },
        }),
    };
    async handleMessage({ topic, message }) {
        if (!message.value)
            return;
        const payload = JSON.parse(message.value.toString());
        switch (topic) {
            case topics_1.KAFKA_TOPICS.NOTIFICATION_SEND: {
                const notificationEvent = payload;
                this.logger.log(`Dispatching push notification to ${notificationEvent.fcmTokens.length} tokens: ${notificationEvent.title}`);
                break;
            }
            case topics_1.KAFKA_TOPICS.BROADCAST_POPUP_SEND: {
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
            case topics_1.KAFKA_TOPICS.ORDER_STATUS_UPDATED: {
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
};
exports.NotificationConsumer = NotificationConsumer;
exports.NotificationConsumer = NotificationConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], NotificationConsumer);
//# sourceMappingURL=notification.consumer.js.map
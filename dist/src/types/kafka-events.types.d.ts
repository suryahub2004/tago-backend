export interface KafkaEventBase {
    eventId: string;
    occurredAt: string;
    version: string;
}
export interface UserRegisteredEvent extends KafkaEventBase {
    userId: string;
    name: string;
    email: string;
    role: string;
    deviceType?: string;
}
export interface OrderCreatedEvent extends KafkaEventBase {
    orderId: string;
    userId: string;
    userName: string;
    userEmail: string;
    totalAmount: number;
    itemCount: number;
    paymentMethod: string;
    products: {
        name: string;
        quantity: number;
        price: number;
    }[];
}
export interface OrderStatusChangedEvent extends KafkaEventBase {
    orderId: string;
    userId: string;
    previousStatus: string;
    newStatus: string;
    trackingNumber?: string;
}
export interface DevicePairedEvent extends KafkaEventBase {
    deviceId: string;
    userId: string;
    userName: string;
    deviceType: string;
    deviceSerial: string;
    firmwareVersion: string;
}
export interface DeviceSyncedEvent extends KafkaEventBase {
    deviceId: string;
    userId: string;
    deviceType: string;
    batteryLevel: number;
    readingsCount: number;
}
export interface VitalsBatchUploadedEvent extends KafkaEventBase {
    userId: string;
    deviceId: string;
    deviceType: string;
    readingsCount: number;
    metricTypes: string[];
    latestReadings: Record<string, number>;
}
export interface AlertTriggeredEvent extends KafkaEventBase {
    alertId: string;
    userId: string;
    userName: string;
    alertType: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    metricValue: number;
    threshold: number;
    parentUserIds: string[];
    fcmTokens: string[];
}
export interface NotificationSendEvent extends KafkaEventBase {
    fcmTokens: string[];
    title: string;
    body: string;
    data: Record<string, string>;
    priority: 'normal' | 'high';
    collapseKey?: string;
}

export declare enum UserRole {
    SUPERADMIN = "SUPERADMIN",
    SUPPORT_ADMIN = "SUPPORT_ADMIN",
    ANALYTICS_ADMIN = "ANALYTICS_ADMIN",
    USER = "USER",
    PARENT = "PARENT"
}
export declare enum DeviceType {
    SMART_RING = "SMART_RING",
    WHOOP_BAND = "WHOOP_BAND"
}
export declare enum DeviceStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    UNPAIRED = "UNPAIRED"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum AlertSeverity {
    INFO = "INFO",
    WARNING = "WARNING",
    CRITICAL = "CRITICAL"
}
export declare enum AlertType {
    HIGH_HR = "HIGH_HR",
    LOW_HR = "LOW_HR",
    LOW_SPO2 = "LOW_SPO2",
    INACTIVITY = "INACTIVITY",
    DEVICE_BATTERY = "DEVICE_BATTERY",
    SLEEP_MISSED = "SLEEP_MISSED",
    TEMPERATURE_SPIKE = "TEMPERATURE_SPIKE"
}
export declare enum FamilyPermission {
    FULL = "FULL",
    VITALS_ONLY = "VITALS_ONLY",
    NONE = "NONE"
}
export * from './kafka-events.types';

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyPermission = exports.AlertType = exports.AlertSeverity = exports.OrderStatus = exports.DeviceStatus = exports.DeviceType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPERADMIN"] = "SUPERADMIN";
    UserRole["SUPPORT_ADMIN"] = "SUPPORT_ADMIN";
    UserRole["ANALYTICS_ADMIN"] = "ANALYTICS_ADMIN";
    UserRole["USER"] = "USER";
    UserRole["PARENT"] = "PARENT";
})(UserRole || (exports.UserRole = UserRole = {}));
var DeviceType;
(function (DeviceType) {
    DeviceType["SMART_RING"] = "SMART_RING";
    DeviceType["WHOOP_BAND"] = "WHOOP_BAND";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
var DeviceStatus;
(function (DeviceStatus) {
    DeviceStatus["ACTIVE"] = "ACTIVE";
    DeviceStatus["INACTIVE"] = "INACTIVE";
    DeviceStatus["UNPAIRED"] = "UNPAIRED";
})(DeviceStatus || (exports.DeviceStatus = DeviceStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "INFO";
    AlertSeverity["WARNING"] = "WARNING";
    AlertSeverity["CRITICAL"] = "CRITICAL";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertType;
(function (AlertType) {
    AlertType["HIGH_HR"] = "HIGH_HR";
    AlertType["LOW_HR"] = "LOW_HR";
    AlertType["LOW_SPO2"] = "LOW_SPO2";
    AlertType["INACTIVITY"] = "INACTIVITY";
    AlertType["DEVICE_BATTERY"] = "DEVICE_BATTERY";
    AlertType["SLEEP_MISSED"] = "SLEEP_MISSED";
    AlertType["TEMPERATURE_SPIKE"] = "TEMPERATURE_SPIKE";
})(AlertType || (exports.AlertType = AlertType = {}));
var FamilyPermission;
(function (FamilyPermission) {
    FamilyPermission["FULL"] = "FULL";
    FamilyPermission["VITALS_ONLY"] = "VITALS_ONLY";
    FamilyPermission["NONE"] = "NONE";
})(FamilyPermission || (exports.FamilyPermission = FamilyPermission = {}));
__exportStar(require("./kafka-events.types"), exports);
//# sourceMappingURL=index.js.map
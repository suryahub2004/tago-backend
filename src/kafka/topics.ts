export const KAFKA_TOPICS = {
  // User lifecycle
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  USER_DEACTIVATED: 'user.deactivated',

  // Order lifecycle
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status.changed',
  ORDER_CANCELLED: 'order.cancelled',

  // Device lifecycle
  DEVICE_PAIRED: 'device.paired',
  DEVICE_SYNCED: 'device.synced',
  DEVICE_UNPAIRED: 'device.unpaired',
  DEVICE_LOW_BATTERY: 'device.low_battery',

  // Health vitals
  VITALS_BATCH_UPLOADED: 'vitals.batch.uploaded', // triggers alert evaluation
  VITALS_ANOMALY: 'vitals.anomaly', // produced by alert evaluator

  // Alerts
  ALERT_TRIGGERED: 'alert.triggered', // alert created in DB -> notify
  ALERT_ACKNOWLEDGED: 'alert.acknowledged',

  // Family
  FAMILY_INVITE_SENT: 'family.invite.sent',
  FAMILY_MEMBER_JOINED: 'family.member.joined',

  // Notifications (outbox pattern)
  NOTIFICATION_SEND: 'notification.send', // consumed by FCM dispatcher

  // Workout
  WORKOUT_PLAN_CREATED: 'workout.plan.created',
  WORKOUT_PLAN_COMPLETED: 'workout.plan.completed', // 100% completion reached
  WORKOUT_LOGGED: 'workout.logged',

  // Meditation
  MEDITATION_SESSION_DONE: 'meditation.session.completed',

  // AI Coach
  AI_INSIGHT_GENERATED: 'ai.insight.generated',

  // Devices extensions
  DEVICE_FIRMWARE_UPDATED: 'device.firmware.updated',

  // Family extensions
  FAMILY_PERMISSION_CHANGED: 'family.permission.changed',

  // Broadcast & V4 Additions
  BROADCAST_POPUP_SEND: 'broadcast.popup.send',
  ORDER_STATUS_UPDATED: 'order.status.updated',
  DEVICE_INFO_UPDATED: 'device.info.updated',
  REPORT_GENERATED: 'report.generated',
} as const;

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationChannel = 'in_app' | 'email' | 'sms';

export type NotificationStatus = 'queued' | 'sending' | 'delivered' | 'failed' | 'retry';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject?: string;
  body: string;
  channels: NotificationChannel[];
  variables: string[];
  isActive: boolean;
}

export interface NotificationRecipient {
  id: string;
  email?: string;
  phone?: string;
  userId?: string;
  preferredChannels: NotificationChannel[];
}

export interface NotificationMessage {
  id: string;
  templateId?: string;
  type: NotificationType;
  title: string;
  body: string;
  channels: NotificationChannel[];
  recipients: NotificationRecipient[];
  scheduledAt?: Date;
  createdAt: Date;
  status: NotificationStatus;
  retryCount: number;
  metadata?: Record<string, any>;
  sourceModule: string;
}

export interface NotificationDeliveryLog {
  id: string;
  messageId: string;
  recipientId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  deliveredAt?: Date;
  failureReason?: string;
  retryCount: number;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  eventType: string;
  channels: NotificationChannel[];
  isEnabled: boolean;
  preferences: Record<string, any>;
}

export interface NotificationEvent {
  type: string;
  payload: Record<string, any>;
  sourceModule: string;
  timestamp: Date;
}
interface Notification {
  hashId: string;
  message: string;
  url: string;
  createdAt: string;
}

export type NotificationsGetResponse = { notifications: Notification[] };

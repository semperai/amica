export type NotificationType = 'success' | 'error';
export type Notification = {
  type: NotificationType;
  title: string;
  message: string;
}

export class Alert {
  public notifications: Notification[] = [];

  public success(title: string, message: string) {
    this.notifications.push({ type: 'success', title, message });
  }

  public error(title: string, message: string) {
    this.notifications.push({ type: 'error', title, message });
  }
}

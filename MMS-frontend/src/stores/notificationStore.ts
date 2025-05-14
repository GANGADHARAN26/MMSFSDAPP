import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...notification,
        read: false,
        createdAt: new Date(),
      };
      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      const unreadCount = notifications.filter((notification) => !notification.read).length;
      return { notifications, unreadCount };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
      unreadCount: 0,
    })),
  removeNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((notification) => notification.id !== id);
      const unreadCount = notifications.filter((notification) => !notification.read).length;
      return { notifications, unreadCount };
    }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
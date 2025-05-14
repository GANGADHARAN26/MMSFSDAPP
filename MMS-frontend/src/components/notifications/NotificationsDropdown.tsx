import { Fragment } from 'react';
import { Menu } from '@headlessui/react';
import { format } from 'date-fns';
import { Notification, useNotificationStore } from '@/stores/notificationStore';
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface NotificationsDropdownProps {
  notifications: Notification[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const NotificationsDropdown = ({ notifications }: NotificationsDropdownProps) => {
  const { markAsRead, markAllAsRead } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs text-primary-600 hover:text-primary-800"
          >
            Mark all as read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-500">
          <BellIcon className="mx-auto h-6 w-6 text-gray-400" />
          <p className="mt-1">No notifications</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <Menu.Item key={notification.id}>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? 'bg-gray-50' : '',
                    notification.read ? 'opacity-75' : '',
                    'px-4 py-3 border-b border-gray-200 last:border-b-0'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-3 flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Menu.Item>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
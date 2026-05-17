import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Bell, CheckCircle, AlertCircle, Calendar, Package, FileText, Music, Users, X } from './ui/icons';
import type { Notification } from '../App';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onClose: () => void;
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClose
}: NotificationPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'application':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'engagement':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'inventory':
        return <Package className="w-5 h-5 text-orange-600" />;
      case 'attendance':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'instrument':
        return <Music className="w-5 h-5 text-pink-600" />;
      case 'endorsement':
        return <Users className="w-5 h-5 text-teal-600" />;
      case 'request':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'evaluation':
        return <CheckCircle className="w-5 h-5 text-[#7A1E1E]" />;
      case 'acceptance':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-[#6c757d]" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'application':
        return 'border-l-blue-500';
      case 'engagement':
        return 'border-l-purple-500';
      case 'inventory':
        return 'border-l-orange-500';
      case 'attendance':
        return 'border-l-green-500';
      case 'document':
        return 'border-l-indigo-500';
      case 'instrument':
        return 'border-l-pink-500';
      case 'endorsement':
        return 'border-l-teal-500';
      case 'request':
        return 'border-l-yellow-500';
      case 'evaluation':
        return 'border-l-[#7A1E1E]';
      case 'acceptance':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Card className="fixed top-16 right-2 sm:right-4 w-[calc(100vw-16px)] sm:w-[400px] max-h-[80vh] sm:max-h-[600px] shadow-xl border-[#e0e0e0] z-50 flex flex-col">
      <CardHeader className="pb-3 border-b border-[#e0e0e0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#7A1E1E]" />
            <CardTitle className="text-[#7A1E1E]">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-[#7A1E1E] text-white">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {unreadCount > 0 && (
          <CardDescription className="text-[#6c757d] flex items-center justify-between mt-2">
            <span>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</span>
            <Button
              variant="link"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-[#7A1E1E] h-auto p-0 text-xs"
            >
              Mark all as read
            </Button>
          </CardDescription>
        )}
      </CardHeader>
      <ScrollArea className="flex-1 min-h-0">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-[#6c757d] mb-3 opacity-30" />
              <p className="text-[#6c757d] text-sm">No notifications yet</p>
              <p className="text-[#6c757d] text-xs mt-1">We'll notify you when something new happens</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0f0f0]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm ${!notification.read ? 'font-medium text-[#7A1E1E]' : 'text-[#6c757d]'}`}>
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteNotification(notification.id)}
                          className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-[#6c757d] mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-[#6c757d]">
                          {formatDate(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-[#7A1E1E] h-auto p-0 text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
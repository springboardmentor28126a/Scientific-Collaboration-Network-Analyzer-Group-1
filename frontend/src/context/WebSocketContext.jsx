import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from './AuthContext';

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ws = useRef(null);

  useEffect(() => {
    let active = true;
    let reconnectTimer;

    const connectWebSocket = () => {
      const token = localStorage.getItem('token');
      if (!token || !user?.id) return;

      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const socketUrl = `${protocol}://localhost:8000/notifications/ws/${user.id}?token=${encodeURIComponent(token)}`;

      ws.current = new WebSocket(socketUrl);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const newNotification = JSON.parse(event.data);
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          window.dispatchEvent(new CustomEvent('new_notification', { detail: newNotification }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error', event);
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket Disconnected', event);
        if (active) {
          reconnectTimer = window.setTimeout(() => {
            if (active) connectWebSocket();
          }, 3000);
        }
      };
    };

    if (user && user.id) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch('http://localhost:8000/notifications/unread-count', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (response.ok && active) {
            const data = await response.json();
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error('Failed to fetch unread count', error);
        }
      };

      fetchUnreadCount();
      connectWebSocket();
    }

    return () => {
      active = false;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user]);

  return (
    <WebSocketContext.Provider value={{ notifications, setNotifications, unreadCount, setUnreadCount }}>
      {children}
    </WebSocketContext.Provider>
  );
};

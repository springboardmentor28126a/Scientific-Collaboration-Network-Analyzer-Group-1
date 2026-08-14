import React, { useEffect, useState, useContext } from 'react';
import api from '../config/api';
import { WebSocketContext } from '../context/WebSocketContext';
import { Link } from 'react-router-dom';

const typeIcon = (type) => ({ 
  project_member_added: 'bi-person-plus', 
  collaboration_request: 'bi-diagram-3', 
  request_accepted: 'bi-check-circle',
  request_rejected: 'bi-x-circle',
  citation_added: 'bi-quote', 
  conference_registration: 'bi-calendar-check', 
  publication_approved: 'bi-check-circle', 
  publication_rejected: 'bi-x-circle' 
}[type] || 'bi-bell');

export default function Notifications() {
  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState('');
  const { notifications: socketNotifications, setUnreadCount } = useContext(WebSocketContext) || {};

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications', { params: { unread_only: unreadOnly } });
      setLocalNotifications(response.data);
      if (setUnreadCount) {
        const unread = response.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [unreadOnly]);

  useEffect(() => {
    if (!socketNotifications?.length) return;
    setLocalNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newItems = socketNotifications.filter((n) => !existingIds.has(n.id));
      if (!newItems.length) return prev;
      return [...newItems, ...prev];
    });
  }, [socketNotifications]);

  useEffect(() => {
    const handleNew = (e) => {
      const newNotif = e.detail;
      setLocalNotifications((prev) => [newNotif, ...prev]);
    };
    window.addEventListener('new_notification', handleNew);
    return () => window.removeEventListener('new_notification', handleNew);
  }, []);

  const markRead = async id => { 
    try { 
      const { data } = await api.put(`/notifications/${id}/read`); 
      setLocalNotifications(items => items.map(n => n.id === id ? data : n)); 
      if (setUnreadCount) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { 
      setError(e.response?.data?.detail || 'Unable to update notification'); 
    } 
  };
  
  const markAll = async () => { 
    try { 
      await api.put('/notifications/read-all'); 
      if (setUnreadCount) setUnreadCount(0);
      load(); 
    } catch (e) { 
      setError(e.response?.data?.detail || 'Unable to update notifications'); 
    } 
  };
  
  const remove = async id => { 
    try { 
      await api.delete(`/notifications/${id}`); 
      setLocalNotifications(items => items.filter(n => n.id !== id)); 
    } catch (e) { 
      setError(e.response?.data?.detail || 'Unable to delete notification'); 
    } 
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2><i className="bi bi-bell"></i> Notifications</h2>
          <p className="text-muted mb-0">Updates about your projects, collaborations, publications, citations, and conferences.</p>
        </div>
        <button className="btn btn-outline-primary" onClick={markAll}>Mark all read</button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="form-check form-switch mb-3">
        <input className="form-check-input" type="checkbox" id="unreadOnly" checked={unreadOnly} onChange={e=>setUnreadOnly(e.target.checked)}/>
        <label className="form-check-label" htmlFor="unreadOnly">Unread only</label>
      </div>
      
      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="list-group list-group-flush">
            {localNotifications.map(n => (
              <div key={n.id} className={`list-group-item d-flex gap-3 ${n.is_read ? '' : 'list-group-item-light'}`}>
                <i className={`bi ${typeIcon(n.type)} fs-4 text-primary`}></i>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <strong>{n.title}</strong>
                    <small className="text-muted">{new Date(n.created_at).toLocaleString()}</small>
                  </div>
                  <div>{n.message}</div>
                  {n.type === 'collaboration_request' && <Link to="/collaborations?tab=incoming" className="btn btn-sm btn-outline-primary mt-2">Open collaboration request</Link>}
                  <small className="text-muted">{n.type.replaceAll('_',' ')}</small>
                </div>
                <div className="text-nowrap">
                  {!n.is_read && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => markRead(n.id)}>Read</button>}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(n.id)} aria-label="Delete notification"><i className="bi bi-trash"></i></button>
                </div>
              </div>
            ))}
            {!localNotifications.length && (
              <div className="list-group-item text-muted text-center py-4">No notifications to show.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bell, Check, CheckCircle } from 'lucide-react';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            fetchNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Bell size={28} /> Notifications
                    {unreadCount > 0 && (
                        <span style={{ fontSize: '1rem', backgroundColor: 'var(--danger)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                            {unreadCount} New
                        </span>
                    )}
                </h1>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                        <Check size={18} /> Mark All Read
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.map(n => (
                    <div key={n.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: !n.is_read ? '4px solid var(--primary)' : '4px solid transparent', backgroundColor: !n.is_read ? '#f8fafc' : 'white' }}>
                        <div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: !n.is_read ? 'var(--text)' : 'var(--text-muted)' }}>{n.title}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{n.message}</p>
                            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        {!n.is_read ? (
                            <button onClick={() => markAsRead(n.id)} className="btn" style={{ backgroundColor: '#e0e7ff', color: 'var(--primary)', padding: '0.5rem' }}>
                                <CheckCircle size={20} />
                            </button>
                        ) : (
                            <span style={{ color: 'var(--success)' }}><Check size={20} /></span>
                        )}
                    </div>
                ))}
                
                {notifications.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <Bell size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                        <p>You have no notifications caught up to date.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Book, Users, AlertCircle, CheckCircle, TrendingUp, Clock, Library as LibraryIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'librarian') {
            const fetchDashboard = async () => {
                try {
                   const res = await api.get('/dashboard');
                   setStats(res.data);
                } catch (e) {
                   console.error(e);
                } finally {
                   setLoading(false);
                }
            };
            fetchDashboard();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your dashboard...</div>;

    if (user?.role === 'user') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #c084fc 100%)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem', color: 'white', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)' }}>
                    <LibraryIcon size={64} />
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem', color: '#1e293b' }}>
                   Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name}</span>!
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px' }}>
                    Explore our extensive collection of books, track your reading history, and dive into your next great adventure.
                </p>
            </div>
        );
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '2.25rem', fontWeight: '900', color: '#0f172a' }}>
               Library <span style={{ color: 'var(--primary)', background: 'linear-gradient(90deg, var(--primary) 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Overview</span>
            </h1>

            {stats && (
                <>
                    {/* Modern Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        
                        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', borderRadius: '1rem', padding: '1.5rem', color: 'white', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '0.75rem' }}><Book size={24} /></div>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1 }}>{stats.stats.total_books}</div>
                            <div style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.5rem', fontWeight: 500 }}>Total Books Registered</div>
                        </div>

                        {user?.role === 'admin' && (
                        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '0.75rem', borderRadius: '0.75rem' }}><Users size={24} /></div>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>{stats.stats.total_users}</div>
                            <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>Active Users</div>
                        </div>
                        )}

                        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '0.75rem', borderRadius: '0.75rem' }}><CheckCircle size={24} /></div>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>{stats.stats.borrowed_books}</div>
                            <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>Currently Borrowed</div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: '-15px', top: '-15px', color: '#fee2e2', opacity: 0.5, transform: 'rotate(15deg)' }}><AlertCircle size={100} /></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative' }}>
                                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.75rem' }}><AlertCircle size={24} /></div>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc2626', lineHeight: 1, position: 'relative' }}>{stats.stats.overdue_books}</div>
                            <div style={{ fontSize: '1rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 500, position: 'relative' }}>Overdue Returns</div>
                        </div>

                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                        
                        {/* Most Borrowed Books */}
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                                <TrendingUp size={20} color="var(--primary)" /> Top Borrowed Books
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {stats.most_borrowed.map((b, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>{idx + 1}</div>
                                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{b.title}</span>
                                        </div>
                                        <div style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                            {b.count} Borrows
                                        </div>
                                    </div>
                                ))}
                                {stats.most_borrowed.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No data available yet</div>}
                            </div>
                        </div>

                        {/* Recent Activity Mini-log */}
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                                <Clock size={20} color="var(--primary)" /> Recent Activity
                            </h3>
                            <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '10px', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {stats.recent_activity.map((log) => (
                                    <div key={log.id} style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-33px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid white' }}></div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.25rem' }}>{log.action_type}</div>
                                        <div style={{ color: '#1e293b', fontWeight: 500, marginBottom: '0.25rem' }}>{log.description}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleString()} • @{log.user?.username}</div>
                                    </div>
                                ))}
                                {stats.recent_activity.length === 0 && <div style={{ color: '#94a3b8' }}>No recent activity.</div>}
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;

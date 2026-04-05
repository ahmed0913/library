import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Activity, Clock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ActivityLogsPage = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    if (user?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    const fetchLogs = async () => {
        try {
            const res = await api.get(`/activity-logs?page=${page}&per_page=20`);
            setLogs(res.data.logs);
            setTotalPages(res.data.pages);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const getActionColor = (actionType) => {
        if (actionType.includes('CREATED') || actionType === 'BORROW') return '#dcfce7'; // green
        if (actionType.includes('DELETED')) return '#fee2e2'; // red
        if (actionType.includes('UPDATED') || actionType === 'RETURN') return '#e0e7ff'; // blue
        return '#f3f4f6'; // gray
    };

    const getActionTextColor = (actionType) => {
        if (actionType.includes('CREATED') || actionType === 'BORROW') return '#166534';
        if (actionType.includes('DELETED')) return '#991b1b';
        if (actionType.includes('UPDATED') || actionType === 'RETURN') return '#3730a3';
        return '#4b5563';
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={28} color="var(--primary)" /> System Activity Logs
            </h1>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Timestamp</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Action</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>User</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', color: '#475569' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Clock size={14} />
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        backgroundColor: getActionColor(log.action_type), 
                                        color: getActionTextColor(log.action_type),
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {log.action_type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#334155' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <UserIcon size={14} />
                                        <span style={{ fontWeight: 500 }}>{log.user?.username}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', color: '#334155', fontSize: '0.875rem' }}>
                                    {log.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Newer</button>
                <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>Page {page} of {totalPages}</span>
                <button className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Older</button>
            </div>
        </div>
    );
};

export default ActivityLogsPage;

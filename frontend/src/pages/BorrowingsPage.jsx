import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Bookmark, BookOpen, Clock, Calendar } from 'lucide-react';

const BorrowingsPage = () => {
    const { user } = useAuth();
    const [borrowings, setBorrowings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [books, setBooks] = useState([]);

    const fetchBorrowings = async () => {
        try {
            const res = await api.get('/borrowings');
            setBorrowings(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrowings();
        if (user?.role === 'user') {
            api.get('/books?per_page=100').then((res) => setBooks(res.data.books));
        }
    }, [user]);

    const handleBorrow = async (bookId) => {
        if(!window.confirm("Are you sure you want to borrow this book?")) return;
        try {
            await api.post('/borrowings', { book_id: bookId });
            fetchBorrowings();
            // Refresh book availability
            api.get('/books?per_page=100').then((res) => setBooks(res.data.books));
            alert("Book borrowed successfully!");
        } catch (e) {
            alert(e.response?.data?.msg || "Borrowing failed");
        }
    };

    const handleReturn = async (id) => {
        if(!window.confirm("Mark this book as returned?")) return;
        try {
            const res = await api.put(`/borrowings/${id}/return`);
            alert(res.data.msg + (res.data.fine_amount > 0 ? ` Required fine: ${res.data.fine_amount} EGP` : ''));
            fetchBorrowings();
        } catch (e) {
            alert(e.response?.data?.msg || "Return failed");
        }
    };

    if (loading) return <div>Loading...</div>;

    const StatusBadge = ({ status }) => {
        if (status === 'borrowed') return <span style={{ padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#e0e7ff', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Bookmark size={14}/> Active</span>;
        if (status === 'returned') return <span style={{ padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#dcfce7', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={14}/> Returned</span>;
        if (status === 'overdue') return <span style={{ padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#fee2e2', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><AlertCircle size={14}/> Overdue</span>;
        return null;
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(90deg, var(--primary) 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user?.role === 'user' ? 'Library Kiosk' : 'Borrowing Management'}
            </h1>

            {user?.role === 'user' && (
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={24} color="var(--primary)" /> Available Titles
                        </h2>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {books.filter(b => b.available_copies > 0).map(b => (
                            <div key={b.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ height: '160px', backgroundColor: '#f3f4f6', backgroundImage: b.image_path ? `url(http://localhost:5000${b.image_path})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                    {!b.image_path && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#9ca3af' }}><BookOpen size={48} /></div>}
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {b.available_copies} copies left
                                    </div>
                                </div>
                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{b.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>By {b.author}</p>
                                    <button onClick={() => handleBorrow(b.id)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        Borrow Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {user?.role === 'user' ? (
                <div>
                     <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={24} color="var(--primary)" /> My History
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {borrowings.map(b => (
                            <div key={b.id} className="card" style={{ borderLeft: b.status === 'overdue' ? '4px solid var(--danger)' : b.status === 'borrowed' ? '4px solid var(--primary)' : '4px solid var(--success)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{b.book?.title}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{b.book?.author}</p>
                                    </div>
                                    <StatusBadge status={b.status} />
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14}/> Borrowed</div>
                                        <div style={{ fontWeight: 500 }}>{b.borrow_date}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={14}/> Due Date</div>
                                        <div style={{ fontWeight: 500, color: b.status === 'overdue' ? 'var(--danger)' : 'inherit' }}>{b.due_date}</div>
                                    </div>
                                </div>
                                
                                {Number(b.fine_amount) > 0 && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#991b1b', fontWeight: 600, fontSize: '0.875rem' }}>Accumulated Fine</span>
                                        <span style={{ color: '#991b1b', fontWeight: 'bold', fontSize: '1.125rem' }}>{b.fine_amount} EGP</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflowX: 'auto', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Book & Learner</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Timeline</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Fine</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {borrowings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>{b.book?.title}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>@{b.user?.username} ({b.user?.name})</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>
                                        <div style={{ color: '#64748b' }}>Borrowed: <span style={{ color: '#1e293b', fontWeight: 500 }}>{b.borrow_date}</span></div>
                                        <div style={{ color: '#64748b', marginTop: '0.25rem' }}>Due: <span style={{ color: b.status === 'overdue' ? 'var(--danger)' : '#1e293b', fontWeight: 500 }}>{b.due_date}</span></div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                        <StatusBadge status={b.status} />
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        {Number(b.fine_amount) > 0 ? (
                                            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontWeight: 'bold' }}>
                                                {b.fine_amount} EGP
                                            </span>
                                        ) : <span style={{ color: '#94a3b8' }}>-</span>}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        {b.status !== 'returned' ? (
                                            <button onClick={() => handleReturn(b.id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', borderRadius: '2rem', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)' }}>
                                                Mark Returned
                                            </button>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '0.875rem', fontStyle: 'italic' }}>Closed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {borrowings.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No active or past borrowings found in the system.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BorrowingsPage;

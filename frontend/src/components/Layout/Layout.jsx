import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Book, Users, Home, Activity, Bell, LogOut, Tags, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications');
        const unread = res.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (e) {
        console.error("Error fetching notifications", e);
      }
    };
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? { backgroundColor: 'rgba(255,255,255,0.1)' } : {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Book size={24} /> LMS
        </h2>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/" className="btn" style={{ justifyContent: 'flex-start', color: 'inherit', ...isActive('/') }}><Home size={20} /> Dashboard</Link>
          <Link to="/books" className="btn" style={{ justifyContent: 'flex-start', color: 'inherit', ...isActive('/books') }}><Book size={20} /> Books</Link>
          <Link to="/borrowings" className="btn" style={{ justifyContent: 'flex-start', color: 'inherit', ...isActive('/borrowings') }}><Activity size={20} /> Borrowings</Link>
          
          {user?.role === 'admin' && (
            <>
              <Link to="/users" className="btn" style={{ justifyContent: 'flex-start', color: 'inherit', ...isActive('/users') }}><Users size={20} /> Users</Link>
              <Link to="/categories" className="btn" style={{ justifyContent: 'flex-start', color: 'inherit', ...isActive('/categories') }}><Tags size={20} /> Categories</Link>
              <Link to="/logs" className="btn" style={{ justifyContent: 'flex-start', color: 'inherit', ...isActive('/logs') }}><ShieldAlert size={20} /> System Logs</Link>
            </>
          )}
        </nav>
        
        <div style={{ marginTop: 'auto', borderTop: '1px solid #374151', paddingTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: '500' }}>{user?.name}</div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Role: {user?.role}</div>
          </div>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', color: '#ff4d4f' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem' }}>
          <Link to="/notifications" style={{ position: 'relative', color: 'var(--text-muted)' }}>
            <Bell size={24} />
            {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: 'var(--danger)', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 'bold' }}>
                    {unreadCount}
                </span>
            )}
          </Link>
        </header>
        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash2, Edit, Save, X, Plus } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [newUserForm, setNewUserForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'user' });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ name: '', role: '', password: '' });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users?per_page=50');
            setUsers(res.data.users);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setNewUserForm(false);
            setFormData({ name: '', username: '', password: '', role: 'user' });
            fetchUsers();
        } catch (e) {
            alert(e.response?.data?.msg || "Error creating user");
        }
    };

    const handleEditStart = (u) => {
        setEditingId(u.id);
        setEditData({ name: u.name, role: u.role, password: '' });
    };

    const handleEditSave = async (id) => {
        try {
            const payload = { name: editData.name, role: editData.role };
            if (editData.password) payload.password = editData.password;
            await api.put(`/users/${id}`, payload);
            setEditingId(null);
            fetchUsers();
        } catch (e) {
            alert(e.response?.data?.msg || "Error updating user");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete User?")) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (e) {
            alert(e.response?.data?.msg || "Error deleting user");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Manage Users</h1>
                <button onClick={() => setNewUserForm(!newUserForm)} className="btn btn-primary">
                    <Plus size={18} /> Add User
                </button>
            </div>

            {newUserForm && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>New User</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Name</label>
                            <input className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Username</label>
                            <input className="form-input" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Password</label>
                            <input type="password" className="form-input" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Role</label>
                            <select className="form-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                <option value="user">User</option>
                                <option value="librarian">Librarian</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Create</button>
                    </form>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>New Password</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                {editingId === u.id ? (
                                    <>
                                        <td><input className="form-input" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /></td>
                                        <td>{u.username}</td>
                                        <td>
                                            <select className="form-input" value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})}>
                                                <option value="user">User</option>
                                                <option value="librarian">Librarian</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td><input type="password" placeholder="(Leave blank to keep)" className="form-input" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEditSave(u.id)} className="btn" style={{ backgroundColor: '#dcfce7', color: '#166534' }}><Save size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="btn" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}><X size={16} /></button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{u.name}</td>
                                        <td>{u.username}</td>
                                        <td><span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', fontSize: '0.875rem' }}>{u.role}</span></td>
                                        <td>-</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEditStart(u)} className="btn" style={{ backgroundColor: '#f3f4f6' }}><Edit size={16} /></button>
                                                {u.username !== 'admin' && (
                                                    <button onClick={() => handleDelete(u.id)} className="btn btn-danger"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;

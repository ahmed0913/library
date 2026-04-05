import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash2, Edit, Save, X } from 'lucide-react';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '' });

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', newCategory);
            setNewCategory({ name: '', description: '' });
            fetchCategories();
        } catch (e) {
            alert(e.response?.data?.msg || 'Error adding category');
        }
    };

    const handleEditStart = (category) => {
        setEditingId(category.id);
        setEditForm({ name: category.name, description: category.description || '' });
    };

    const handleEditSave = async (id) => {
        try {
            await api.put(`/categories/${id}`, editForm);
            setEditingId(null);
            fetchCategories();
        } catch (e) {
            alert(e.response?.data?.msg || 'Error updating');
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Delete category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (e) {
            alert(e.response?.data?.msg || 'Cannot delete (in use)');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1.5rem', fontSize: '1.875rem', fontWeight: 'bold' }}>Manage Categories</h1>
            
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: '500' }}>Add Category</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="form-label">Name</label>
                        <input className="form-input" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                        <label className="form-label">Description</label>
                        <input className="form-input" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary">Add</button>
                </form>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th style={{ width: '150px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id}>
                                {editingId === c.id ? (
                                    <>
                                        <td><input className="form-input" value={editForm.name} onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))} /></td>
                                        <td><input className="form-input" value={editForm.description} onChange={(e) => setEditForm(prev => ({...prev, description: e.target.value}))} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEditSave(c.id)} className="btn" style={{ backgroundColor: '#dcfce7', color: '#166534' }}><Save size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="btn" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}><X size={16} /></button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                                        <td>{c.description}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEditStart(c)} className="btn" style={{ backgroundColor: '#f3f4f6' }}><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(c.id)} className="btn btn-danger"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {categories.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>No categories.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoriesPage;

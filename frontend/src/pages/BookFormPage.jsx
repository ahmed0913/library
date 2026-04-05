import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BookFormPage = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        category_id: '',
        price: 0,
        total_copies: 1,
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await api.get('/categories');
            setCategories(res.data);
            if (!isEdit && res.data.length > 0) {
                setFormData(prev => ({ ...prev, category_id: res.data[0].id }));
            }
        };
        fetchCategories();

        if (isEdit) {
            const fetchBook = async () => {
                const res = await api.get(`/books/${id}`);
                setFormData({
                    title: res.data.title,
                    author: res.data.author,
                    description: res.data.description,
                    category_id: res.data.category_id,
                    price: res.data.price,
                    total_copies: res.data.total_copies,
                });
            };
            fetchBook();
        }
    }, [id, isEdit]);

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Array.from(Object.keys(formData)).forEach((key) => {
            data.append(key, formData[key]);
        });
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (isEdit) {
                await api.put(`/books/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            navigate('/books');
        } catch (err) {
            alert(err.response?.data?.msg || 'Error saving book');
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link to="/books" className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}><ArrowLeft size={18} /></Link>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{isEdit ? 'Edit Book' : 'Add New Book'}</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Title</label>
                        <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Author</label>
                        <input type="text" name="author" className="form-input" value={formData.author} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select name="category_id" className="form-input" value={formData.category_id} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Price (EGP)</label>
                        <input type="number" step="0.01" name="price" className="form-input" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Total Copies</label>
                        <input type="number" min="1" name="total_copies" className="form-input" value={formData.total_copies} onChange={handleChange} required />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Description</label>
                        <textarea name="description" className="form-input" rows="4" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Cover Image</label>
                        <input type="file" className="form-input" onChange={handleFileChange} accept="image/*" />
                        {isEdit && !imageFile && <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Leave blank to keep existing image</div>}
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <Link to="/books" className="btn" style={{ backgroundColor: '#f3f4f6', color: '#111827' }}>Cancel</Link>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Book'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookFormPage;

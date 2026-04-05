import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

const BooksPage = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Pagination & Search
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTitle, setSearchTitle] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    const fetchBooks = async () => {
        try {
            const res = await api.get(`/books?page=${page}&per_page=${perPage}&search=${searchTitle}&category_id=${filterCategory}`);
            setBooks(res.data.books);
            setTotalPages(res.data.pages);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await api.get('/categories');
            setCategories(res.data);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [page, perPage, filterCategory]); // Search trigger is via button

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchBooks();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await api.delete(`/books/${id}`);
            fetchBooks();
        } catch (e) {
            alert(e.response?.data?.msg || "Error deleting");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Library Books</h1>
                {(user?.role === 'admin' || user?.role === 'librarian') && (
                    <Link to="/books/add" className="btn btn-primary"><Plus size={18} /> Add Book</Link>
                )}
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <div style={{ position: 'absolute', top: '0.6rem', left: '0.75rem', color: '#9ca3af' }}><Search size={20} /></div>
                        <input 
                            type="text" 
                            className="form-input" 
                            style={{ paddingLeft: '2.5rem' }} 
                            placeholder="Search by title..." 
                            value={searchTitle} 
                            onChange={(e) => setSearchTitle(e.target.value)}
                        />
                    </div>
                    <select className="form-input" style={{ width: '200px' }} value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {books.length > 0 ? books.map(book => (
                    <div key={book.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ position: 'relative', height: '200px', backgroundColor: '#f1f5f9' }}>
                            {book.image_path ? (
                                <img src={`http://localhost:5000${book.image_path}`} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No Cover</div>
                            )}
                            <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {book.category?.name || 'Uncategorized'}
                            </div>
                        </div>
                        
                        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#0f172a', lineHeight: 1.2 }}>{book.title}</h3>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>By {book.author}</p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <span style={{ fontSize: '1.125rem', fontWeight: '900', color: 'var(--primary)' }}>{book.price}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.25rem' }}>EGP</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: book.available_copies > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                    {book.available_copies} / {book.total_copies} Left
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                                <Link to={`/books/${book.id}`} className="btn" style={{ flex: 1, justifyContent: 'center', backgroundColor: '#e0e7ff', color: 'var(--primary)', padding: '0.5rem' }}>
                                    <Eye size={16} /> <span style={{ marginLeft: '0.25rem' }}>View</span>
                                </Link>
                                {(user?.role === 'admin' || user?.role === 'librarian') && (
                                    <>
                                        <Link to={`/books/edit/${book.id}`} className="btn" style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '0.5rem' }} title="Edit"><Edit size={16} /></Link>
                                        <button onClick={() => handleDelete(book.id)} className="btn btn-danger" style={{ padding: '0.5rem' }} title="Delete"><Trash2 size={16} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#94a3b8', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                        No books matching your search criteria.
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem' }}>Rows per page:</span>
                    <select className="form-input" style={{ width: '80px', padding: '0.25rem' }} value={perPage} onChange={(e) => { setPerPage(e.target.value); setPage(1); }}>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }} onClick={() => setPage(old => Math.max(1, old - 1))} disabled={page === 1}>Previous</button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>Page {page} of {totalPages}</span>
                    <button className="btn" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }} onClick={() => setPage(old => Math.min(totalPages, old + 1))} disabled={page === totalPages}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default BooksPage;

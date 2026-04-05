import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, Tag, ShieldAlert, CheckCircle } from 'lucide-react';

const BookDetailsPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await api.get(`/books/${id}`);
                setBook(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>Loading book details...</div>;
    if (!book) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>Book not found.</div>;

    const inStock = book.available_copies > 0;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease-in-out' }}>
            <Link to="/books" className="btn" style={{ display: 'inline-flex', marginBottom: '2rem', backgroundColor: 'white', border: '1px solid var(--border)' }}>
                <ArrowLeft size={18} /> Back to Library
            </Link>

            <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' } }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    
                    {/* Image Section */}
                    <div style={{ flex: '1 1 300px', backgroundColor: '#f8fafc', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #e2e8f0', position: 'relative' }}>
                        {book.image_path ? (
                            <img src={`http://localhost:5000${book.image_path}`} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <BookOpen size={64} style={{ margin: '0 auto 1rem' }} />
                                <div>No Cover Available</div>
                            </div>
                        )}
                        <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.4rem 1rem', borderRadius: '2rem', fontWeight: 'bold' }}>
                            {book.price} EGP
                        </div>
                    </div>

                    {/* Content Section */}
                    <div style={{ flex: '2 1 400px', padding: '3rem' }}>
                        <div style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#e0e7ff', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>
                            <Tag size={16} /> {book.category?.name || 'Uncategorized'}
                        </div>
                        
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                            {book.title}
                        </h1>
                        
                        <div style={{ fontSize: '1.125rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                            <User size={18} /> by {book.author}
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Synopsis</h3>
                            <p style={{ color: '#475569', lineHeight: 1.8 }}>
                                {book.description || "No description provided for this book."}
                            </p>
                        </div>

                        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Availability Status</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: inStock ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {inStock ? <><CheckCircle size={24} /> {book.available_copies} Copies Available</> : <><ShieldAlert size={24} /> Out of Stock</>}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Inventory</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{book.total_copies} Copies</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsPage;

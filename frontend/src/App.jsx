/**
 * Library Management System
 * Developed by Ahmed Youssef
 * Copyright 2026 Ahmed Youssef. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BooksPage from './pages/BooksPage';
import BookFormPage from './pages/BookFormPage';
import UsersPage from './pages/UsersPage';
import BorrowingsPage from './pages/BorrowingsPage';
import NotificationsPage from './pages/NotificationsPage';
import CategoriesPage from './pages/CategoriesPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import BookDetailsPage from './pages/BookDetailsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" />;
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Books */}
          <Route path="/books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
          <Route path="/books/:id" element={<ProtectedRoute><BookDetailsPage /></ProtectedRoute>} />
          <Route path="/books/add" element={<ProtectedRoute allowedRoles={['admin', 'librarian']}><BookFormPage /></ProtectedRoute>} />
          <Route path="/books/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'librarian']}><BookFormPage /></ProtectedRoute>} />
          
          {/* Borrowings */}
          <Route path="/borrowings" element={<ProtectedRoute><BorrowingsPage /></ProtectedRoute>} />
          
          {/* Notifications */}
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          
          {/* Admin Only */}
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute allowedRoles={['admin']}><CategoriesPage /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute allowedRoles={['admin']}><ActivityLogsPage /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

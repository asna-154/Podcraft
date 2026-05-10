import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EpisodePage from './pages/EpisodePage';
import ResearchPage from './pages/ResearchPage';
import ProfilePage from './pages/ProfilePage';
import EpisodeHistoryPage from './pages/EpisodeHistoryPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0F172A'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #1E293B',
                    borderTop: '4px solid #F97316',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }
    
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) return null;
    
    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute><Register /></PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/episode/:id" element={
                <ProtectedRoute><EpisodePage /></ProtectedRoute>
            } />
            <Route path="/research/:id" element={
                <ProtectedRoute><ResearchPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/history" element={
                <ProtectedRoute><EpisodeHistoryPage /></ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    pauseOnHover
                    theme="dark"
                    style={{ zIndex: 9999 }}
                />
            </Router>
        </AuthProvider>
    );
}

export default App;
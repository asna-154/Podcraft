import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser(formData);
            login(res.data.user, res.data.token);
            toast.success('Welcome back to PodCraft!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoSection}>
                    <div style={styles.logoIcon}>🎙️</div>
                    <h1 style={styles.logoText}>PodCraft</h1>
                    <p style={styles.logoSubtext}>AI Podcast Planning System</p>
                </div>

                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.subtitle}>Sign in to continue planning your episodes</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Email */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>✉️</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                            <span
                                style={styles.eyeIcon}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </span>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? (
                            <span style={styles.loadingText}>
                                <span style={styles.spinner}></span>
                                Signing in...
                            </span>
                        ) : 'Login'}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.link}>
                        Sign Up
                    </Link>
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                input:focus {
                    outline: none;
                    border-color: #F97316 !important;
                    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2) !important;
                }
                button:hover {
                    background: #EA6C00 !important;
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    card: {
        background: '#1E293B',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid #334155',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    },
    logoSection: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    logoIcon: {
        fontSize: '48px',
        marginBottom: '8px',
    },
    logoText: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#F97316',
        letterSpacing: '-0.5px',
    },
    logoSubtext: {
        fontSize: '13px',
        color: '#64748B',
        marginTop: '4px',
    },
    title: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '8px',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748B',
        textAlign: 'center',
        marginBottom: '32px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: '14px',
        fontSize: '16px',
        zIndex: 1,
    },
    input: {
        width: '100%',
        padding: '12px 14px 12px 44px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '15px',
        transition: 'all 0.2s',
    },
    eyeIcon: {
        position: 'absolute',
        right: '14px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    button: {
        padding: '14px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: '8px',
    },
    loadingText: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTop: '2px solid #fff',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 1s linear infinite',
    },
    switchText: {
        textAlign: 'center',
        color: '#64748B',
        fontSize: '14px',
        marginTop: '24px',
    },
    link: {
        color: '#F97316',
        textDecoration: 'none',
        fontWeight: '600',
    },
};

export default Login;
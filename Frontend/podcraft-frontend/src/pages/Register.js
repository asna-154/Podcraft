import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form submitted");
    console.log("Data to send:", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
    });

    if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
    }

    if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
    }

    if (!validatePassword(formData.password)) {
        toast.error('Password must contain uppercase, number and special character');
        return;
    }

    setLoading(true);
    
    try {
        console.log("Calling API...");
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            })
        });
        
        console.log("Response received:", response.status);
        const data = await response.json();
        console.log("Response data:", data);
        
        if (response.ok) {
            login(data.user, data.token);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } else {
            toast.error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.log("Fetch error:", error);
        toast.error('Network error: ' + error.message);
    } finally {
        setLoading(false);
    }
};

    const getPasswordStrength = () => {
        const { password } = formData;
        if (!password) return null;
        if (password.length < 8) return { label: 'Too Short', color: '#EF4444' };
        if (!validatePassword(password)) return { label: 'Weak', color: '#F97316' };
        if (password.length >= 12) return { label: 'Strong', color: '#22C55E' };
        return { label: 'Medium', color: '#EAB308' };
    };

    const strength = getPasswordStrength();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoSection}>
                    <div style={styles.logoIcon}>🎙️</div>
                    <h1 style={styles.logoText}>PodCraft</h1>
                    <p style={styles.logoSubtext}>AI Podcast Planning System</p>
                </div>

                <h2 style={styles.title}>Create Account</h2>
                <p style={styles.subtitle}>Start planning better podcast episodes today</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Full Name */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>👤</span>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

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
                                placeholder="Min 8 chars, uppercase, number, special"
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
                        {strength && (
                            <div style={styles.strengthRow}>
                                <div style={styles.strengthBar}>
                                    <div style={{
                                        ...styles.strengthFill,
                                        background: strength.color,
                                        width: strength.label === 'Too Short' ? '25%' :
                                               strength.label === 'Weak' ? '50%' :
                                               strength.label === 'Medium' ? '75%' : '100%'
                                    }} />
                                </div>
                                <span style={{ ...styles.strengthLabel, color: strength.color }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>🔒</span>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Repeat your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={{
                                    ...styles.input,
                                    borderColor: formData.confirmPassword &&
                                        formData.password !== formData.confirmPassword
                                        ? '#EF4444' : '#334155'
                                }}
                                required
                            />
                            <span
                                style={styles.eyeIcon}
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                {showConfirm ? '🙈' : '👁️'}
                            </span>
                        </div>
                        {formData.confirmPassword &&
                            formData.password !== formData.confirmPassword && (
                            <span style={styles.errorText}>Passwords do not match</span>
                        )}
                    </div>

                    {/* Password Rules */}
                    <div style={styles.rulesBox}>
                        <p style={styles.rulesTitle}>Password Requirements:</p>
                        <div style={styles.rulesList}>
                            {[
                                { rule: 'At least 8 characters', met: formData.password.length >= 8 },
                                { rule: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
                                { rule: 'One number', met: /[0-9]/.test(formData.password) },
                                { rule: 'One special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(formData.password) },
                            ].map((item, index) => (
                                <div key={index} style={styles.ruleItem}>
                                    <span style={{ color: item.met ? '#22C55E' : '#64748B' }}>
                                        {item.met ? '✓' : '○'}
                                    </span>
                                    <span style={{
                                        color: item.met ? '#22C55E' : '#64748B',
                                        fontSize: '12px'
                                    }}>
                                        {item.rule}
                                    </span>
                                </div>
                            ))}
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
                                Creating Account...
                            </span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>
                        Sign In
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
    strengthRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '4px',
    },
    strengthBar: {
        flex: 1,
        height: '4px',
        background: '#334155',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
        borderRadius: '2px',
        transition: 'all 0.3s',
    },
    strengthLabel: {
        fontSize: '12px',
        fontWeight: '600',
        minWidth: '60px',
    },
    errorText: {
        fontSize: '12px',
        color: '#EF4444',
        marginTop: '2px',
    },
    rulesBox: {
        background: '#0F172A',
        borderRadius: '8px',
        padding: '12px 16px',
        border: '1px solid #334155',
    },
    rulesTitle: {
        fontSize: '12px',
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: '8px',
    },
    rulesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    ruleItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
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

export default Register;
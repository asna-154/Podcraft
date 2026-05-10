import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../utils/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            logout();
            navigate('/login');
        }
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/history', label: 'History', icon: '📚' },
        { path: '/profile', label: 'Profile', icon: '👤' },
    ];

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContent}>
                {/* Logo */}
                <div
                    style={styles.logo}
                    onClick={() => navigate('/dashboard')}
                >
                    <span style={styles.logoIcon}>🎙️</span>
                    <span style={styles.logoText}>PodCraft</span>
                </div>

                {/* Nav Links */}
                <div style={styles.navLinks}>
                    {navLinks.map(link => (
                        <button
                            key={link.path}
                            style={{
                                ...styles.navLink,
                                ...(location.pathname === link.path
                                    ? styles.navLinkActive
                                    : {})
                            }}
                            onClick={() => navigate(link.path)}
                        >
                            <span>{link.icon}</span>
                            <span>{link.label}</span>
                        </button>
                    ))}
                </div>

                {/* User Menu */}
                <div style={styles.userMenu}>
                    {/* Subscription Badge */}
                    <span style={{
                        ...styles.subBadge,
                        background: user?.subscription === 'premium'
                            ? '#EAB30820' : '#64748B20',
                        color: user?.subscription === 'premium'
                            ? '#EAB308' : '#64748B',
                        border: `1px solid ${user?.subscription === 'premium'
                            ? '#EAB30840' : '#64748B40'}`
                    }}>
                        {user?.subscription === 'premium' ? '⭐ Premium' : '🆓 Free'}
                    </span>

                    {/* User Avatar */}
                    <div
                        style={styles.avatar}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <span style={styles.avatarText}>
                            {user?.fullName?.charAt(0).toUpperCase()}
                        </span>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div style={styles.dropdown}>
                                <div style={styles.dropdownHeader}>
                                    <p style={styles.dropdownName}>
                                        {user?.fullName}
                                    </p>
                                    <p style={styles.dropdownEmail}>
                                        {user?.email}
                                    </p>
                                </div>
                                <div style={styles.dropdownDivider} />
                                <button
                                    style={styles.dropdownItem}
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/profile');
                                    }}
                                >
                                    ⚙️ Account Settings
                                </button>
                                <button
                                    style={styles.dropdownItem}
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/history');
                                    }}
                                >
                                    📚 Episode History
                                </button>
                                <div style={styles.dropdownDivider} />
                                <button
                                    style={{
                                        ...styles.dropdownItem,
                                        color: '#EF4444'
                                    }}
                                    onClick={handleLogout}
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        background: '#1E293B',
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    navContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
    },
    logoIcon: {
        fontSize: '24px',
    },
    logoText: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#F97316',
        letterSpacing: '-0.5px',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: 'none',
        border: 'none',
        borderRadius: '8px',
        color: '#64748B',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    navLinkActive: {
        background: '#F9731620',
        color: '#F97316',
    },
    userMenu: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    subBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    avatar: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: '#F97316',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        fontWeight: '700',
        fontSize: '16px',
        color: '#fff',
    },
    avatarText: {
        userSelect: 'none',
    },
    dropdown: {
        position: 'absolute',
        top: '48px',
        right: 0,
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '8px',
        minWidth: '220px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        zIndex: 1001,
    },
    dropdownHeader: {
        padding: '8px 12px 12px',
    },
    dropdownName: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '2px',
    },
    dropdownEmail: {
        fontSize: '12px',
        color: '#64748B',
    },
    dropdownDivider: {
        height: '1px',
        background: '#334155',
        margin: '4px 0',
    },
    dropdownItem: {
        width: '100%',
        padding: '10px 12px',
        background: 'none',
        border: 'none',
        borderRadius: '8px',
        color: '#94A3B8',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
};

export default Navbar;
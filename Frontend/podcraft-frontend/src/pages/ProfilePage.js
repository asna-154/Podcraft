import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { updateAccount, updatePassword, deleteAccount } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const ProfilePage = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [profileForm, setProfileForm] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [notifications, setNotifications] = useState({
        email: user?.notificationPreferences?.email ?? true,
        push: user?.notificationPreferences?.push ?? true
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateAccount({
                fullName: profileForm.fullName,
                email: profileForm.email,
                notificationPreferences: notifications
            });
            updateUser(res.data.user);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message ||
                'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
        if (!regex.test(passwordForm.newPassword)) {
            toast.error('Password must contain uppercase, number and special character');
            return;
        }
        setLoading(true);
        try {
            await updatePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message ||
                'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(
            'Are you sure you want to delete your account? This cannot be undone.'
        )) return;
        if (!window.confirm(
            'This will permanently delete all your episodes and data. Continue?'
        )) return;
        try {
            await deleteAccount();
            logout();
            toast.success('Account deleted successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    return (
        <div style={styles.container}>
            <Navbar />
            <div style={styles.content}>
                {/* Header */}
                <div style={styles.headerCard}>
                    <div style={styles.avatarLarge}>
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.headerInfo}>
                        <h1 style={styles.headerName}>{user?.fullName}</h1>
                        <p style={styles.headerEmail}>{user?.email}</p>
                        <div style={styles.headerBadges}>
                            <span style={{
                                ...styles.subBadge,
                                background: user?.subscription === 'premium'
                                    ? '#EAB30820' : '#64748B20',
                                color: user?.subscription === 'premium'
                                    ? '#EAB308' : '#64748B',
                                border: `1px solid ${user?.subscription === 'premium'
                                    ? '#EAB30840' : '#64748B40'}`
                            }}>
                                {user?.subscription === 'premium'
                                    ? '⭐ Premium' : '🆓 Free Tier'}
                            </span>
                            <span style={styles.verifiedBadge}>
                                ✓ Verified
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {[
                        { key: 'profile', label: '👤 Profile', },
                        { key: 'password', label: '🔒 Password', },
                        { key: 'notifications', label: '🔔 Notifications', },
                        { key: 'danger', label: '⚠️ Danger Zone', },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab.key
                                    ? styles.tabActive : {})
                            }}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            Account Information
                        </h2>
                        <p style={styles.cardSubtitle}>
                            Update your personal details
                        </p>
                        <form
                            onSubmit={handleProfileUpdate}
                            style={styles.form}
                        >
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    value={profileForm.fullName}
                                    onChange={(e) => setProfileForm({
                                        ...profileForm,
                                        fullName: e.target.value
                                    })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({
                                        ...profileForm,
                                        email: e.target.value
                                    })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Subscription Plan
                                </label>
                                <div style={styles.planBox}>
                                    <span style={styles.planText}>
                                        {user?.subscription === 'premium'
                                            ? '⭐ Premium Plan — Unlimited episodes'
                                            : '🆓 Free Plan — 3 episodes/month'}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.saveBtn,
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? '⏳ Saving...' : '💾 Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Change Password</h2>
                        <p style={styles.cardSubtitle}>
                            Keep your account secure
                        </p>
                        <form
                            onSubmit={handlePasswordUpdate}
                            style={styles.form}
                        >
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        currentPassword: e.target.value
                                    })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        newPassword: e.target.value
                                    })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        confirmPassword: e.target.value
                                    })}
                                    style={{
                                        ...styles.input,
                                        borderColor:
                                            passwordForm.confirmPassword &&
                                            passwordForm.newPassword !==
                                            passwordForm.confirmPassword
                                                ? '#EF4444' : '#334155'
                                    }}
                                    required
                                />
                                {passwordForm.confirmPassword &&
                                    passwordForm.newPassword !==
                                    passwordForm.confirmPassword && (
                                    <span style={styles.errorText}>
                                        Passwords do not match
                                    </span>
                                )}
                            </div>
                            <div style={styles.passwordRules}>
                                {[
                                    {
                                        rule: 'At least 8 characters',
                                        met: passwordForm.newPassword.length >= 8
                                    },
                                    {
                                        rule: 'One uppercase letter',
                                        met: /[A-Z]/.test(passwordForm.newPassword)
                                    },
                                    {
                                        rule: 'One number',
                                        met: /[0-9]/.test(passwordForm.newPassword)
                                    },
                                    {
                                        rule: 'One special character',
                                        met: /[!@#$%^&*]/.test(
                                            passwordForm.newPassword
                                        )
                                    },
                                ].map((item, i) => (
                                    <div key={i} style={styles.ruleItem}>
                                        <span style={{
                                            color: item.met
                                                ? '#22C55E' : '#64748B'
                                        }}>
                                            {item.met ? '✓' : '○'}
                                        </span>
                                        <span style={{
                                            fontSize: '13px',
                                            color: item.met
                                                ? '#22C55E' : '#64748B'
                                        }}>
                                            {item.rule}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.saveBtn,
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading
                                    ? '⏳ Updating...'
                                    : '🔒 Update Password'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            Notification Preferences
                        </h2>
                        <p style={styles.cardSubtitle}>
                            Manage how you receive updates
                        </p>
                        <div style={styles.notifList}>
                            {[
                                {
                                    key: 'email',
                                    label: 'Email Notifications',
                                    desc: 'Receive updates via email',
                                    icon: '✉️'
                                },
                                {
                                    key: 'push',
                                    label: 'Push Notifications',
                                    desc: 'Receive in-app notifications',
                                    icon: '🔔'
                                }
                            ].map(notif => (
                                <div key={notif.key} style={styles.notifItem}>
                                    <div style={styles.notifLeft}>
                                        <span style={styles.notifIcon}>
                                            {notif.icon}
                                        </span>
                                        <div>
                                            <p style={styles.notifLabel}>
                                                {notif.label}
                                            </p>
                                            <p style={styles.notifDesc}>
                                                {notif.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            ...styles.toggle,
                                            background: notifications[notif.key]
                                                ? '#F97316' : '#334155'
                                        }}
                                        onClick={() => setNotifications({
                                            ...notifications,
                                            [notif.key]: !notifications[notif.key]
                                        })}
                                    >
                                        <div style={{
                                            ...styles.toggleKnob,
                                            transform: notifications[notif.key]
                                                ? 'translateX(20px)'
                                                : 'translateX(2px)'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            style={styles.saveBtn}
                            onClick={handleProfileUpdate}
                            disabled={loading}
                        >
                            {loading ? '⏳ Saving...' : '💾 Save Preferences'}
                        </button>
                    </div>
                )}

                {/* Danger Zone Tab */}
                {activeTab === 'danger' && (
                    <div style={{
                        ...styles.card,
                        border: '1px solid #EF444440'
                    }}>
                        <h2 style={{
                            ...styles.cardTitle,
                            color: '#EF4444'
                        }}>
                            ⚠️ Danger Zone
                        </h2>
                        <p style={styles.cardSubtitle}>
                            These actions are irreversible. Please be careful.
                        </p>
                        <div style={styles.dangerBox}>
                            <div style={styles.dangerInfo}>
                                <h3 style={styles.dangerTitle}>
                                    Delete Account
                                </h3>
                                <p style={styles.dangerText}>
                                    Permanently delete your account and all
                                    associated data including episodes,
                                    research, and settings.
                                    This action cannot be undone.
                                </p>
                            </div>
                            <button
                                style={styles.deleteBtn}
                                onClick={handleDeleteAccount}
                            >
                                🗑️ Delete Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                input:focus {
                    outline: none;
                    border-color: #F97316 !important;
                    box-shadow: 0 0 0 2px rgba(249,115,22,0.2) !important;
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#0F172A',
    },
    content: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    headerCard: {
        background: '#1E293B',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #334155',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    avatarLarge: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#F97316',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: '800',
        color: '#fff',
        flexShrink: 0,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: '24px',
        fontWeight: '800',
        color: '#F8FAFC',
        marginBottom: '4px',
    },
    headerEmail: {
        fontSize: '15px',
        color: '#64748B',
        marginBottom: '12px',
    },
    headerBadges: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    subBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
    },
    verifiedBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        background: '#22C55E20',
        color: '#22C55E',
        border: '1px solid #22C55E40',
    },
    tabs: {
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        background: '#1E293B',
        padding: '4px',
        borderRadius: '10px',
        border: '1px solid #334155',
        flexWrap: 'wrap',
    },
    tab: {
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
    tabActive: {
        background: '#F97316',
        color: '#fff',
    },
    card: {
        background: '#1E293B',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #334155',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '8px',
    },
    cardSubtitle: {
        fontSize: '14px',
        color: '#64748B',
        marginBottom: '28px',
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
    input: {
        padding: '12px 14px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '15px',
        transition: 'all 0.2s',
    },
    planBox: {
        padding: '12px 14px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
    },
    planText: {
        fontSize: '14px',
        color: '#94A3B8',
    },
    saveBtn: {
        padding: '12px 24px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        alignSelf: 'flex-start',
        transition: 'all 0.2s',
    },
    errorText: {
        fontSize: '12px',
        color: '#EF4444',
    },
    passwordRules: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '12px 16px',
        background: '#0F172A',
        borderRadius: '8px',
        border: '1px solid #334155',
    },
    ruleItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    notifList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px',
    },
    notifItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: '#0F172A',
        borderRadius: '10px',
        border: '1px solid #334155',
    },
    notifLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    notifIcon: {
        fontSize: '24px',
    },
    notifLabel: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: '2px',
    },
    notifDesc: {
        fontSize: '13px',
        color: '#64748B',
    },
    toggle: {
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        flexShrink: 0,
    },
    toggleKnob: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: '2px',
        transition: 'transform 0.2s',
    },
    dangerBox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        background: '#EF444410',
        borderRadius: '10px',
        border: '1px solid #EF444430',
        gap: '16px',
        flexWrap: 'wrap',
    },
    dangerInfo: {
        flex: 1,
    },
    dangerTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#EF4444',
        marginBottom: '6px',
    },
    dangerText: {
        fontSize: '13px',
        color: '#94A3B8',
        lineHeight: '1.5',
    },
    deleteBtn: {
        padding: '10px 20px',
        background: '#EF4444',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
    getEpisodes,
    createEpisode,
    deleteEpisode
} from '../utils/api';
import Navbar from '../components/common/Navbar';

const NICHES = [
    'Technology', 'Business & Entrepreneurship', 'Health & Wellness',
    'True Crime', 'Education', 'Entertainment', 'Sports',
    'Politics & News', 'Science', 'Personal Development',
    'Finance', 'Arts & Culture', 'History', 'Comedy',
    'Religion & Spirituality', 'Society & Culture',
    'Kids & Family', 'Music', 'Travel', 'Food'
];

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        podcastNiche: '',
        episodeTopic: '',
        tone: 'Professional',
        episodeDuration: 60
    });

    useEffect(() => {
        fetchEpisodes();
    }, []);

    const fetchEpisodes = async () => {
        try {
            const res = await getEpisodes();
            setEpisodes(res.data.episodes);
        } catch (error) {
            toast.error('Failed to load episodes');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateEpisode = async (e) => {
        e.preventDefault();
        if (!formData.podcastNiche || !formData.episodeTopic) {
            toast.error('Please fill in all required fields');
            return;
        }
        setCreating(true);
        try {
            const res = await createEpisode(formData);
            toast.success('Episode created successfully!');
            setEpisodes([res.data.episode, ...episodes]);
            setShowForm(false);
            setFormData({
                podcastNiche: '',
                episodeTopic: '',
                tone: 'Professional',
                episodeDuration: 60
            });
            navigate(`/episode/${res.data.episode._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create episode');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteEpisode = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this episode?')) return;
        try {
            await deleteEpisode(id);
            setEpisodes(episodes.filter(ep => ep._id !== id));
            toast.success('Episode deleted successfully');
        } catch (error) {
            toast.error('Failed to delete episode');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: '#64748B',
            research: '#3B82F6',
            planning: '#F97316',
            complete: '#22C55E'
        };
        return colors[status] || '#64748B';
    };

    const getStatusIcon = (status) => {
        const icons = {
            draft: '📝',
            research: '🔍',
            planning: '📋',
            complete: '✅'
        };
        return icons[status] || '📝';
    };

    const monthlyCount = episodes.filter(ep => {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return new Date(ep.createdAt) >= start;
    }).length;

    return (
        <div style={styles.container}>
            <Navbar />
            <div style={styles.content}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.welcome}>
                            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
                        </h1>
                        <p style={styles.welcomeSub}>
                            Ready to plan your next podcast episode?
                        </p>
                    </div>
                    <button
                        style={styles.newEpisodeBtn}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? '✕ Cancel' : '+ New Episode'}
                    </button>
                </div>

                {/* Stats Row */}
                <div style={styles.statsRow}>
                    {[
                        {
                            label: 'Total Episodes',
                            value: episodes.length,
                            icon: '🎙️',
                            color: '#F97316'
                        },
                        {
                            label: 'This Month',
                            value: `${monthlyCount}/${user?.subscription === 'free' ? '3' : '∞'}`,
                            icon: '📅',
                            color: '#3B82F6'
                        },
                        {
                            label: 'Completed',
                            value: episodes.filter(e => e.status === 'complete').length,
                            icon: '✅',
                            color: '#22C55E'
                        },
                        {
                            label: 'Plan Type',
                            value: user?.subscription === 'free' ? 'Free' : 'Premium',
                            icon: '⭐',
                            color: '#EAB308'
                        }
                    ].map((stat, i) => (
                        <div key={i} style={styles.statCard}>
                            <div style={styles.statIcon}>{stat.icon}</div>
                            <div>
                                <div style={{
                                    ...styles.statValue,
                                    color: stat.color
                                }}>
                                    {stat.value}
                                </div>
                                <div style={styles.statLabel}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Episode Form */}
                {showForm && (
                    <div style={styles.formCard}>
                        <h2 style={styles.formTitle}>🎙️ Create New Episode</h2>
                        <p style={styles.formSubtitle}>
                            Provide your podcast details to get started
                        </p>
                        <form onSubmit={handleCreateEpisode} style={styles.form}>
                            <div style={styles.formGrid}>
                                {/* Niche */}
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        Podcast Niche <span style={styles.required}>*</span>
                                    </label>
                                    <select
                                        name="podcastNiche"
                                        value={formData.podcastNiche}
                                        onChange={handleChange}
                                        style={styles.select}
                                        required
                                    >
                                        <option value="">Select a niche...</option>
                                        {NICHES.map(niche => (
                                            <option key={niche} value={niche}>
                                                {niche}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tone */}
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Episode Tone</label>
                                    <select
                                        name="tone"
                                        value={formData.tone}
                                        onChange={handleChange}
                                        style={styles.select}
                                    >
                                        {['Casual', 'Professional', 'Humorous', 'Serious'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Topic */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Episode Topic or Guest Name{' '}
                                    <span style={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="episodeTopic"
                                    placeholder="e.g. The Future of AI, or Guest: Elon Musk"
                                    value={formData.episodeTopic}
                                    onChange={handleChange}
                                    style={styles.input}
                                    maxLength={200}
                                    required
                                />
                                <span style={styles.charCount}>
                                    {formData.episodeTopic.length}/200
                                </span>
                            </div>

                            {/* Duration */}
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Episode Duration: {formData.episodeDuration} minutes
                                </label>
                                <input
                                    type="range"
                                    name="episodeDuration"
                                    min="15"
                                    max="120"
                                    step="5"
                                    value={formData.episodeDuration}
                                    onChange={handleChange}
                                    style={styles.range}
                                />
                                <div style={styles.rangeLabels}>
                                    <span>15 min</span>
                                    <span>120 min</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                style={{
                                    ...styles.submitBtn,
                                    opacity: creating ? 0.7 : 1
                                }}
                            >
                                {creating ? '⏳ Creating...' : '🚀 Create Episode & Analyze Intent'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Episodes List */}
                <div style={styles.episodesSection}>
                    <h2 style={styles.sectionTitle}>
                        Recent Episodes
                        <span style={styles.episodeCount}>
                            {episodes.length}
                        </span>
                    </h2>

                    {loading ? (
                        <div style={styles.loadingState}>
                            <div style={styles.spinner}></div>
                            <p>Loading episodes...</p>
                        </div>
                    ) : episodes.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>🎙️</div>
                            <h3 style={styles.emptyTitle}>No Episodes Yet</h3>
                            <p style={styles.emptyText}>
                                Create your first episode to get started with AI-powered planning
                            </p>
                            <button
                                style={styles.emptyBtn}
                                onClick={() => setShowForm(true)}
                            >
                                + Create First Episode
                            </button>
                        </div>
                    ) : (
                        <div style={styles.episodeGrid}>
                            {episodes.map(episode => (
                                <div
                                    key={episode._id}
                                    style={styles.episodeCard}
                                    onClick={() => navigate(`/episode/${episode._id}`)}
                                >
                                    <div style={styles.episodeCardHeader}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            background: getStatusColor(episode.status) + '20',
                                            color: getStatusColor(episode.status),
                                            border: `1px solid ${getStatusColor(episode.status)}40`
                                        }}>
                                            {getStatusIcon(episode.status)}{' '}
                                            {episode.status.charAt(0).toUpperCase() +
                                             episode.status.slice(1)}
                                        </span>
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={(e) =>
                                                handleDeleteEpisode(episode._id, e)
                                            }
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <h3 style={styles.episodeTitle}>
                                        {episode.episodeTopic}
                                    </h3>

                                    <div style={styles.episodeMeta}>
                                        <span style={styles.metaTag}>
                                            🎯 {episode.podcastNiche}
                                        </span>
                                        <span style={styles.metaTag}>
                                            🎭 {episode.tone}
                                        </span>
                                        <span style={styles.metaTag}>
                                            ⏱️ {episode.episodeDuration} min
                                        </span>
                                    </div>

                                    {episode.guests && episode.guests.length > 0 && (
                                        <div style={styles.guestRow}>
                                            👥 {episode.guests.length} guest
                                            {episode.guests.length > 1 ? 's' : ''}:
                                            {episode.guests.map(g => g.name).join(', ')}
                                        </div>
                                    )}

                                    <div style={styles.episodeFooter}>
                                        <span style={styles.dateText}>
                                            📅 {new Date(episode.createdAt)
                                                .toLocaleDateString()}
                                        </span>
                                        <span style={styles.viewBtn}>
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                select option {
                    background: #1E293B;
                    color: #F8FAFC;
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    welcome: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#F8FAFC',
        marginBottom: '4px',
    },
    welcomeSub: {
        fontSize: '15px',
        color: '#64748B',
    },
    newEpisodeBtn: {
        padding: '12px 24px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
    },
    statCard: {
        background: '#1E293B',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    statIcon: {
        fontSize: '32px',
    },
    statValue: {
        fontSize: '24px',
        fontWeight: '800',
    },
    statLabel: {
        fontSize: '13px',
        color: '#64748B',
        marginTop: '2px',
    },
    formCard: {
        background: '#1E293B',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #334155',
        marginBottom: '32px',
        borderLeft: '4px solid #F97316',
    },
    formTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '8px',
    },
    formSubtitle: {
        fontSize: '14px',
        color: '#64748B',
        marginBottom: '24px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
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
    required: {
        color: '#EF4444',
    },
    select: {
        padding: '12px 14px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '15px',
        cursor: 'pointer',
    },
    input: {
        padding: '12px 14px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '15px',
    },
    charCount: {
        fontSize: '12px',
        color: '#64748B',
        textAlign: 'right',
    },
    range: {
        width: '100%',
        accentColor: '#F97316',
    },
    rangeLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748B',
    },
    submitBtn: {
        padding: '14px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    episodesSection: {
        marginTop: '8px',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    episodeCount: {
        background: '#F97316',
        color: '#fff',
        borderRadius: '20px',
        padding: '2px 10px',
        fontSize: '14px',
        fontWeight: '700',
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px',
        color: '#64748B',
        gap: '16px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #334155',
        borderTop: '3px solid #F97316',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 40px',
        background: '#1E293B',
        borderRadius: '16px',
        border: '1px dashed #334155',
    },
    emptyIcon: {
        fontSize: '64px',
        marginBottom: '16px',
    },
    emptyTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '8px',
    },
    emptyText: {
        fontSize: '15px',
        color: '#64748B',
        marginBottom: '24px',
    },
    emptyBtn: {
        padding: '12px 24px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    episodeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '16px',
    },
    episodeCard: {
        background: '#1E293B',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #334155',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    episodeCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    statusBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px',
        borderRadius: '4px',
        transition: 'all 0.2s',
    },
    episodeTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '12px',
        lineHeight: '1.4',
    },
    episodeMeta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px',
    },
    metaTag: {
        background: '#0F172A',
        color: '#94A3B8',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        border: '1px solid #334155',
    },
    guestRow: {
        fontSize: '13px',
        color: '#64748B',
        marginBottom: '12px',
        padding: '8px 12px',
        background: '#0F172A',
        borderRadius: '6px',
    },
    episodeFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #334155',
    },
    dateText: {
        fontSize: '12px',
        color: '#64748B',
    },
    viewBtn: {
        fontSize: '13px',
        color: '#F97316',
        fontWeight: '600',
    },
};

export default Dashboard;
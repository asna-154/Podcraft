import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getEpisodes, deleteEpisode } from '../utils/api';
import Navbar from '../components/common/Navbar';

const EpisodeHistoryPage = () => {
    const navigate = useNavigate();
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterNiche, setFilterNiche] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchEpisodes();
    }, []);

    const fetchEpisodes = async () => {
        try {
            const res = await getEpisodes();
            setEpisodes(res.data.episodes);
        } catch (error) {
            toast.error('Failed to load episode history');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this episode?')) return;
        try {
            await deleteEpisode(id);
            setEpisodes(episodes.filter(ep => ep._id !== id));
            toast.success('Episode deleted');
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

    const filteredEpisodes = episodes.filter(ep => {
        const matchesSearch =
            ep.episodeTopic.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            ep.podcastNiche.toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesNiche = filterNiche === 'all' ||
            ep.podcastNiche === filterNiche;
        const matchesStatus = filterStatus === 'all' ||
            ep.status === filterStatus;
        return matchesSearch && matchesNiche && matchesStatus;
    });

    const uniqueNiches = [...new Set(episodes.map(ep => ep.podcastNiche))];

    return (
        <div style={styles.container}>
            <Navbar />
            <div style={styles.content}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>📚 Episode History</h1>
                        <p style={styles.subtitle}>
                            All your podcast episodes in one place
                        </p>
                    </div>
                    <button
                        style={styles.newBtn}
                        onClick={() => navigate('/dashboard')}
                    >
                        + New Episode
                    </button>
                </div>

                {/* Stats */}
                <div style={styles.statsRow}>
                    {[
                        {
                            label: 'Total Episodes',
                            value: episodes.length,
                            icon: '🎙️',
                            color: '#F97316'
                        },
                        {
                            label: 'In Research',
                            value: episodes.filter(
                                e => e.status === 'research'
                            ).length,
                            icon: '🔍',
                            color: '#3B82F6'
                        },
                        {
                            label: 'In Planning',
                            value: episodes.filter(
                                e => e.status === 'planning'
                            ).length,
                            icon: '📋',
                            color: '#F97316'
                        },
                        {
                            label: 'Completed',
                            value: episodes.filter(
                                e => e.status === 'complete'
                            ).length,
                            icon: '✅',
                            color: '#22C55E'
                        }
                    ].map((stat, i) => (
                        <div key={i} style={styles.statCard}>
                            <span style={styles.statIcon}>{stat.icon}</span>
                            <div>
                                <div style={{
                                    ...styles.statValue,
                                    color: stat.color
                                }}>
                                    {stat.value}
                                </div>
                                <div style={styles.statLabel}>
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Filters */}
                <div style={styles.filtersCard}>
                    <input
                        type="text"
                        placeholder="🔍 Search episodes by topic or niche..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <div style={styles.filterRow}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Niche:</label>
                            <select
                                value={filterNiche}
                                onChange={(e) =>
                                    setFilterNiche(e.target.value)
                                }
                                style={styles.select}
                            >
                                <option value="all">All Niches</option>
                                {uniqueNiches.map(niche => (
                                    <option key={niche} value={niche}>
                                        {niche}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Status:</label>
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                style={styles.select}
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="research">Research</option>
                                <option value="planning">Planning</option>
                                <option value="complete">Complete</option>
                            </select>
                        </div>
                        <span style={styles.resultCount}>
                            {filteredEpisodes.length} result
                            {filteredEpisodes.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Episodes List */}
                {loading ? (
                    <div style={styles.loadingState}>
                        <div style={styles.spinner}></div>
                        <p style={{ color: '#64748B' }}>
                            Loading history...
                        </p>
                    </div>
                ) : filteredEpisodes.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <h3 style={styles.emptyTitle}>
                            {episodes.length === 0
                                ? 'No Episodes Yet'
                                : 'No Results Found'}
                        </h3>
                        <p style={styles.emptyText}>
                            {episodes.length === 0
                                ? 'Create your first episode to get started'
                                : 'Try adjusting your search or filters'}
                        </p>
                        {episodes.length === 0 && (
                            <button
                                style={styles.createBtn}
                                onClick={() => navigate('/dashboard')}
                            >
                                + Create Episode
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={styles.episodeList}>
                        {filteredEpisodes.map(episode => (
                            <div
                                key={episode._id}
                                style={styles.episodeCard}
                                onClick={() =>
                                    navigate(`/episode/${episode._id}`)
                                }
                            >
                                <div style={styles.episodeLeft}>
                                    <div style={styles.episodeIconBox}>
                                        🎙️
                                    </div>
                                    <div style={styles.episodeInfo}>
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
                                                ⏱️ {episode.episodeDuration}min
                                            </span>
                                            {episode.guests?.length > 0 && (
                                                <span style={styles.metaTag}>
                                                    👥 {episode.guests.length} guest
                                                    {episode.guests.length > 1
                                                        ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <span style={styles.dateText}>
                                            📅 Created:{' '}
                                            {new Date(episode.createdAt)
                                                .toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                        </span>
                                    </div>
                                </div>
                                <div style={styles.episodeRight}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        background: getStatusColor(
                                            episode.status
                                        ) + '20',
                                        color: getStatusColor(episode.status),
                                        border: `1px solid ${getStatusColor(episode.status)}40`
                                    }}>
                                        {episode.status.charAt(0).toUpperCase()
                                            + episode.status.slice(1)}
                                    </span>
                                    <div style={styles.actionBtns}>
                                        <button
                                            style={styles.viewBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(
                                                    `/episode/${episode._id}`
                                                );
                                            }}
                                        >
                                            View →
                                        </button>
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={(e) =>
                                                handleDelete(episode._id, e)
                                            }
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                select option { background: #1E293B; color: #F8FAFC; }
                input:focus, select:focus {
                    outline: none;
                    border-color: #F97316 !important;
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
        maxWidth: '1000px',
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
    title: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#F8FAFC',
        marginBottom: '4px',
    },
    subtitle: {
        fontSize: '15px',
        color: '#64748B',
    },
    newBtn: {
        padding: '12px 24px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
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
        fontSize: '28px',
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
    filtersCard: {
        background: '#1E293B',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #334155',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    searchInput: {
        padding: '12px 16px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '15px',
        width: '100%',
    },
    filterRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    filterLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748B',
    },
    select: {
        padding: '8px 12px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '14px',
        cursor: 'pointer',
    },
    resultCount: {
        marginLeft: 'auto',
        fontSize: '13px',
        color: '#64748B',
        fontWeight: '600',
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px',
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
    createBtn: {
        padding: '12px 24px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    episodeList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    episodeCard: {
        background: '#1E293B',
        borderRadius: '12px',
        padding: '20px 24px',
        border: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        gap: '16px',
        flexWrap: 'wrap',
    },
    episodeLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: 1,
    },
    episodeIconBox: {
        fontSize: '32px',
        flexShrink: 0,
    },
    episodeInfo: {
        flex: 1,
    },
    episodeTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '8px',
    },
    episodeMeta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '6px',
    },
    metaTag: {
        background: '#0F172A',
        color: '#94A3B8',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        border: '1px solid #334155',
    },
    dateText: {
        fontSize: '12px',
        color: '#64748B',
    },
    episodeRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
    },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    actionBtns: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    viewBtn: {
        padding: '6px 14px',
        background: '#F9731620',
        color: '#F97316',
        border: '1px solid #F9731640',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '6px',
        borderRadius: '6px',
    },
};

export default EpisodeHistoryPage;
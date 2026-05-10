import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getResearch,
    getEpisode,
    bookmarkTopic,
    rejectTopic,
    refreshResearch,
    getBookmarkedTopics
} from '../utils/api';
import Navbar from '../components/common/Navbar';

const ResearchPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [episode, setEpisode] = useState(null);
    const [research, setResearch] = useState([]);
    const [bookmarked, setBookmarked] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchData = async () => {
        try {
            const [episodeRes, researchRes, bookmarkedRes] = await Promise.all([
                getEpisode(id),
                getResearch(id),
                getBookmarkedTopics(id)
            ]);
            setEpisode(episodeRes.data.episode);
            setResearch(researchRes.data.research);
            setBookmarked(bookmarkedRes.data.bookmarkedTopics);
        } catch (error) {
            toast.error('Failed to load research');
            navigate(`/episode/${id}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBookmark = async (researchId) => {
        try {
            const res = await bookmarkTopic(researchId);
            // Update research list
            setResearch(research.map(r =>
                r._id === researchId
                    ? { ...r, isBookmarked: res.data.isBookmarked }
                    : r
            ));
            // Update bookmarked list
            if (res.data.isBookmarked) {
                const item = research.find(r => r._id === researchId);
                setBookmarked([...bookmarked,
                { ...item, isBookmarked: true }]);
            } else {
                setBookmarked(bookmarked.filter(b => b._id !== researchId));
            }
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message ||
                'Failed to bookmark topic');
        }
    };

    const handleReject = async (researchId) => {
        try {
            await rejectTopic(researchId);
            setResearch(research.filter(r => r._id !== researchId));
            setBookmarked(bookmarked.filter(b => b._id !== researchId));
            toast.success('Topic rejected');
        } catch (error) {
            toast.error('Failed to reject topic');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await refreshResearch(id);
            setResearch(res.data.research);
            const bookmarkedRes = await getBookmarkedTopics(id);
            setBookmarked(bookmarkedRes.data.bookmarkedTopics);
            toast.success('Research refreshed successfully!');
        } catch (error) {
            toast.error('Failed to refresh research');
        } finally {
            setRefreshing(false);
        }
    };

    const getFilteredResearch = () => {
        let filtered = research;

        if (activeCategory !== 'all') {
            filtered = filtered.filter(r => r.category === activeCategory);
        }

        if (activeFilter === 'recent') {
            filtered = filtered.filter(r =>
                r.publicationDate.includes('day') ||
                r.publicationDate.includes('hour')
            );
        } else if (activeFilter === 'relevant') {
            filtered = filtered.filter(r => r.relevanceScore >= 0.9);
        }

        return filtered;
    };

    const getRelevanceColor = (score) => {
        if (score >= 0.95) return '#22C55E';
        if (score >= 0.85) return '#F97316';
        return '#64748B';
    };

    const getCategoryColor = (category) => {
        const colors = {
            'News': '#3B82F6',
            'Academic': '#8B5CF6',
            'Social Media': '#EC4899',
            'Industry Blogs': '#F97316',
            'Podcasts': '#22C55E'
        };
        return colors[category] || '#64748B';
    };

    const displayResearch = activeTab === 'bookmarked'
        ? bookmarked
        : getFilteredResearch();

    if (loading) {
        return (
            <div style={styles.container}>
                <Navbar />
                <div style={styles.loadingState}>
                    <div style={styles.spinner}></div>
                    <p style={{ color: '#64748B' }}>
                        Loading research...
                    </p>
                </div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Navbar />
            <div style={styles.content}>
                {/* Back Button */}
                <button
                    style={styles.backBtn}
                    onClick={() => navigate(`/episode/${id}`)}
                >
                    ← Back to Episode
                </button>

                {/* Header */}
                <div style={styles.headerCard}>
                    <div style={styles.headerTop}>
                        <div>
                            <div style={styles.breadcrumb}>
                                🔍 Topic Research Agent
                            </div>
                            <h1 style={styles.title}>
                                {episode?.episodeTopic}
                            </h1>
                            <p style={styles.subtitle}>
                                {episode?.podcastNiche} •{' '}
                                {research.length} topics found •{' '}
                                {bookmarked.length}/10 bookmarked
                            </p>
                        </div>
                        <button
                            style={{
                                ...styles.refreshBtn,
                                opacity: refreshing ? 0.7 : 1
                            }}
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Research'}
                        </button>
                    </div>

                    {/* Bookmark Progress */}
                    <div style={styles.progressSection}>
                        <div style={styles.progressHeader}>
                            <span style={styles.progressLabel}>
                                Bookmarks: {bookmarked.length}/10
                            </span>
                            <span style={styles.progressHint}>
                                Bookmark at least 1 topic to proceed
                            </span>
                        </div>
                        <div style={styles.progressBar}>
                            <div style={{
                                ...styles.progressFill,
                                width: `${(bookmarked.length / 10) * 100}%`
                            }} />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {[
                        {
                            key: 'all',
                            label: `All Topics (${research.length})`
                        },
                        {
                            key: 'bookmarked',
                            label: `Bookmarked (${bookmarked.length})`
                        }
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

                {/* Filters — only show on all tab */}
                {activeTab === 'all' && (
                    <div style={styles.filtersRow}>
                        {/* Recency Filter */}
                        <div style={styles.filterGroup}>
                            <span style={styles.filterLabel}>
                                Filter:
                            </span>
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'recent', label: 'Recent' },
                                { key: 'relevant', label: 'Most Relevant' }
                            ].map(f => (
                                <button
                                    key={f.key}
                                    style={{
                                        ...styles.filterBtn,
                                        ...(activeFilter === f.key
                                            ? styles.filterBtnActive : {})
                                    }}
                                    onClick={() => setActiveFilter(f.key)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Category Filter */}
                        <div style={styles.filterGroup}>
                            <span style={styles.filterLabel}>
                                Category:
                            </span>
                            {[
                                'all', 'News', 'Academic',
                                'Industry Blogs', 'Podcasts'
                            ].map(cat => (
                                <button
                                    key={cat}
                                    style={{
                                        ...styles.filterBtn,
                                        ...(activeCategory === cat
                                            ? styles.filterBtnActive : {})
                                    }}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat === 'all' ? 'All' : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Research List */}
                {displayResearch.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>
                            {activeTab === 'bookmarked' ? '🔖' : '🔍'}
                        </div>
                        <h3 style={styles.emptyTitle}>
                            {activeTab === 'bookmarked'
                                ? 'No Bookmarked Topics Yet'
                                : 'No Topics Found'}
                        </h3>
                        <p style={styles.emptyText}>
                            {activeTab === 'bookmarked'
                                ? 'Bookmark topics from the All Topics tab to save them here'
                                : 'Try changing your filters or refreshing the research'}
                        </p>
                    </div>
                ) : (
                    <div style={styles.researchList}>
                        {displayResearch.map((item, index) => (
                            <div key={item._id} style={styles.researchCard}>
                                {/* Card Header */}
                                <div style={styles.cardHeader}>
                                    <div style={styles.cardHeaderLeft}>
                                        <span style={styles.cardNumber}>
                                            #{index + 1}
                                        </span>
                                        <span style={{
                                            ...styles.categoryBadge,
                                            background: getCategoryColor(
                                                item.category
                                            ) + '20',
                                            color: getCategoryColor(
                                                item.category
                                            ),
                                            border: `1px solid ${getCategoryColor(item.category)}40`
                                        }}>
                                            {item.category}
                                        </span>
                                        <span style={styles.dateBadge}>
                                            📅 {item.publicationDate}
                                        </span>
                                    </div>
                                    <div style={styles.cardHeaderRight}>
                                        <span style={{
                                            ...styles.relevanceScore,
                                            color: getRelevanceColor(
                                                item.relevanceScore
                                            )
                                        }}>
                                            {Math.round(
                                                item.relevanceScore * 100
                                            )}% Match
                                        </span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 style={styles.researchTitle}>
                                    {item.title}
                                </h3>

                                {/* Summary */}
                                <p style={styles.researchSummary}>
                                    {item.summary}
                                </p>

                                {/* Source - FIXED */}
                                <div style={styles.sourceRow}>
                                    <span style={styles.sourceLabel}>
                                        📰 Source:
                                    </span>
                                    <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.sourceLink}
                                    >
                                        {item.source} ↗
                                    </a>
                                </div>

                                {/* Actions */}
                                <div style={styles.cardActions}>
                                    <button
                                        style={{
                                            ...styles.bookmarkBtn,
                                            background: item.isBookmarked
                                                ? '#F9731620'
                                                : '#334155',
                                            color: item.isBookmarked
                                                ? '#F97316'
                                                : '#94A3B8',
                                            border: item.isBookmarked
                                                ? '1px solid #F9731640'
                                                : '1px solid #334155'
                                        }}
                                        onClick={() =>
                                            handleBookmark(item._id)
                                        }
                                    >
                                        {item.isBookmarked
                                            ? '🔖 Bookmarked'
                                            : '+ Bookmark'}
                                    </button>
                                    {!item.isBookmarked && (
                                        <button
                                            style={styles.rejectBtn}
                                            onClick={() =>
                                                handleReject(item._id)
                                            }
                                        >
                                            ✕ Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bottom CTA */}
                {bookmarked.length > 0 && (
                    <div style={styles.bottomCta}>
                        <div style={styles.ctaLeft}>
                            <h3 style={styles.ctaTitle}>
                                ✅ {bookmarked.length} topic
                                {bookmarked.length > 1 ? 's' : ''} bookmarked!
                            </h3>
                            <p style={styles.ctaText}>
                                You're ready to proceed with episode planning.
                                Your bookmarked topics will be used for
                                question generation.
                            </p>
                        </div>
                        <button
                            style={styles.ctaBtn}
                            onClick={() => navigate(`/episode/${id}`)}
                        >
                            Continue Planning →
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
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
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
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
    backBtn: {
        background: 'none',
        border: 'none',
        color: '#64748B',
        fontSize: '14px',
        cursor: 'pointer',
        marginBottom: '24px',
        padding: '0',
    },
    headerCard: {
        background: '#1E293B',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #334155',
        marginBottom: '24px',
        borderLeft: '4px solid #3B82F6',
    },
    headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
    },
    breadcrumb: {
        fontSize: '13px',
        color: '#3B82F6',
        fontWeight: '600',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    title: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#F8FAFC',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748B',
    },
    refreshBtn: {
        padding: '10px 20px',
        background: '#334155',
        color: '#F8FAFC',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
    },
    progressSection: {
        marginTop: '8px',
    },
    progressHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    progressLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#F8FAFC',
    },
    progressHint: {
        fontSize: '12px',
        color: '#64748B',
    },
    progressBar: {
        height: '6px',
        background: '#334155',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        background: '#F97316',
        borderRadius: '3px',
        transition: 'width 0.3s ease',
    },
    tabs: {
        display: 'flex',
        gap: '4px',
        marginBottom: '20px',
        background: '#1E293B',
        padding: '4px',
        borderRadius: '10px',
        border: '1px solid #334155',
        width: 'fit-content',
    },
    tab: {
        padding: '8px 20px',
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
    filtersRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px',
        background: '#1E293B',
        borderRadius: '10px',
        border: '1px solid #334155',
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
    },
    filterLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748B',
        minWidth: '70px',
    },
    filterBtn: {
        padding: '5px 12px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '6px',
        color: '#94A3B8',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    filterBtnActive: {
        background: '#F9731620',
        color: '#F97316',
        border: '1px solid #F9731640',
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
        fontSize: '14px',
        color: '#64748B',
    },
    researchList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    researchCard: {
        background: '#1E293B',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #334155',
        transition: 'all 0.2s',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px',
    },
    cardHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
    },
    cardHeaderRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    cardNumber: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#64748B',
        background: '#0F172A',
        padding: '2px 8px',
        borderRadius: '4px',
        border: '1px solid #334155',
    },
    categoryBadge: {
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    dateBadge: {
        fontSize: '12px',
        color: '#64748B',
    },
    relevanceScore: {
        fontSize: '13px',
        fontWeight: '700',
    },
    researchTitle: {
        fontSize: '17px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '10px',
        lineHeight: '1.4',
    },
    researchSummary: {
        fontSize: '14px',
        color: '#94A3B8',
        lineHeight: '1.6',
        marginBottom: '14px',
    },
    sourceRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '16px',
    },
    sourceLabel: {
        fontSize: '13px',
        color: '#64748B',
    },
    sourceLink: {
        fontSize: '13px',
        color: '#3B82F6',
        textDecoration: 'none',
        fontWeight: '600',
    },
    cardActions: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    bookmarkBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    rejectBtn: {
        padding: '8px 16px',
        background: 'none',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#64748B',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    bottomCta: {
        marginTop: '24px',
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #22C55E40',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
    },
    ctaLeft: {
        flex: 1,
    },
    ctaTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: '8px',
    },
    ctaText: {
        fontSize: '14px',
        color: '#64748B',
        lineHeight: '1.5',
    },
    ctaBtn: {
        padding: '14px 28px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
    },
};

export default ResearchPage;
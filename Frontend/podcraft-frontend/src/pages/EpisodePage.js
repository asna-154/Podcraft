import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getEpisode,
    updateEpisode,
    addGuest,
    editGuest,
    deleteGuest,
    generateResearch
} from '../utils/api';
import Navbar from '../components/common/Navbar';

const EpisodePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [episode, setEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [editingEpisode, setEditingEpisode] = useState(false);
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [guestForm, setGuestForm] = useState({
        name: '',
        profession: '',
        url: '',
        bio: ''
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchEpisode();
    }, [id]);
    const fetchEpisode = async () => {
        try {
            const res = await getEpisode(id);
            setEpisode(res.data.episode);
            setEditForm({
                podcastNiche: res.data.episode.podcastNiche,
                episodeTopic: res.data.episode.episodeTopic,
                tone: res.data.episode.tone,
                episodeDuration: res.data.episode.episodeDuration
            });
        } catch (error) {
            toast.error('Failed to load episode');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEpisode = async () => {
        try {
            const res = await updateEpisode(id, editForm);
            setEpisode(res.data.episode);
            setEditingEpisode(false);
            toast.success('Episode updated successfully');
        } catch (error) {
            toast.error('Failed to update episode');
        }
    };

    const handleAddGuest = async (e) => {
        e.preventDefault();
        try {
            const res = await addGuest(id, guestForm);
            setEpisode({ ...episode, guests: res.data.guests });
            setShowGuestForm(false);
            setGuestForm({ name: '', profession: '', url: '', bio: '' });
            toast.success('Guest added successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add guest');
        }
    };

    const handleEditGuest = async (guestId) => {
        try {
            const res = await editGuest(id, guestId, guestForm);
            setEpisode({ ...episode, guests: res.data.guests });
            setEditingGuest(null);
            setGuestForm({ name: '', profession: '', url: '', bio: '' });
            toast.success('Guest updated successfully');
        } catch (error) {
            toast.error('Failed to update guest');
        }
    };

    const handleDeleteGuest = async (guestId) => {
        if (!window.confirm('Remove this guest?')) return;
        try {
            const res = await deleteGuest(id, guestId);
            setEpisode({ ...episode, guests: res.data.guests });
            toast.success('Guest removed successfully');
        } catch (error) {
            toast.error('Failed to remove guest');
        }
    };

    const handleGenerateResearch = async () => {
        setGenerating(true);
        try {
            await generateResearch(id);
            toast.success('Research generated! Redirecting...');
            navigate(`/research/${id}`);
        } catch (error) {
            toast.error('Failed to generate research');
        } finally {
            setGenerating(false);
        }
    };

    const startEditGuest = (guest) => {
        setEditingGuest(guest._id);
        setGuestForm({
            name: guest.name,
            profession: guest.profession || '',
            url: guest.url || '',
            bio: guest.bio || ''
        });
    };

    const NICHES = [
        'Technology', 'Business & Entrepreneurship', 'Health & Wellness',
        'True Crime', 'Education', 'Entertainment', 'Sports',
        'Politics & News', 'Science', 'Personal Development',
        'Finance', 'Arts & Culture', 'History', 'Comedy',
        'Religion & Spirituality', 'Society & Culture',
        'Kids & Family', 'Music', 'Travel', 'Food'
    ];

    if (loading) {
        return (
            <div style={styles.container}>
                <Navbar />
                <div style={styles.loadingState}>
                    <div style={styles.spinner}></div>
                    <p style={{ color: '#64748B' }}>Loading episode...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
                    onClick={() => navigate('/dashboard')}
                >
                    ← Back to Dashboard
                </button>

                {/* Episode Header */}
                <div style={styles.headerCard}>
                    <div style={styles.headerTop}>
                        <div style={styles.headerLeft}>
                            <div style={styles.nicheBadge}>
                                🎯 {episode.podcastNiche}
                            </div>
                            <h1 style={styles.episodeTitle}>
                                {episode.episodeTopic}
                            </h1>
                            <div style={styles.episodeMeta}>
                                <span style={styles.metaItem}>
                                    🎭 {episode.tone}
                                </span>
                                <span style={styles.metaItem}>
                                    ⏱️ {episode.episodeDuration} minutes
                                </span>
                                <span style={styles.metaItem}>
                                    📅 {new Date(episode.createdAt)
                                        .toLocaleDateString()}
                                </span>
                                <span style={{
                                    ...styles.statusBadge,
                                    background: episode.status === 'complete'
                                        ? '#22C55E20' : '#F9731620',
                                    color: episode.status === 'complete'
                                        ? '#22C55E' : '#F97316',
                                }}>
                                    {episode.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <button
                            style={styles.editBtn}
                            onClick={() => setEditingEpisode(!editingEpisode)}
                        >
                            {editingEpisode ? '✕ Cancel' : '✏️ Edit'}
                        </button>
                    </div>

                    {/* Edit Form */}
                    {editingEpisode && (
                        <div style={styles.editForm}>
                            <div style={styles.editGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        Podcast Niche
                                    </label>
                                    <select
                                        value={editForm.podcastNiche}
                                        onChange={(e) => setEditForm({
                                            ...editForm,
                                            podcastNiche: e.target.value
                                        })}
                                        style={styles.select}
                                    >
                                        {NICHES.map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Tone</label>
                                    <select
                                        value={editForm.tone}
                                        onChange={(e) => setEditForm({
                                            ...editForm,
                                            tone: e.target.value
                                        })}
                                        style={styles.select}
                                    >
                                        {['Casual', 'Professional',
                                            'Humorous', 'Serious'].map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Episode Topic</label>
                                <input
                                    type="text"
                                    value={editForm.episodeTopic}
                                    onChange={(e) => setEditForm({
                                        ...editForm,
                                        episodeTopic: e.target.value
                                    })}
                                    style={styles.input}
                                    maxLength={200}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Duration: {editForm.episodeDuration} min
                                </label>
                                <input
                                    type="range"
                                    min="15"
                                    max="120"
                                    step="5"
                                    value={editForm.episodeDuration}
                                    onChange={(e) => setEditForm({
                                        ...editForm,
                                        episodeDuration: parseInt(e.target.value)
                                    })}
                                    style={styles.range}
                                />
                            </div>
                            <button
                                style={styles.saveBtn}
                                onClick={handleUpdateEpisode}
                            >
                                💾 Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* AI Agent Status */}
                <div style={styles.agentStatus}>
                    <h2 style={styles.sectionTitle}>🤖 AI Agent Status</h2>
                    <div style={styles.agentGrid}>
                        {[
                            {
                                name: 'Intent Analyzer',
                                icon: '🧠',
                                status: 'complete',
                                desc: 'Analyzed niche & topic'
                            },
                            {
                                name: 'Topic Research',
                                icon: '🔍',
                                status: episode.researchStatus,
                                desc: episode.researchStatus === 'complete'
                                    ? 'Research ready'
                                    : 'Pending research'
                            },
                            {
                                name: 'Guest Analyzer',
                                icon: '👤',
                                status: episode.guests?.length > 0
                                    ? 'complete' : 'pending',
                                desc: episode.guests?.length > 0
                                    ? `${episode.guests.length} guest(s) analyzed`
                                    : 'No guests added'
                            },
                        ].map((agent, i) => (
                            <div key={i} style={styles.agentCard}>
                                <div style={styles.agentIcon}>{agent.icon}</div>
                                <div style={styles.agentInfo}>
                                    <p style={styles.agentName}>{agent.name}</p>
                                    <p style={styles.agentDesc}>{agent.desc}</p>
                                </div>
                                <div style={{
                                    ...styles.agentBadge,
                                    background: agent.status === 'complete'
                                        ? '#22C55E20' : '#64748B20',
                                    color: agent.status === 'complete'
                                        ? '#22C55E' : '#64748B',
                                }}>
                                    {agent.status === 'complete' ? '✓' : '○'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Guest Management */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            👥 Guest Management
                            <span style={styles.countBadge}>
                                {episode.guests?.length || 0}/3
                            </span>
                        </h2>
                        {episode.guests?.length < 3 && (
                            <button
                                style={styles.addBtn}
                                onClick={() => {
                                    setShowGuestForm(!showGuestForm);
                                    setEditingGuest(null);
                                    setGuestForm({
                                        name: '',
                                        profession: '',
                                        url: '',
                                        bio: ''
                                    });
                                }}
                            >
                                {showGuestForm ? '✕ Cancel' : '+ Add Guest'}
                            </button>
                        )}
                    </div>

                    {/* Guest Form */}
                    {showGuestForm && (
                        <form
                            onSubmit={handleAddGuest}
                            style={styles.guestForm}
                        >
                            <h3 style={styles.guestFormTitle}>
                                Add New Guest
                            </h3>
                            <div style={styles.editGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        Guest Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={guestForm.name}
                                        onChange={(e) => setGuestForm({
                                            ...guestForm,
                                            name: e.target.value
                                        })}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>
                                        Profession
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. AI Researcher"
                                        value={guestForm.profession}
                                        onChange={(e) => setGuestForm({
                                            ...guestForm,
                                            profession: e.target.value
                                        })}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Website / LinkedIn URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={guestForm.url}
                                    onChange={(e) => setGuestForm({
                                        ...guestForm,
                                        url: e.target.value
                                    })}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Guest Bio (optional)
                                </label>
                                <textarea
                                    placeholder="Brief description of the guest..."
                                    value={guestForm.bio}
                                    onChange={(e) => setGuestForm({
                                        ...guestForm,
                                        bio: e.target.value
                                    })}
                                    style={styles.textarea}
                                    rows={3}
                                />
                            </div>
                            <button
                                type="submit"
                                style={styles.saveBtn}
                            >
                                👤 Add & Analyze Guest
                            </button>
                        </form>
                    )}

                    {/* Guest List */}
                    {episode.guests?.length === 0 ? (
                        <div style={styles.emptyGuests}>
                            <p>No guests added yet.</p>
                            <p style={{ fontSize: '13px', marginTop: '4px' }}>
                                Add up to 3 guests for better question generation
                            </p>
                        </div>
                    ) : (
                        <div style={styles.guestList}>
                            {episode.guests.map(guest => (
                                <div key={guest._id} style={styles.guestCard}>
                                    {editingGuest === guest._id ? (
                                        <div style={styles.guestEditForm}>
                                            <div style={styles.editGrid}>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>
                                                        Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={guestForm.name}
                                                        onChange={(e) =>
                                                            setGuestForm({
                                                                ...guestForm,
                                                                name: e.target.value
                                                            })
                                                        }
                                                        style={styles.input}
                                                    />
                                                </div>
                                                <div style={styles.inputGroup}>
                                                    <label style={styles.label}>
                                                        Profession
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={guestForm.profession}
                                                        onChange={(e) =>
                                                            setGuestForm({
                                                                ...guestForm,
                                                                profession: e.target.value
                                                            })
                                                        }
                                                        style={styles.input}
                                                    />
                                                </div>
                                            </div>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>
                                                    Bio
                                                </label>
                                                <textarea
                                                    value={guestForm.bio}
                                                    onChange={(e) =>
                                                        setGuestForm({
                                                            ...guestForm,
                                                            bio: e.target.value
                                                        })
                                                    }
                                                    style={styles.textarea}
                                                    rows={2}
                                                />
                                            </div>
                                            <div style={styles.guestEditBtns}>
                                                <button
                                                    style={styles.saveBtn}
                                                    onClick={() =>
                                                        handleEditGuest(guest._id)
                                                    }
                                                >
                                                    💾 Save
                                                </button>
                                                <button
                                                    style={styles.cancelBtn}
                                                    onClick={() =>
                                                        setEditingGuest(null)
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={styles.guestCardHeader}>
                                                <div style={styles.guestAvatar}>
                                                    {guest.name.charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div style={styles.guestInfo}>
                                                    <p style={styles.guestName}>
                                                        {guest.name}
                                                    </p>
                                                    {guest.profession && (
                                                        <p style={styles.guestProfession}>
                                                            {guest.profession}
                                                        </p>
                                                    )}
                                                </div>
                                                <div style={styles.guestActions}>
                                                    <button
                                                        style={styles.iconBtn}
                                                        onClick={() =>
                                                            startEditGuest(guest)
                                                        }
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        style={styles.iconBtn}
                                                        onClick={() =>
                                                            handleDeleteGuest(
                                                                guest._id
                                                            )
                                                        }
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            {guest.generatedSummary && (
                                                <div style={styles.guestSummary}>
                                                    <p style={styles.summaryLabel}>
                                                        AI Summary:
                                                    </p>
                                                    <p style={styles.summaryText}>
                                                        {guest.generatedSummary}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Generate Research CTA */}
                <div style={styles.ctaCard}>
                    <div style={styles.ctaLeft}>
                        <h2 style={styles.ctaTitle}>
                            🔍 Ready to Research?
                        </h2>
                        <p style={styles.ctaText}>
                            {episode.researchStatus === 'complete'
                                ? 'Research is complete! View your topics and bookmark the best ones.'
                                : 'Generate AI-powered topic research based on your niche and episode topic.'}
                        </p>
                    </div>
                    <button
                        style={{
                            ...styles.ctaBtn,
                            opacity: generating ? 0.7 : 1
                        }}
                        onClick={episode.researchStatus === 'complete'
                            ? () => navigate(`/research/${id}`)
                            : handleGenerateResearch
                        }
                        disabled={generating}
                    >
                        {generating
                            ? '⏳ Generating...'
                            : episode.researchStatus === 'complete'
                                ? '📊 View Research →'
                                : '🚀 Generate Research'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                select option { background: #1E293B; color: #F8FAFC; }
                input:focus, select:focus, textarea:focus {
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
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    headerCard: {
        background: '#1E293B',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #334155',
        marginBottom: '24px',
        borderLeft: '4px solid #F97316',
    },
    headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
    },
    headerLeft: {
        flex: 1,
    },
    nicheBadge: {
        display: 'inline-block',
        background: '#F9731620',
        color: '#F97316',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '12px',
        border: '1px solid #F9731640',
    },
    episodeTitle: {
        fontSize: '24px',
        fontWeight: '800',
        color: '#F8FAFC',
        marginBottom: '12px',
        lineHeight: '1.3',
    },
    episodeMeta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
    },
    metaItem: {
        background: '#0F172A',
        color: '#94A3B8',
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        border: '1px solid #334155',
    },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '0.5px',
    },
    editBtn: {
        padding: '8px 16px',
        background: '#334155',
        color: '#F8FAFC',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    editForm: {
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    editGrid: {
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
    select: {
        padding: '10px 14px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '14px',
        cursor: 'pointer',
    },
    input: {
        padding: '10px 14px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '14px',
    },
    textarea: {
        padding: '10px 14px',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#F8FAFC',
        fontSize: '14px',
        resize: 'vertical',
    },
    range: {
        width: '100%',
        accentColor: '#F97316',
    },
    saveBtn: {
        padding: '10px 20px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        alignSelf: 'flex-start',
    },
    cancelBtn: {
        padding: '10px 20px',
        background: '#334155',
        color: '#F8FAFC',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    agentStatus: {
        background: '#1E293B',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #334155',
        marginBottom: '24px',
    },
    agentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '12px',
        marginTop: '16px',
    },
    agentCard: {
        background: '#0F172A',
        borderRadius: '10px',
        padding: '16px',
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    agentIcon: {
        fontSize: '24px',
    },
    agentInfo: {
        flex: 1,
    },
    agentName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#F8FAFC',
        marginBottom: '2px',
    },
    agentDesc: {
        fontSize: '12px',
        color: '#64748B',
    },
    agentBadge: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '700',
    },
    section: {
        background: '#1E293B',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #334155',
        marginBottom: '24px',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    countBadge: {
        background: '#334155',
        color: '#94A3B8',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '13px',
    },
    addBtn: {
        padding: '8px 16px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    guestForm: {
        background: '#0F172A',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #334155',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    guestFormTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#F8FAFC',
    },
    emptyGuests: {
        textAlign: 'center',
        padding: '32px',
        color: '#64748B',
        background: '#0F172A',
        borderRadius: '10px',
        border: '1px dashed #334155',
    },
    guestList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    guestCard: {
        background: '#0F172A',
        borderRadius: '10px',
        padding: '16px',
        border: '1px solid #334155',
    },
    guestEditForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    guestEditBtns: {
        display: 'flex',
        gap: '8px',
    },
    guestCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
    },
    guestAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: '#F97316',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '700',
        color: '#fff',
        flexShrink: 0,
    },
    guestInfo: {
        flex: 1,
    },
    guestName: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#F8FAFC',
    },
    guestProfession: {
        fontSize: '13px',
        color: '#64748B',
        marginTop: '2px',
    },
    guestActions: {
        display: 'flex',
        gap: '4px',
    },
    iconBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '6px',
        borderRadius: '6px',
        transition: 'all 0.2s',
    },
    guestSummary: {
        background: '#1E293B',
        borderRadius: '8px',
        padding: '12px',
        border: '1px solid #334155',
    },
    summaryLabel: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#F97316',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px',
    },
    summaryText: {
        fontSize: '13px',
        color: '#94A3B8',
        lineHeight: '1.5',
    },
    ctaCard: {
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #F9731640',
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
        fontSize: '20px',
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

export default EpisodePage;
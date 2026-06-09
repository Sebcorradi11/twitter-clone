import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getProfile, getUserTweets, followUser, updateProfile, getUserLikes } from '../services/api'
import TweetList from '../components/tweet/TweetList'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'

/* ── Helpers ── */
const toTitleCase = (str) =>
    (str || '').toLowerCase().replace(/\b(\w)/g, c => c.toUpperCase())

/* ── Icons ── */
const ArrowIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
    </svg>
)
const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M7 4V2H5v2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2V2h-2v2H7zm-4 7h18v9H3v-9zm0-2V6h18v3H3z" />
    </svg>
)
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
    </svg>
)

/* ── Edit Modal ── */
function EditModal({ profile, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: profile.name || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        banner: localStorage.getItem(`banner_${profile.id}`) || '',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true))
    }, [])

    const handleClose = () => {
        setVisible(false)
        setTimeout(onClose, 180)
    }

    const handleSave = async () => {
        if (!form.name.trim()) return
        setSaving(true)
        setError(null)
        try {
            await updateProfile({ name: form.name, bio: form.bio, avatar: form.avatar })
            if (form.banner) localStorage.setItem(`banner_${profile.id}`, form.banner)
            else localStorage.removeItem(`banner_${profile.id}`)
            onSaved({ name: form.name, bio: form.bio, avatar: form.avatar, banner: form.banner })
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    const Field = ({ label, children }) => (
        <div
            className="relative rounded-xl pt-6 pb-2 px-3 transition-colors"
            style={{ border: '1px solid var(--border)' }}
        >
            <label className="absolute left-3 top-2 text-xs font-medium" style={{ color: 'var(--text2)' }}>
                {label}
            </label>
            {children}
        </div>
    )

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200"
            style={{
                background: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
                backdropFilter: visible ? 'blur(2px)' : 'none',
            }}
            onClick={handleClose}
        >
            <div
                className="w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    background: 'var(--bg)',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'scale(1)' : 'scale(0.95)',
                    transition: 'opacity 200ms ease, transform 200ms cubic-bezier(0.34,1.2,0.64,1)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
                    style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
                >
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full transition-all duration-150 hover:scale-110"
                        style={{ color: 'var(--text)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        <CloseIcon />
                    </button>
                    <h2 className="font-extrabold text-[17px]" style={{ color: 'var(--text)' }}>
                        Editar perfil
                    </h2>
                    <button
                        onClick={handleSave}
                        disabled={saving || !form.name.trim()}
                        className="px-5 py-1.5 rounded-full font-bold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-85"
                        style={{ background: 'var(--text)', color: 'var(--bg)' }}
                    >
                        {saving ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>

                <div className="px-4 pb-6 flex flex-col gap-5 pt-4">
                    {error && (
                        <p className="text-[13px] px-3 py-2 rounded-xl bg-red-50 text-red-500 border border-red-200">
                            {error}
                        </p>
                    )}

                    {/* Banner */}
                    <div>
                        <div
                            className="w-full h-[110px] rounded-xl overflow-hidden mb-3 flex items-center justify-center"
                            style={{
                                background: form.banner
                                    ? `url(${form.banner}) center/cover no-repeat`
                                    : 'linear-gradient(135deg, #667eea40, #764ba240)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            {!form.banner && (
                                <span className="text-xs" style={{ color: 'var(--text2)' }}>
                                    Vista previa del banner
                                </span>
                            )}
                        </div>
                        <Field label="URL de banner">
                            <input
                                type="url"
                                value={form.banner}
                                onChange={e => setForm(f => ({ ...f, banner: e.target.value }))}
                                placeholder="https://..."
                                className="w-full bg-transparent text-[15px] focus:outline-none"
                                style={{ color: 'var(--text)' }}
                            />
                        </Field>
                    </div>

                    {/* Avatar */}
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div
                                className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 transition-transform duration-200"
                                style={{
                                    border: '3px solid var(--bg)',
                                    boxShadow: '0 0 0 2px var(--border)',
                                }}
                            >
                                {form.avatar
                                    ? <img src={form.avatar} alt="" className="w-full h-full object-cover"
                                        onError={e => { e.target.style.display = 'none' }} />
                                    : <div className="w-full h-full" style={{ background: 'var(--bg2)' }} />
                                }
                            </div>
                            <span className="text-[13px]" style={{ color: 'var(--text2)' }}>
                                Vista previa del avatar
                            </span>
                        </div>
                        <Field label="URL de foto de perfil">
                            <input
                                type="url"
                                value={form.avatar}
                                onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
                                placeholder="https://..."
                                className="w-full bg-transparent text-[15px] focus:outline-none"
                                style={{ color: 'var(--text)' }}
                            />
                        </Field>
                    </div>

                    {/* Name */}
                    <Field label="Nombre">
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            maxLength={50}
                            className="w-full bg-transparent text-[15px] focus:outline-none"
                            style={{ color: 'var(--text)' }}
                        />
                    </Field>

                    {/* Bio */}
                    <Field label="Bio">
                        <textarea
                            value={form.bio}
                            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                            rows={3}
                            maxLength={160}
                            className="w-full bg-transparent text-[15px] focus:outline-none resize-none"
                            style={{ color: 'var(--text)' }}
                        />
                        <span className="absolute right-3 bottom-2 text-xs" style={{ color: form.bio.length > 140 ? '#f4212e' : 'var(--text2)' }}>
                            {160 - form.bio.length}
                        </span>
                    </Field>
                </div>
            </div>
        </div>
    )
}

/* ── Tabs ── */
const TABS = [
    { id: 'posts',   label: 'Publicaciones' },
    { id: 'replies', label: 'Respuestas'    },
    { id: 'likes',   label: 'Me gusta'      },
]

/* ── Profile page ── */
export default function Profile() {
    const { username } = useParams()
    const { user: currentUser } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [following, setFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [activeTab, setActiveTab] = useState('posts')
    const [activeTabIndex, setActiveTabIndex] = useState(0)
    const [editOpen, setEditOpen] = useState(false)
    const [banner, setBanner] = useState('')

    useEffect(() => {
        setLoading(true)
        setActiveTab('posts')
        setActiveTabIndex(0)
        getProfile(username)
            .then(res => {
                const u = res.data.user
                setProfile(u)
                setFollowing(u.isFollowing)
                setFollowersCount(u.followersCount)
                setBanner(localStorage.getItem(`banner_${u.id}`) || '')
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [username])

    const handleTabChange = (tab, idx) => {
        setActiveTab(tab)
        setActiveTabIndex(idx)
    }

    const handleFollow = async () => {
        try {
            const res = await followUser(profile.id)
            setFollowing(res.data.following)
            setFollowersCount(res.data.followersCount)
        } catch (err) { console.error(err) }
    }

    const fetchPosts = useCallback(
        (cursor) => getUserTweets(username, cursor),
        [username]
    )
    const fetchReplies = useCallback(async (cursor) => {
        const res = await getUserTweets(username, cursor)
        return {
            data: {
                ...res.data,
                tweets: (res.data.tweets || []).filter(t => t.parentId !== null),
            },
        }
    }, [username])
    const fetchLikes = useCallback(async () => {
        const res = await getUserLikes(username)
        return {
            data: { tweets: res.data.tweets || [], nextCursor: null, hasMore: false },
        }
    }, [username])

    const tabFetch = { posts: fetchPosts, replies: fetchReplies, likes: fetchLikes }

    const isOwnProfile = currentUser?.username === username

    const StickyHeader = () => (
        <div
            className="sticky top-0 z-10 backdrop-blur-md px-4 py-3 flex items-center gap-4"
            style={{ background: 'var(--bg-glass)', borderBottom: '1px solid var(--border)' }}
        >
            <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full transition-all duration-150"
                style={{ color: 'var(--text)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
            >
                <ArrowIcon />
            </button>
            <div>
                <h1 className="font-extrabold text-[19px]" style={{ color: 'var(--text)' }}>
                    {profile ? toTitleCase(profile.name) : 'Perfil'}
                </h1>
                {profile && (
                    <p className="text-[13px]" style={{ color: 'var(--text2)' }}>
                        {profile.tweetsCount ?? 0} publicaciones
                    </p>
                )}
            </div>
        </div>
    )

    if (loading) return (
        <div>
            <StickyHeader />
            <div className="flex justify-center py-16"><Spinner /></div>
        </div>
    )

    if (!profile) return (
        <div>
            <StickyHeader />
            <div className="p-12 text-center">
                <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                    Usuario no encontrado
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
                    Intentá buscar otra cuenta.
                </p>
            </div>
        </div>
    )

    const joinedDate = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
        : null

    const hasBanner = !!banner

    return (
        <div>
            {editOpen && (
                <EditModal
                    profile={profile}
                    onClose={() => setEditOpen(false)}
                    onSaved={(updated) => {
                        setProfile(p => ({ ...p, ...updated }))
                        setBanner(updated.banner || '')
                        setEditOpen(false)
                    }}
                />
            )}

            <StickyHeader />

            {/* Banner */}
            <div
                className="h-[140px] sm:h-[200px] overflow-hidden"
                style={hasBanner
                    ? {
                        backgroundImage: `url(${banner})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }
                    : {
                        background: 'linear-gradient(135deg, #667eea55 0%, #764ba255 50%, #1d9bf033 100%)',
                    }
                }
            />

            {/* Profile info */}
            <div className="px-4 pb-2">
                {/* Avatar + action button row */}
                <div className="flex justify-between items-start -mt-12 sm:-mt-16 mb-4">
                    {/* Avatar with border + hover scale */}
                    <div
                        className="rounded-full transition-transform duration-200 hover:scale-105 cursor-pointer"
                        style={{
                            padding: '4px',
                            background: 'var(--bg)',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                        }}
                        onClick={() => isOwnProfile && setEditOpen(true)}
                        title={isOwnProfile ? 'Editar perfil' : undefined}
                    >
                        <Avatar src={profile.avatar} username={profile.username} size="xl" />
                    </div>

                    {/* Action button */}
                    <div className="mt-14 sm:mt-20">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setEditOpen(true)}
                                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                                style={{
                                    border: '1px solid var(--text)',
                                    color: 'var(--text)',
                                    background: 'transparent',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'var(--text)'
                                    e.currentTarget.style.color = 'var(--bg)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'var(--text)'
                                }}
                            >
                                Editar perfil
                            </button>
                        ) : (
                            <button
                                onClick={handleFollow}
                                className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-200"
                                style={following
                                    ? { border: '1px solid var(--border)', color: 'var(--text)', background: 'transparent' }
                                    : { background: 'var(--text)', color: 'var(--bg)' }
                                }
                                onMouseEnter={e => {
                                    if (following) {
                                        e.currentTarget.style.borderColor = '#f4212e'
                                        e.currentTarget.style.color = '#f4212e'
                                    } else {
                                        e.currentTarget.style.opacity = '0.85'
                                    }
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.opacity = '1'
                                    if (following) {
                                        e.currentTarget.style.borderColor = 'var(--border)'
                                        e.currentTarget.style.color = 'var(--text)'
                                    }
                                }}
                            >
                                {following ? 'Siguiendo' : 'Seguir'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Name + username */}
                <div className="mb-3">
                    <h2 className="text-xl font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
                        {toTitleCase(profile.name)}
                    </h2>
                    <p className="text-[15px]" style={{ color: 'var(--text2)' }}>
                        @{profile.username}
                    </p>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p className="text-[15px] leading-relaxed mb-3" style={{ color: 'var(--text)' }}>
                        {profile.bio}
                    </p>
                )}

                {/* Joined date */}
                {joinedDate && (
                    <div
                        className="flex items-center gap-1.5 mb-3 text-[14px]"
                        style={{ color: 'var(--text2)' }}
                    >
                        <CalendarIcon />
                        <span>Se unió en {joinedDate}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="flex gap-5 text-[14px]">
                    <span className="group cursor-pointer">
                        <strong className="font-bold" style={{ color: 'var(--text)' }}>
                            {profile.followingCount ?? 0}
                        </strong>{' '}
                        <span
                            className="transition-all duration-150 group-hover:underline"
                            style={{ color: 'var(--text2)' }}
                        >
                            Siguiendo
                        </span>
                    </span>
                    <span className="group cursor-pointer">
                        <strong className="font-bold" style={{ color: 'var(--text)' }}>
                            {followersCount}
                        </strong>{' '}
                        <span
                            className="transition-all duration-150 group-hover:underline"
                            style={{ color: 'var(--text2)' }}
                        >
                            {followersCount === 1 ? 'Seguidor' : 'Seguidores'}
                        </span>
                    </span>
                </div>
            </div>

            {/* Tabs with sliding indicator */}
            <div
                className="relative flex mt-1"
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                {TABS.map((tab, idx) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id, idx)}
                        className="flex-1 py-4 text-[15px] relative transition-colors duration-150"
                        style={{
                            color: activeTab === tab.id ? 'var(--text)' : 'var(--text2)',
                            fontWeight: activeTab === tab.id ? 700 : 400,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        {tab.label}
                    </button>
                ))}

                {/* Sliding indicator */}
                <div
                    className="absolute bottom-0 flex justify-center pointer-events-none"
                    style={{
                        width: `${100 / TABS.length}%`,
                        transform: `translateX(${activeTabIndex * 100}%)`,
                        transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                >
                    <span
                        className="rounded-full"
                        style={{ width: '56px', height: '4px', background: '#1D9BF0' }}
                    />
                </div>
            </div>

            {/* Tab content — key forces remount + fade-in */}
            <div key={activeTab} className="tab-content">
                <TweetList
                    fetchFn={tabFetch[activeTab]}
                    emptyTitle={
                        activeTab === 'posts'   ? 'Sin publicaciones aún' :
                        activeTab === 'replies' ? 'Sin respuestas aún'    :
                                                  'Sin me gusta aún'
                    }
                />
            </div>

            <div className="h-20 md:hidden" />
        </div>
    )
}

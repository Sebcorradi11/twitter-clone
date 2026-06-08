import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getProfile, getUserTweets, followUser, updateProfile } from '../services/api'
import TweetList from '../components/tweet/TweetList'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'

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

/* ── Edit Profile Modal ── */
function EditModal({ profile, onClose, onSaved }) {
    const [form, setForm] = useState({ name: profile.name || '', bio: profile.bio || '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const handleSave = async () => {
        if (!form.name.trim()) return
        setSaving(true)
        setError(null)
        try {
            await updateProfile(form)
            onSaved(form)
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-[600px] rounded-2xl p-6"
                style={{ background: 'var(--bg)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full transition-colors"
                        style={{ color: 'var(--text)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                            <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
                        </svg>
                    </button>
                    <h2 className="font-extrabold text-[19px]" style={{ color: 'var(--text)' }}>
                        Editar perfil
                    </h2>
                    <button
                        onClick={handleSave}
                        disabled={saving || !form.name.trim()}
                        className="px-5 py-1.5 rounded-full font-bold text-sm transition-opacity disabled:opacity-50"
                        style={{ background: 'var(--text)', color: 'var(--bg)' }}
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                <div className="flex flex-col gap-4">
                    <div
                        className="relative rounded-md"
                        style={{ border: '1px solid var(--border)' }}
                    >
                        <label
                            className="absolute left-3 top-2 text-xs"
                            style={{ color: 'var(--text2)' }}
                        >
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            maxLength={50}
                            className="w-full bg-transparent pt-7 pb-2 px-3 text-base focus:outline-none"
                            style={{ color: 'var(--text)' }}
                        />
                    </div>

                    <div
                        className="relative rounded-md"
                        style={{ border: '1px solid var(--border)' }}
                    >
                        <label
                            className="absolute left-3 top-2 text-xs"
                            style={{ color: 'var(--text2)' }}
                        >
                            Bio
                        </label>
                        <textarea
                            value={form.bio}
                            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                            rows={3}
                            maxLength={160}
                            className="w-full bg-transparent pt-7 pb-2 px-3 text-base focus:outline-none resize-none"
                            style={{ color: 'var(--text)' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

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
    const [editOpen, setEditOpen] = useState(false)

    useEffect(() => {
        setLoading(true)
        setActiveTab('posts')
        getProfile(username)
            .then(res => {
                setProfile(res.data.user)
                setFollowing(res.data.user.isFollowing)
                setFollowersCount(res.data.user.followersCount)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [username])

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

    const isOwnProfile = currentUser?.username === username

    const StickyHeader = () => (
        <div
            className="sticky top-0 z-10 backdrop-blur-md px-4 py-3 flex items-center gap-5"
            style={{ background: 'var(--bg-glass)', borderBottom: '1px solid var(--border)' }}
        >
            <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full transition-colors"
                style={{ color: 'var(--text)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
            >
                <ArrowIcon />
            </button>
            <div>
                <h1 className="font-extrabold text-[19px]" style={{ color: 'var(--text)' }}>
                    {profile?.name ?? 'Perfil'}
                </h1>
                {profile && (
                    <p className="text-sm" style={{ color: 'var(--text2)' }}>
                        {profile.tweetsCount ?? 0} publicaciones
                    </p>
                )}
            </div>
        </div>
    )

    if (loading) return (
        <div>
            <StickyHeader />
            <Spinner />
        </div>
    )

    if (!profile) return (
        <div>
            <StickyHeader />
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text2)' }}>
                Usuario no encontrado
            </div>
        </div>
    )

    const joinedDate = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
        : null

    const tabs = [
        { id: 'posts',   label: 'Publicaciones' },
        { id: 'replies', label: 'Respuestas'    },
        { id: 'likes',   label: 'Me gusta'      },
    ]

    return (
        <div>
            {editOpen && (
                <EditModal
                    profile={profile}
                    onClose={() => setEditOpen(false)}
                    onSaved={(updated) => {
                        setProfile(p => ({ ...p, ...updated }))
                        setEditOpen(false)
                    }}
                />
            )}

            <StickyHeader />

            {/* Banner */}
            <div className="h-[130px] sm:h-[200px]" style={{ background: 'var(--bg2)' }} />

            {/* Profile info */}
            <div className="px-4 pb-4">
                <div className="flex justify-between items-start -mt-12 sm:-mt-16 mb-3">
                    <div
                        className="rounded-full p-1"
                        style={{ background: 'var(--bg)' }}
                    >
                        <Avatar src={profile.avatar} username={profile.username} size="xl" />
                    </div>

                    <div className="mt-16 sm:mt-20">
                        {isOwnProfile ? (
                            <button
                                onClick={() => setEditOpen(true)}
                                className="px-4 py-1.5 rounded-full font-bold text-sm transition-colors"
                                style={{
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    background: 'transparent',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                Editar perfil
                            </button>
                        ) : (
                            <button
                                onClick={handleFollow}
                                className="px-5 py-1.5 rounded-full font-bold text-sm transition-colors"
                                style={following
                                    ? { border: '1px solid var(--border)', color: 'var(--text)', background: 'transparent' }
                                    : { background: 'var(--text)', color: 'var(--bg)' }
                                }
                                onMouseEnter={e => {
                                    if (following) {
                                        e.currentTarget.style.borderColor = '#f4212e'
                                        e.currentTarget.style.color = '#f4212e'
                                    } else {
                                        e.currentTarget.style.opacity = '0.9'
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

                <h2 className="text-xl font-extrabold" style={{ color: 'var(--text)' }}>
                    {profile.name}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text2)' }}>@{profile.username}</p>

                {profile.bio && (
                    <p className="mt-3 text-[15px] leading-normal" style={{ color: 'var(--text)' }}>
                        {profile.bio}
                    </p>
                )}

                {joinedDate && (
                    <div className="flex items-center gap-1.5 mt-3 text-sm" style={{ color: 'var(--text2)' }}>
                        <CalendarIcon />
                        <span>Se unió en {joinedDate}</span>
                    </div>
                )}

                <div className="flex gap-5 mt-3 text-sm">
                    <span className="hover:underline cursor-pointer">
                        <strong style={{ color: 'var(--text)' }}>{profile.followingCount ?? 0}</strong>{' '}
                        <span style={{ color: 'var(--text2)' }}>Siguiendo</span>
                    </span>
                    <span className="hover:underline cursor-pointer">
                        <strong style={{ color: 'var(--text)' }}>{followersCount}</strong>{' '}
                        <span style={{ color: 'var(--text2)' }}>Seguidores</span>
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex-1 py-4 text-sm font-medium transition-colors relative"
                        style={{ color: activeTab === tab.id ? 'var(--text)' : 'var(--text2)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        <span style={{ fontWeight: activeTab === tab.id ? 700 : 400 }}>
                            {tab.label}
                        </span>
                        {activeTab === tab.id && (
                            <span
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                                style={{ width: '56px', height: '4px', background: '#1D9BF0' }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'posts' && <TweetList fetchFn={fetchPosts} />}

            {activeTab === 'replies' && <TweetList fetchFn={fetchReplies} />}

            {activeTab === 'likes' && (
                <div className="p-12 text-center">
                    <p className="font-extrabold text-[20px]" style={{ color: 'var(--text)' }}>
                        Próximamente
                    </p>
                    <p className="text-sm mt-2" style={{ color: 'var(--text2)' }}>
                        Los tweets que le gustan a @{username} aparecerán aquí.
                    </p>
                </div>
            )}

            <div className="h-20 md:hidden" />
        </div>
    )
}

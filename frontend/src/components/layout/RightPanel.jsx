import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { searchUsers, followUser } from '../../services/api'
import Avatar from '../ui/Avatar'

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" style={{ fill: 'var(--text2)' }}>
        <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.277 4.277-1.414 1.414-4.277-4.277C13.818 17.068 12.026 17.75 10.25 17.75c-4.694 0-8.5-3.806-8.5-8.5z" />
    </svg>
)

const INITIAL_COUNT = 3
const EXPANDED_COUNT = 6

function FollowButton({ userId, isFollowing: initialFollowing, followingIds, onToggle }) {
    const following = followingIds.has(userId)

    return (
        <button
            onClick={e => onToggle(e, userId)}
            className="px-4 py-1.5 rounded-full font-bold text-sm flex-shrink-0 transition-all"
            style={following
                ? {
                    border: '1px solid var(--border)',
                    color: 'var(--text2)',
                    background: 'transparent',
                }
                : {
                    border: '1px solid var(--text)',
                    color: 'var(--text)',
                    background: 'transparent',
                }
            }
            onMouseEnter={e => {
                if (following) {
                    e.currentTarget.style.borderColor = '#f4212e'
                    e.currentTarget.style.color = '#f4212e'
                } else {
                    e.currentTarget.style.background = 'var(--text)'
                    e.currentTarget.style.color = 'var(--bg)'
                }
            }}
            onMouseLeave={e => {
                if (following) {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text2)'
                } else {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text)'
                }
            }}
        >
            {following ? 'Siguiendo' : 'Seguir'}
        </button>
    )
}

export default function RightPanel() {
    const [query, setQuery] = useState('')
    const [allSuggestions, setAllSuggestions] = useState([])
    const [followingIds, setFollowingIds] = useState(new Set())
    const [expanded, setExpanded] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        searchUsers('a')
            .then(res => setAllSuggestions(res.data.users || []))
            .catch(() => {})
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
        else navigate('/search')
    }

    const handleFollow = async (e, userId) => {
        e.preventDefault()
        try {
            const res = await followUser(userId)
            setFollowingIds(prev => {
                const next = new Set(prev)
                if (res.data.following) next.add(userId)
                else next.delete(userId)
                return next
            })
        } catch (err) { console.error(err) }
    }

    const visibleSuggestions = expanded
        ? allSuggestions.slice(0, EXPANDED_COUNT)
        : allSuggestions.slice(0, INITIAL_COUNT)

    const canExpand = allSuggestions.length > INITIAL_COUNT

    return (
        <div className="pt-3 flex flex-col gap-4 sticky top-0 min-h-screen w-full">
            {/* Search box */}
            <form onSubmit={handleSearch} className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar en X"
                    className="w-full rounded-full px-5 py-3 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] transition-all"
                    style={{ background: 'var(--bg2)', color: 'var(--text)' }}
                />
            </form>

            {/* Who to follow */}
            {visibleSuggestions.length > 0 && (
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg2)' }}
                >
                    <h2
                        className="font-extrabold text-[20px] px-4 pt-4 pb-2"
                        style={{ color: 'var(--text)' }}
                    >
                        A quién seguir
                    </h2>

                    {visibleSuggestions.map((u, idx) => (
                        <div key={u.id}>
                            {idx > 0 && (
                                <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px' }} />
                            )}
                            <Link
                                to={`/${u.username}`}
                                className="flex items-center gap-3 px-4 py-3 transition-colors"
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = ''}
                            >
                                <Avatar src={u.avatar} username={u.username} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                                        {u.name}
                                    </p>
                                    <p className="text-sm truncate" style={{ color: 'var(--text2)' }}>
                                        @{u.username}
                                    </p>
                                </div>
                                <FollowButton
                                    userId={u.id}
                                    followingIds={followingIds}
                                    onToggle={handleFollow}
                                />
                            </Link>
                        </div>
                    ))}

                    {canExpand && (
                        <>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px' }} />
                            <button
                                onClick={() => setExpanded(p => !p)}
                                className="w-full text-center py-3 text-[#1d9bf0] text-sm font-medium transition-colors"
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = ''}
                            >
                                {expanded ? 'Ver menos' : 'Ver más'}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Project info card */}
            <div
                className="rounded-2xl px-4 py-4"
                style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#1D9BF0', color: '#fff' }}
                    >
                        BETA
                    </span>
                    <span className="font-extrabold text-[15px]" style={{ color: 'var(--text)' }}>
                        Challenge AI TwitterClone
                    </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
                    Clon funcional de X (Twitter) desarrollado como challenge técnico con React, Fastify y PostgreSQL.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                    {['React', 'Fastify', 'PostgreSQL', 'Prisma'].map(tag => (
                        <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--bg-hover)', color: 'var(--text2)', border: '1px solid var(--border)' }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
                {['Términos', 'Privacidad', 'Cookies', 'Accesibilidad'].map(label => (
                    <span key={label} className="text-xs cursor-default" style={{ color: 'var(--text2)' }}>
                        {label}
                    </span>
                ))}
                <span className="text-xs" style={{ color: 'var(--text2)' }}>© 2025 TwitterClone</span>
            </div>
        </div>
    )
}

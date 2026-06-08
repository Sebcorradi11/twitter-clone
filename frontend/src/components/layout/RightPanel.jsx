import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchUsers } from '../../services/api'
import Avatar from '../ui/Avatar'

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" style={{ fill: 'var(--text2)' }}>
        <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.277 4.277-1.414 1.414-4.277-4.277C13.818 17.068 12.026 17.75 10.25 17.75c-4.694 0-8.5-3.806-8.5-8.5z" />
    </svg>
)

export default function RightPanel() {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        searchUsers('a')
            .then(res => setSuggestions((res.data.users || []).slice(0, 3)))
            .catch(() => {})
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        navigate('/search')
    }

    return (
        <div className="pt-3 flex flex-col gap-4 sticky top-0">
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
                    className="w-full rounded-full px-5 py-3 pl-12 text-sm focus:outline-none focus:ring-1 focus:ring-[#1d9bf0] transition-all"
                    style={{ background: 'var(--bg2)', color: 'var(--text)' }}
                />
            </form>

            {/* Who to follow */}
            {suggestions.length > 0 && (
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

                    {suggestions.map(u => (
                        <Link
                            key={u.id}
                            to={`/${u.username}`}
                            className="flex items-center gap-3 px-4 py-3 transition-colors"
                            style={{ '--hover-bg': 'var(--bg-hover)' }}
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
                            <button
                                onClick={e => { e.preventDefault(); navigate(`/${u.username}`) }}
                                className="px-4 py-1.5 rounded-full font-bold text-sm flex-shrink-0 transition-opacity hover:opacity-80"
                                style={{ background: 'var(--text)', color: 'var(--bg)' }}
                            >
                                Seguir
                            </button>
                        </Link>
                    ))}

                    <Link
                        to="/search"
                        className="block px-4 py-4 text-[#1d9bf0] text-sm transition-colors"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        Ver más
                    </Link>
                </div>
            )}
        </div>
    )
}

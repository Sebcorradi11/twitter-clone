import { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchUsers } from '../services/api'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" style={{ color: 'var(--text2)' }}>
        <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.277 4.277-1.414 1.414-4.277-4.277C13.818 17.068 12.026 17.75 10.25 17.75c-4.694 0-8.5-3.806-8.5-8.5z" />
    </svg>
)

const XIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z" />
    </svg>
)

export default function Search() {
    const [query, setQuery] = useState('')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true)
        setSearched(true)
        try {
            const res = await searchUsers(query.trim())
            setUsers(res.data.users)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const handleClear = () => { setQuery(''); setUsers([]); setSearched(false) }

    return (
        <div>
            {/* Search header */}
            <div
                className="sticky top-0 z-10 backdrop-blur-md px-4 py-2"
                style={{ background: 'var(--bg-glass)', borderBottom: '1px solid var(--border)' }}
            >
                <form onSubmit={handleSearch} className="relative flex items-center">
                    <div className="absolute left-4 pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar usuarios"
                        className="w-full rounded-full px-5 py-2.5 pl-12 text-sm focus:outline-none focus:ring-1 focus:ring-[#1d9bf0] transition-all"
                        style={{ background: 'var(--bg2)', color: 'var(--text)' }}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-4 p-0.5 rounded-full text-white bg-[#1d9bf0] hover:bg-[#1a8cd8] transition-colors"
                        >
                            <XIcon />
                        </button>
                    )}
                </form>
            </div>

            {loading && <Spinner />}

            {!loading && searched && users.length === 0 && (
                <div className="px-4 py-12 text-center">
                    <p className="font-extrabold text-[23px]" style={{ color: 'var(--text)' }}>
                        Sin resultados para "{query}"
                    </p>
                    <p className="text-sm mt-2" style={{ color: 'var(--text2)' }}>
                        Intentá buscar con otro término.
                    </p>
                </div>
            )}

            {!loading && !searched && (
                <div className="px-4 py-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--text2)' }}>
                        Buscá personas por nombre o @usuario
                    </p>
                </div>
            )}

            {!loading && users.map(user => (
                <Link
                    key={user.id}
                    to={`/${user.username}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                    <Avatar src={user.avatar} username={user.username} />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{user.name}</p>
                        <p className="text-sm" style={{ color: 'var(--text2)' }}>@{user.username}</p>
                        {user.bio && (
                            <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text2)' }}>{user.bio}</p>
                        )}
                    </div>
                </Link>
            ))}

            <div className="h-20 md:hidden" />
        </div>
    )
}

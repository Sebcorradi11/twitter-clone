import { useState, useEffect, useCallback } from 'react'
import TweetCard from './TweetCard'
import Spinner from '../ui/Spinner'

const TweetEmptyIcon = () => (
    <svg viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: 'var(--text2)' }}>
        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 7.501 3.58 7.501 8 0 4.506-3.011 8.005-7.5 8.005h-1.061l-2.994 2.926-.95-.97 1.08-1.074c.145-.144.225-.34.225-.544v-.338h-.3c-4.421 0-8.005-3.58-8.005-8z" />
    </svg>
)

export default function TweetList({
    fetchFn,
    emptyTitle = 'No hay tweets todavía',
    emptySubtitle = '',
}) {
    const [tweets, setTweets] = useState([])
    const [cursor, setCursor] = useState(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const loadTweets = useCallback(async (cursorParam = null) => {
        if (loading) return
        setLoading(true)
        setError(null)
        try {
            const res = await fetchFn(cursorParam)
            const { tweets: newTweets, nextCursor, hasMore: more } = res.data
            setTweets(prev => cursorParam ? [...prev, ...newTweets] : newTweets)
            setCursor(nextCursor)
            setHasMore(more)
        } catch {
            setError('Error al cargar tweets')
        } finally {
            setLoading(false)
        }
    }, [fetchFn])

    useEffect(() => {
        setTweets([])
        setCursor(null)
        setHasMore(true)
        loadTweets(null)
    }, [fetchFn])

    const handleDelete = (id) => setTweets(prev => prev.filter(t => t.id !== id))

    if (error) {
        return (
            <div className="flex flex-col items-center gap-2 py-16 px-8 text-center">
                <p className="text-sm font-medium" style={{ color: '#f4212e' }}>{error}</p>
                <button
                    onClick={() => loadTweets(null)}
                    className="text-sm font-medium text-[#1d9bf0] hover:underline mt-1"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div>
            {tweets.map(tweet => (
                <TweetCard key={tweet.id} tweet={tweet} onDelete={handleDelete} />
            ))}

            {loading && <div className="py-6"><Spinner /></div>}

            {!loading && hasMore && tweets.length > 0 && (
                <button
                    onClick={() => loadTweets(cursor)}
                    className="w-full py-4 text-[14px] font-medium text-[#1d9bf0] transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                    Mostrar más tweets
                </button>
            )}

            {!loading && tweets.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 px-8 text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--bg2)' }}
                    >
                        <TweetEmptyIcon />
                    </div>
                    <p className="font-extrabold text-[23px] leading-tight mt-1" style={{ color: 'var(--text)' }}>
                        {emptyTitle}
                    </p>
                    {emptySubtitle && (
                        <p className="text-[15px] max-w-[280px] leading-relaxed" style={{ color: 'var(--text2)' }}>
                            {emptySubtitle}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

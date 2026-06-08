import { useState, useEffect, useCallback } from 'react'
import TweetCard from './TweetCard'
import Spinner from '../ui/Spinner'

export default function TweetList({ fetchFn }) {
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
        return <div className="p-8 text-center text-red-500 text-sm">{error}</div>
    }

    return (
        <div>
            {tweets.map(tweet => (
                <TweetCard key={tweet.id} tweet={tweet} onDelete={handleDelete} />
            ))}

            {loading && <Spinner />}

            {!loading && hasMore && tweets.length > 0 && (
                <button
                    onClick={() => loadTweets(cursor)}
                    className="w-full py-4 text-[#1d9bf0] text-sm font-medium transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                    Cargar más
                </button>
            )}

            {!loading && tweets.length === 0 && (
                <div className="p-8 text-center text-sm" style={{ color: 'var(--text2)' }}>
                    No hay tweets todavía
                </div>
            )}
        </div>
    )
}

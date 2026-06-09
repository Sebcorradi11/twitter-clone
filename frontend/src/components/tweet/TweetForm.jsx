import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { createTweet } from '../../services/api'
import Avatar from '../ui/Avatar'

export default function TweetForm({ onTweetCreated, parentId = null, placeholder = '¿Qué está pasando?' }) {
    const { user } = useAuth()
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const remaining = 280 - content.length
    const isOver = remaining < 0
    const isNear = remaining <= 20

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim() || isOver) return
        setLoading(true)
        setError(null)
        try {
            const res = await createTweet({ content, parentId })
            setContent('')
            onTweetCreated?.(res.data.tweet)
        } catch (err) {
            setError(err.response?.data?.error || 'Error al publicar')
        } finally {
            setLoading(false)
        }
    }

    /* circular progress radius=9 → circumference≈56.5 */
    const circ = 56.5
    const progress = Math.min(content.length / 280, 1)
    const dash = progress * circ

    return (
        <form
            onSubmit={handleSubmit}
            className="flex gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
        >
            <Link to={`/${user?.username}`} className="shrink-0">
                <Avatar src={user?.avatar} username={user?.username} />
            </Link>

            <div className="flex-1 flex flex-col gap-3 min-w-0">
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="w-full text-xl resize-none focus:outline-none leading-normal pt-2"
                    style={{ background: 'transparent', color: 'var(--text)' }}
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid var(--border)' }}
                >
                    {/* Character ring */}
                    <div className="flex items-center gap-2">
                        {content.length > 0 && (
                            <div className="relative w-6 h-6">
                                <svg viewBox="0 0 20 20" className="w-6 h-6 -rotate-90">
                                    <circle cx="10" cy="10" r="9" fill="none" strokeWidth="2"
                                        style={{ stroke: 'var(--border)' }} />
                                    <circle
                                        cx="10" cy="10" r="9" fill="none" strokeWidth="2"
                                        strokeLinecap="round"
                                        stroke={isOver ? '#f4212e' : isNear ? '#ffd400' : '#1d9bf0'}
                                        strokeDasharray={`${dash} ${circ}`}
                                    />
                                </svg>
                                {isNear && (
                                    <span
                                        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
                                        style={{ color: isOver ? '#f4212e' : 'var(--text2)' }}
                                    >
                                        {isOver ? `-${Math.abs(remaining)}` : remaining}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !content.trim() || isOver}
                        className="px-5 py-1.5 rounded-full font-bold text-sm text-white bg-[#1d9bf0] hover:bg-[#1a8cd8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Publicando...' : parentId ? 'Responder' : 'Publicar'}
                    </button>
                </div>
            </div>
        </form>
    )
}

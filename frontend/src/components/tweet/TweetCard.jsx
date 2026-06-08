import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { likeTweet, deleteTweet } from '../../services/api'
import Avatar from '../ui/Avatar'

function timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000)
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}d`
}

const ReplyIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 7.501 3.58 7.501 8 0 4.506-3.011 8.005-7.5 8.005h-1.061l-2.994 2.926-.95-.97 1.08-1.074c.145-.144.225-.34.225-.544v-.338h-.3c-4.421 0-8.005-3.58-8.005-8z" />
    </svg>
)

const LikeIcon = ({ filled }) => (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
        {filled
            ? <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
            : <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
        }
    </svg>
)

const RetweetIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
    </svg>
)

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] fill-current">
        <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.12 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.93 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07z" />
    </svg>
)

function ActionBtn({ onClick, color, children }) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-2 py-2 rounded-full transition-colors text-sm"
            style={{
                color: hovered ? color : 'var(--text2)',
                background: hovered ? `${color}18` : 'transparent',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
        </button>
    )
}

export default function TweetCard({ tweet, onDelete }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [liked, setLiked] = useState(Array.isArray(tweet.likes) && tweet.likes.length > 0)
    const [likesCount, setLikesCount] = useState(tweet._count?.likes ?? 0)
    const [deleted, setDeleted] = useState(false)

    if (deleted) return null

    const handleLike = async (e) => {
        e.stopPropagation()
        try {
            const res = await likeTweet(tweet.id)
            setLiked(res.data.liked)
            setLikesCount(res.data.likesCount)
        } catch (err) { console.error(err) }
    }

    const handleDelete = async (e) => {
        e.stopPropagation()
        if (!confirm('¿Eliminar este tweet?')) return
        try {
            await deleteTweet(tweet.id)
            setDeleted(true)
            onDelete?.(tweet.id)
        } catch (err) { console.error(err) }
    }

    const repliesCount = tweet._count?.replies ?? 0

    return (
        <article
            onClick={() => navigate(`/tweet/${tweet.id}`)}
            className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
            style={{ borderBottom: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
        >
            <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
                <Link to={`/${tweet.author?.username}`}>
                    <Avatar src={tweet.author?.avatar} username={tweet.author?.username} />
                </Link>
            </div>

            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-1 flex-wrap">
                    <Link
                        to={`/${tweet.author?.username}`}
                        onClick={e => e.stopPropagation()}
                        className="font-bold text-[15px] hover:underline truncate"
                        style={{ color: 'var(--text)' }}
                    >
                        {tweet.author?.name}
                    </Link>
                    <span className="text-[15px] truncate" style={{ color: 'var(--text2)' }}>
                        @{tweet.author?.username}
                    </span>
                    <span style={{ color: 'var(--text2)' }}>·</span>
                    <span className="text-[15px]" style={{ color: 'var(--text2)' }}>
                        {timeAgo(tweet.createdAt)}
                    </span>

                    {user?.username === tweet.author?.username && (
                        <button
                            onClick={handleDelete}
                            className="ml-auto p-1.5 rounded-full transition-colors"
                            style={{ color: 'var(--text2)' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = '#f4212e'
                                e.currentTarget.style.background = '#f4212e18'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = 'var(--text2)'
                                e.currentTarget.style.background = ''
                            }}
                        >
                            <TrashIcon />
                        </button>
                    )}
                </div>

                {/* Content */}
                <p
                    className="mt-1 text-[15px] leading-normal whitespace-pre-wrap break-words"
                    style={{ color: 'var(--text)' }}
                >
                    {tweet.content}
                </p>

                {/* Actions */}
                <div className="flex items-center mt-2 -ml-2">
                    <ActionBtn
                        onClick={e => { e.stopPropagation(); navigate(`/tweet/${tweet.id}`) }}
                        color="#1D9BF0"
                    >
                        <ReplyIcon />
                        {repliesCount > 0 && <span>{repliesCount}</span>}
                    </ActionBtn>

                    <ActionBtn onClick={e => e.stopPropagation()} color="#00BA7C">
                        <RetweetIcon />
                    </ActionBtn>

                    <ActionBtn onClick={handleLike} color="#F91880">
                        <span style={{ color: liked ? '#F91880' : 'inherit' }}>
                            <LikeIcon filled={liked} />
                        </span>
                        {likesCount > 0 && (
                            <span style={{ color: liked ? '#F91880' : 'inherit' }}>{likesCount}</span>
                        )}
                    </ActionBtn>
                </div>
            </div>
        </article>
    )
}

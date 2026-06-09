import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTweet } from '../services/api'
import TweetCard from '../components/tweet/TweetCard'
import TweetForm from '../components/tweet/TweetForm'
import Spinner from '../components/ui/Spinner'

const ArrowIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
    </svg>
)

export default function TweetDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [tweet, setTweet] = useState(null)
    const [replies, setReplies] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getTweet(id)
            .then(res => {
                setTweet(res.data.tweet)
                setReplies(res.data.tweet.replies || [])
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    const handleReplyCreated = (newReply) => setReplies(prev => [newReply, ...prev])

    const handleDelete = (deletedId) => {
        if (deletedId === tweet?.id) {
            navigate('/')
        } else {
            setReplies(prev => prev.filter(r => r.id !== deletedId))
        }
    }

    const Header = () => (
        <div
            className="sticky top-0 z-10 backdrop-blur-md px-4 py-3 flex items-center gap-6"
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
            <h1 className="font-extrabold text-[19px]" style={{ color: 'var(--text)' }}>
                Publicación
            </h1>
        </div>
    )

    if (loading) return (
        <div>
            <Header />
            <Spinner />
        </div>
    )

    if (!tweet) return (
        <div>
            <Header />
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text2)' }}>
                Tweet no encontrado
            </div>
        </div>
    )

    return (
        <div>
            <Header />
            <TweetCard tweet={tweet} onDelete={handleDelete} />
            <TweetForm
                parentId={tweet.id}
                onTweetCreated={handleReplyCreated}
                placeholder="Publicá tu respuesta"
            />
            {replies.map(reply => (
                <TweetCard key={reply.id} tweet={reply} onDelete={handleDelete} />
            ))}
            <div className="h-20 md:hidden" />
        </div>
    )
}

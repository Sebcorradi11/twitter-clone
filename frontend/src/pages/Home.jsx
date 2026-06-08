import { useCallback, useState } from 'react'
import { getTimeline } from '../services/api'
import TweetForm from '../components/tweet/TweetForm'
import TweetList from '../components/tweet/TweetList'

export default function Home() {
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchTimeline = useCallback(
        (cursor) => getTimeline(cursor),
        [refreshKey]
    )

    return (
        <div>
            {/* Header */}
            <div
                className="sticky top-0 z-10 backdrop-blur-md px-4 py-3"
                style={{ background: 'var(--bg-glass)', borderBottom: '1px solid var(--border)' }}
            >
                <div className="flex">
                    <button
                        className="flex-1 py-1 text-center font-extrabold text-[15px] transition-colors"
                        style={{ color: 'var(--text)', borderBottom: '2px solid #1D9BF0' }}
                    >
                        Para ti
                    </button>
                    <button
                        className="flex-1 py-1 text-center text-[15px] transition-colors"
                        style={{ color: 'var(--text2)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        Siguiendo
                    </button>
                </div>
            </div>

            <TweetForm onTweetCreated={() => setRefreshKey(p => p + 1)} />
            <TweetList fetchFn={fetchTimeline} />
        </div>
    )
}

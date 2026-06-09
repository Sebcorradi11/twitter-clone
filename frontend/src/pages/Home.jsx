import { useCallback, useState } from 'react'
import { getTimeline, getFollowingTimeline } from '../services/api'
import TweetForm from '../components/tweet/TweetForm'
import TweetList from '../components/tweet/TweetList'

const TABS = [
    { id: 'forYou',    label: 'Para ti' },
    { id: 'following', label: 'Siguiendo' },
]

export default function Home() {
    const [activeTab, setActiveTab] = useState('forYou')
    const [refreshKey, setRefreshKey] = useState(0)

    const fetchForYou = useCallback(
        (cursor) => getTimeline(cursor),
        [refreshKey]
    )

    const fetchFollowing = useCallback(
        (cursor) => getFollowingTimeline(cursor),
        [refreshKey]
    )

    return (
        <div>
            {/* Header */}
            <div
                className="sticky top-0 z-10 backdrop-blur-md"
                style={{ background: 'var(--bg-glass)', borderBottom: '1px solid var(--border)' }}
            >
                <div className="flex">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1 py-4 text-center text-[15px] font-medium transition-colors relative"
                            style={{
                                color: activeTab === tab.id ? 'var(--text)' : 'var(--text2)',
                                fontWeight: activeTab === tab.id ? 700 : 400,
                            }}
                            onMouseEnter={e => {
                                if (activeTab !== tab.id) e.currentTarget.style.background = 'var(--bg-hover)'
                            }}
                            onMouseLeave={e => { e.currentTarget.style.background = '' }}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-full"
                                    style={{ background: '#1D9BF0', width: '56px' }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <TweetForm onTweetCreated={() => setRefreshKey(p => p + 1)} />

            {activeTab === 'forYou' && (
                <TweetList
                    key="forYou"
                    fetchFn={fetchForYou}
                    emptyTitle="Bienvenido a tu feed"
                    emptySubtitle="Cuando alguien publique un tweet aparecerá aquí. ¡Sé el primero!"
                />
            )}

            {activeTab === 'following' && (
                <TweetList
                    key="following"
                    fetchFn={fetchFollowing}
                    emptyTitle="No seguís a nadie aún"
                    emptySubtitle="Seguí a personas para ver sus tweets aquí."
                />
            )}
        </div>
    )
}

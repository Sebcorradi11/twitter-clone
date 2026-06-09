import { useState, useEffect } from 'react'
import { getNotifications, markAllAsRead } from '../services/api'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import { useNavigate } from 'react-router-dom'

function NotificationItem({ notification }) {
  const navigate = useNavigate()

  const messages = {
    LIKE: 'le dio like a tu tweet',
    FOLLOW: 'te empezó a seguir',
    REPLY: 'respondió tu tweet',
  }

  const icons = {
    LIKE: '❤️',
    FOLLOW: '👤',
    REPLY: '💬',
  }

  const handleClick = () => {
    if (notification.tweetId) {
      navigate(`/tweet/${notification.tweetId}`)
    } else {
      navigate(`/${notification.actor.username}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-950' : ''
      }`}
    >
      <span className="text-xl mt-1">{icons[notification.type]}</span>
      <div className="flex items-start gap-2 flex-1">
        <Avatar
          src={notification.actor.avatar}
          username={notification.actor.username}
          size="sm"
        />
        <div>
          <span className="font-bold text-sm">{notification.actor.name}</span>
          <span className="text-gray-500 text-sm ml-1">
            @{notification.actor.username}
          </span>
          <span className="text-sm ml-1">{messages[notification.type]}</span>
        </div>
      </div>
    </div>
  )
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadNotifications()
    markAllAsRead().catch(() => {})
  }, [])

  const loadNotifications = async (cursorParam = null) => {
    setLoading(true)
    try {
      const res = await getNotifications(cursorParam)
      const { notifications: data, nextCursor, hasMore: more } = res.data
      setNotifications(prev => cursorParam ? [...prev, ...data] : data)
      setCursor(nextCursor)
      setHasMore(more)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-10">
        <h1 className="text-xl font-bold">Notificaciones</h1>
      </div>

      {loading && <Spinner />}

      {!loading && notifications.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          <p className="text-5xl mb-4">🔔</p>
          <p className="font-bold text-xl">No tenés notificaciones</p>
          <p className="text-sm mt-1">Cuando alguien te siga o le guste tu tweet, aparecerá acá.</p>
        </div>
      )}

      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}

      {!loading && hasMore && (
        <button
          onClick={() => loadNotifications(cursor)}
          className="w-full py-4 text-sky-500 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-medium"
        >
          Cargar más
        </button>
      )}
    </div>
  )
}
export default function Avatar({ src, username, size = 'md' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    }
    const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    return (
        <img
            src={src || fallback}
            alt={username}
            className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
            style={{ background: 'var(--bg2)' }}
            onError={(e) => { e.target.src = fallback }}
        />
    )
}

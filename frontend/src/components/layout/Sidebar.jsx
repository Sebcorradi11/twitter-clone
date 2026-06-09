import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../ui/Avatar'

/* ── Icons ── */
const XLogo = () => (
    <svg viewBox="0 0 24 24" className="w-[30px] h-[30px]" style={{ fill: 'var(--text)' }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
)

const HomeIcon = ({ active }) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" style={{ fill: 'var(--text)' }}>
        {active
            ? <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.71V19.5C3 20.328 3.672 21 4.5 21h6V15h3v6h6c.828 0 1.5-.672 1.5-1.5V9.71l1.317.793 1.06-1.696L12 1.696z" />
            : <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.71V19.5C3 20.328 3.672 21 4.5 21h4c.828 0 1.5-.672 1.5-1.5V15h4v4.5c0 .828.672 1.5 1.5 1.5h4c.828 0 1.5-.672 1.5-1.5V9.71l1.318.793 1.06-1.696L12 1.696zM19.5 19.5h-4V15c0-.828-.672-1.5-1.5-1.5h-4c-.828 0-1.5.672-1.5 1.5v4.5h-4V8.512l7.5-4.5 7.5 4.5V19.5z" />
        }
    </svg>
)

const SearchIcon = ({ active }) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" style={{ fill: 'var(--text)' }}>
        {active
            ? <path d="M10.25 2c-4.694 0-8.5 3.806-8.5 8.5s3.806 8.5 8.5 8.5c1.986 0 3.815-.682 5.262-1.814l4.277 4.277 1.414-1.414-4.277-4.277C17.818 14.065 18.75 12.174 18.75 10.5 18.75 5.806 14.944 2 10.25 2z" />
            : <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.277 4.277-1.414 1.414-4.277-4.277C13.818 17.068 12.026 17.75 10.25 17.75c-4.694 0-8.5-3.806-8.5-8.5z" />
        }
    </svg>
)

const BellIcon = ({ active }) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" style={{ fill: 'var(--text)' }}>
        {active
            ? <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.5c.463 2.282 2.481 4 4.496 4s4.033-1.718 4.496-4h4.64l-1.128-8.949C19.486 5.021 16.06 2 11.996 2zM9.5 18h5c-.44 1.165-1.6 2-2.5 2s-2.06-.835-2.5-2z" />
            : <path d="M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.5c.463 2.282 2.481 4 4.496 4s4.033-1.718 4.496-4h4.64l-1.128-8.949C19.486 5.021 16.06 2 11.996 2zM9.5 18h5c-.44 1.165-1.6 2-2.5 2s-2.06-.835-2.5-2zm7.42-2H5.083l1.09-8.95C6.572 4.06 9.076 4 11.996 4c2.92 0 5.424.06 5.822 3.05L18.92 16z" />
        }
    </svg>
)

const MailIcon = ({ active }) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" style={{ fill: 'var(--text)' }}>
        {active
            ? <path d="M1.998 5.5c0-.828.672-1.5 1.5-1.5h17c.828 0 1.5.672 1.5 1.5v2.858l-10 4.545-10-4.547V5.5zm0 5.053V19.5c0 .828.672 1.5 1.5 1.5h17c.828 0 1.5-.672 1.5-1.5v-8.947l-10 4.544-10-4.544z" />
            : <path d="M1.998 4.499c0-.828.671-1.499 1.5-1.499h17c.828 0 1.5.671 1.5 1.499v2.858l-10 4.545-10-4.547V4.499zm0 5.053V19.5c0 .828.671 1.5 1.5 1.5h17c.828 0 1.5-.672 1.5-1.5V9.554l-10 4.544-10-4.546z" />
        }
    </svg>
)

const ProfileIcon = ({ active }) => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" style={{ fill: 'var(--text)' }}>
        {active
            ? <path d="M17.863 13.44c1.477 1.58 2.387 3.637 2.387 5.81v.75H3.75v-.75c0-2.173.91-4.23 2.387-5.81C7.627 11.86 9.713 11 12 11s4.373.86 5.863 2.44zM12 2C9.38 2 7.25 4.13 7.25 6.75S9.38 11.5 12 11.5s4.75-2.13 4.75-4.75S14.62 2 12 2z" />
            : <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.774 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.387 3.637 2.387 5.81v.75H3.75v-.75c0-2.173.91-4.23 2.387-5.81zM12 4c-1.933 0-3.5 1.567-3.5 3.5S10.067 11 12 11s3.5-1.567 3.5-3.5S13.933 4 12 4zM6.5 7.5C6.5 4.462 8.962 2 12 2s5.5 2.462 5.5 5.5S15.038 13 12 13s-5.5-2.462-5.5-5.5z" />
        }
    </svg>
)

const MoreIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[26px] h-[26px]" style={{ fill: 'var(--text)' }}>
        <path d="M3.75 12c0-4.56 3.69-8.25 8.25-8.25s8.25 3.69 8.25 8.25-3.69 8.25-8.25 8.25S3.75 16.56 3.75 12zM12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-4.75 11.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm4.75 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm4.75 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z" />
    </svg>
)

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" style={{ fill: 'var(--text)' }}>
        <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73 8.15 8.15 0 0 1-8.14-8.1 8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36a10.14 10.14 0 1 0 14 11.69 1 1 0 0 0-.36-1.05z" />
    </svg>
)

const SunIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" style={{ fill: 'var(--text)' }}>
        <path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-12c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm0 14c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1zM5.64 6.35l-1.41-1.41a.996.996 0 1 0-1.41 1.41l1.41 1.41c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41zm12.73 11.31-1.41-1.41a.996.996 0 1 0-1.41 1.41l1.41 1.41c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41zM5 12H3c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zm18 0h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zM5.64 17.66l-1.41 1.41a.996.996 0 1 0 1.41 1.41l1.41-1.41a.996.996 0 1 0-1.41-1.41zm12.73-11.31 1.41-1.41a.996.996 0 1 0-1.41-1.41l-1.41 1.41c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0z" />
    </svg>
)

const ComposeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: 'var(--btn-text)' }}>
        <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.48-7 0-3.7-3.18-6.5-6.48-6.5h-.5C14.5 3.5 17.6 2 23 3zm-7 8.5c0 2.796-2.28 5-5.48 5H8.645C9.76 12.5 11.57 10 14 8.5h2z" />
    </svg>
)

/* ── Nav item ── */
function NavItem({ path, label, Icon, active }) {
    return (
        <Link
            to={path}
            className="flex items-center gap-4 px-3 py-2.5 rounded-full transition-colors"
            style={{ fontWeight: active ? 800 : 400 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
        >
            <Icon active={active} />
            <span className="hidden xl:block text-[19px] leading-none" style={{ color: 'var(--text)' }}>
                {label}
            </span>
        </Link>
    )
}

export default function Sidebar() {
    const { user, logout } = useAuth()
    const { isDark, toggle } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [showLogout, setShowLogout] = useState(false)
    const logoutRef = useRef(null)

    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

    useEffect(() => {
        if (!showLogout) return
        const handler = (e) => {
            if (logoutRef.current && !logoutRef.current.contains(e.target)) {
                setShowLogout(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showLogout])

    const navItems = [
        { label: 'Inicio',    path: '/',                  Icon: HomeIcon    },
        { label: 'Explorar',  path: '/search',            Icon: SearchIcon  },
        { label: 'Perfil',    path: `/${user?.username}`, Icon: ProfileIcon },
    ]

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside className="hidden md:flex flex-col sticky top-0 h-screen xl:w-[275px] md:w-[88px] px-2 xl:px-3 py-2 justify-between flex-shrink-0">

                <div className="flex flex-col items-start gap-1">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="p-3 rounded-full transition-colors"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        <XLogo />
                    </Link>

                    {/* Nav items */}
                    {navItems.map(item => (
                        <NavItem
                            key={item.label}
                            {...item}
                            active={isActive(item.path)}
                        />
                    ))}

                    {/* Publicar button */}
                    <button
                        onClick={() => navigate('/')}
                        className="mt-2 rounded-full font-bold transition-opacity hover:opacity-90 xl:w-full xl:py-3.5 xl:text-[17px] xl:px-6 p-3.5 flex items-center justify-center"
                        style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
                    >
                        <span className="hidden xl:block">Publicar</span>
                        <span className="xl:hidden"><ComposeIcon /></span>
                    </button>
                </div>

                <div className="flex flex-col gap-1 pb-3">
                    {/* Theme toggle */}
                    <button
                        onClick={toggle}
                        className="flex items-center gap-4 px-3 py-3 rounded-full transition-colors text-left"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        {isDark ? <SunIcon /> : <MoonIcon />}
                        <span className="hidden xl:block text-[17px]" style={{ color: 'var(--text)' }}>
                            {isDark ? 'Modo claro' : 'Modo oscuro'}
                        </span>
                    </button>

                    {/* User + logout popup */}
                    {user && (
                        <div className="relative" ref={logoutRef}>
                            {showLogout && (
                                <div
                                    className="absolute bottom-full left-0 mb-2 rounded-2xl shadow-xl py-1 min-w-[280px] z-50"
                                    style={{
                                        background: 'var(--bg)',
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 8px 28px rgba(0,0,0,.15)'
                                    }}
                                >
                                    <button
                                        onClick={() => { logout(); navigate('/login') }}
                                        className="w-full text-left px-4 py-3.5 font-bold text-sm transition-colors"
                                        style={{ color: 'var(--text)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = ''}
                                    >
                                        Cerrar sesión @{user.username}
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => setShowLogout(p => !p)}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-full transition-colors"
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = ''}
                            >
                                <Link
                                    to={`/${user.username}`}
                                    onClick={e => e.stopPropagation()}
                                    className="shrink-0"
                                >
                                    <Avatar src={user.avatar} username={user.username} size="sm" />
                                </Link>
                                <div className="hidden xl:flex flex-col flex-1 min-w-0 text-left">
                                    <span className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                                        {user.name}
                                    </span>
                                    <span className="text-sm truncate" style={{ color: 'var(--text2)' }}>
                                        @{user.username}
                                    </span>
                                </div>
                                <span className="hidden xl:block text-lg" style={{ color: 'var(--text2)' }}>···</span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Mobile bottom nav ── */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center px-2 py-2 z-50"
                style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
            >
                {navItems.map(({ label, path, Icon }) => (
                    <Link
                        key={path}
                        to={path}
                        className="p-3 rounded-full transition-colors"
                        style={{ color: isActive(path) ? 'var(--text)' : 'var(--text2)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                        <Icon active={isActive(path)} />
                    </Link>
                ))}
                <button
                    onClick={toggle}
                    className="p-3 rounded-full transition-colors"
                    style={{ color: 'var(--text2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                    {isDark ? <SunIcon /> : <MoonIcon />}
                </button>
            </nav>
        </>
    )
}

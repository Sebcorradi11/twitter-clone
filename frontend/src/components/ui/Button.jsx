export default function Button({
    children, onClick, type = 'button',
    variant = 'primary', disabled = false, className = ''
}) {
    const base = 'px-4 py-2 rounded-full font-bold text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white',
        black:   'hover:opacity-90 text-white',
        secondary: 'border hover:bg-[var(--bg-hover)] text-[var(--text)]',
        outline: 'border border-[#536471] hover:bg-[var(--bg-hover)] text-[var(--text)]',
        danger:  'border border-red-500 text-red-500 hover:bg-red-500/10',
        ghost:   'hover:bg-[var(--bg-hover)] text-[var(--text)]',
    }

    const inlineStyle = variant === 'black'
        ? { background: 'var(--btn-bg)', color: 'var(--btn-text)' }
        : variant === 'secondary'
        ? { borderColor: 'var(--border)' }
        : undefined

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={inlineStyle}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    )
}

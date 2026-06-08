import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { login as loginApi } from '../services/api'

function FloatingInput({ type = 'text', name, label, value, onChange, required }) {
    const [focused, setFocused] = useState(false)
    const lifted = focused || value.length > 0

    return (
        <div
            className="relative rounded-md transition-colors"
            style={{
                border: `1px solid ${focused ? '#1D9BF0' : '#CFD9DE'}`,
            }}
        >
            <label
                className="absolute left-3 pointer-events-none transition-all duration-150"
                style={{
                    top: lifted ? '6px' : '50%',
                    transform: lifted ? 'none' : 'translateY(-50%)',
                    fontSize: lifted ? '11px' : '16px',
                    color: focused ? '#1D9BF0' : '#536471',
                }}
            >
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full bg-transparent pt-6 pb-2 px-3 text-[#0F1419] text-base focus:outline-none"
            />
        </div>
    )
}

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await loginApi(form)
            login(res.data.token, res.data.user)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left panel */}
            <div className="hidden lg:flex flex-1 bg-white items-center justify-center px-16">
                <div className="max-w-xl">
                    <svg viewBox="0 0 24 24" style={{ width: 320, height: 320, fill: '#0F1419' }}>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <h2 className="text-5xl font-black text-[#0F1419] mt-4 leading-tight">
                        Lo que está pasando ahora.
                    </h2>
                    <p className="text-[#536471] text-xl mt-3">Únete a X hoy mismo.</p>
                </div>
            </div>

            {/* Right panel – form */}
            <div className="flex-1 lg:flex-none lg:w-[550px] flex items-center justify-center px-8 py-12">
                <div className="w-full max-w-[380px]">
                    {/* Mobile logo */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <svg viewBox="0 0 24 24" style={{ width: 40, height: 40, fill: '#0F1419' }}>
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </div>

                    <h1 className="text-[32px] font-extrabold text-[#0F1419] mb-8">
                        Iniciá sesión en X
                    </h1>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <FloatingInput
                            type="email" name="email"
                            label="Email"
                            value={form.email} onChange={handleChange} required
                        />
                        <FloatingInput
                            type="password" name="password"
                            label="Contraseña"
                            value={form.password} onChange={handleChange} required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0F1419] hover:bg-[#272C30] text-white font-bold py-3.5 rounded-full text-[17px] transition-colors mt-2 disabled:opacity-50"
                        >
                            {loading ? 'Ingresando...' : 'Continuar'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-[#EFF3F4]" />
                        <span className="text-[#536471] text-sm">o</span>
                        <div className="flex-1 h-px bg-[#EFF3F4]" />
                    </div>

                    <button
                        onClick={() => navigate('/register')}
                        className="w-full border border-[#CFD9DE] hover:bg-[#F7F9F9] text-[#0F1419] font-bold py-3.5 rounded-full text-[17px] transition-colors"
                    >
                        Crear cuenta nueva
                    </button>

                    <p className="text-center text-sm text-[#536471] mt-8">
                        ¿No tenés cuenta?{' '}
                        <Link to="/register" className="text-[#1D9BF0] hover:underline font-medium">
                            Registrate
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

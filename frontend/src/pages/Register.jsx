import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [mounted, setMounted] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validate password match
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed')
            }

            navigate('/login', { state: { message: 'Registration successful! Please login.' } })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('')
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Google registration failed')
            }

            navigate('/login', { state: { message: 'Registration successful! Please login.' } })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        setError('Google registration failed. Please try again.')
    }

    return (
        <div style={containerStyle}>
            {/* Animated Background */}
            <div style={backgroundStyle}>
                <div style={gradientOrb1}></div>
                <div style={gradientOrb2}></div>
                <div style={gradientOrb3}></div>
            </div>

            <div style={{ ...cardStyle, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}>
                <div style={logoContainerStyle}>
                    <div style={logoIconStyle}>🎨</div>
                    <h1 style={titleStyle}>CollabSphere</h1>
                </div>
                <p style={subtitleStyle}>Create your account to get started</p>

                {error && (
                    <div style={errorStyle} className="animate-fadeInDown">
                        <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Full Name</label>
                        <div style={inputWrapperStyle}>
                            <span style={inputIconStyle}>👤</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={inputStyle}
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Email Address</label>
                        <div style={inputWrapperStyle}>
                            <span style={inputIconStyle}>📧</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={inputStyle}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Password</label>
                        <div style={inputWrapperStyle}>
                            <span style={inputIconStyle}>🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={inputStyle}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={eyeButtonStyle}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Confirm Password</label>
                        <div style={inputWrapperStyle}>
                            <span style={inputIconStyle}>🔒</span>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                style={inputStyle}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={eyeButtonStyle}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...buttonStyle,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transform: loading ? 'scale(0.98)' : 'scale(1)',
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={spinnerStyle}>⏳</span>
                                Creating account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div style={dividerStyle}>
                    <span style={dividerLineStyle}></span>
                    <span style={dividerTextStyle}>or continue with</span>
                    <span style={dividerLineStyle}></span>
                </div>

                <div style={googleButtonContainerStyle}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        width="100%"
                    />
                </div>

                <p style={linkTextStyle}>
                    Already have an account?{' '}
                    <Link to="/login" style={linkStyle}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

// Styles (same as Login page for consistency)
const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-color)',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
}

const backgroundStyle = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    zIndex: 0,
}

const gradientOrb1 = {
    position: 'absolute',
    top: '-10%',
    right: '-5%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    filter: 'blur(40px)',
}

const gradientOrb2 = {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
    filter: 'blur(40px)',
}

const gradientOrb3 = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
    filter: 'blur(60px)',
}

const cardStyle = {
    width: '100%',
    maxWidth: '440px',
    padding: '2.5rem',
    backgroundColor: 'var(--panel-color)',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-xl)',
    position: 'relative',
    zIndex: 1,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
}

const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
}

const logoIconStyle = {
    fontSize: '2.5rem',
}

const titleStyle = {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    textAlign: 'center',
    background: 'linear-gradient(135deg, var(--accent-color), #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
}

const subtitleStyle = {
    fontSize: '0.9375rem',
    color: 'var(--text-color)',
    opacity: 0.7,
    marginBottom: '2rem',
    textAlign: 'center',
}

const errorStyle = {
    padding: '1rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    borderRadius: '12px',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    display: 'flex',
    alignItems: 'center',
}

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
}

const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
}

const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-color)',
}

const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
}

const inputIconStyle = {
    position: 'absolute',
    left: '1rem',
    fontSize: '1.125rem',
    opacity: 0.5,
    pointerEvents: 'none',
}

const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 3rem',
    borderRadius: '12px',
    border: '2px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}

const eyeButtonStyle = {
    position: 'absolute',
    right: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.125rem',
    opacity: 0.6,
    transition: 'opacity 0.2s ease',
}

const buttonStyle = {
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)',
    color: '#fff',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
}

const spinnerStyle = {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
}

const dividerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1.5rem 0',
}

const dividerLineStyle = {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--border-color)',
}

const dividerTextStyle = {
    fontSize: '0.8125rem',
    color: 'var(--text-color)',
    opacity: 0.5,
    fontWeight: 500,
}

const googleButtonContainerStyle = {
    marginBottom: '1.5rem',
}

const linkTextStyle = {
    marginTop: '0.5rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--text-color)',
    opacity: 0.7,
}

const linkStyle = {
    color: 'var(--accent-color)',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'opacity 0.2s ease',
}

// Media query styles
if (typeof window !== 'undefined' && window.innerWidth < 768) {
    Object.assign(containerStyle, {
        flexDirection: 'column',
        gap: '2rem',
        padding: '1rem',
    })
    Object.assign(cardStyle, {
        width: '90%',
        margin: '0 auto',
        padding: '1.5rem',
    })
}

export default Register

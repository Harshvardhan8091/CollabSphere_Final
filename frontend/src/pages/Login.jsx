import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Login failed')
            }

            // Store token and user data
            login(data.user, data.token)

            // Redirect to dashboard
            navigate('/dashboard')
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
                throw new Error(data.message || 'Google login failed')
            }

            login(data.user, data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.')
    }

    return (
        <div style={containerStyle}>
            {/* Animated Background with Particles */}
            <div style={backgroundStyle}>
                <div style={gradientOrb1}></div>
                <div style={gradientOrb2}></div>
                <div style={gradientOrb3}></div>
                <div style={particlesStyle}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} style={{
                            ...particleStyle,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                        }}></div>
                    ))}
                </div>
            </div>

            {/* Left Side - Branding */}
            <div style={{ ...brandingSideStyle, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-30px)' }}>
                <div style={brandingContentStyle}>
                    <div style={brandLogoStyle}>
                        <div style={brandIconStyle}>🎨</div>
                        <h1 style={brandTitleStyle}>CollabSphere</h1>
                    </div>
                    <h2 style={brandHeadlineStyle}>
                        Collaborate in Real-Time
                    </h2>
                    <p style={brandDescStyle}>
                        Join thousands of teams using CollabSphere to brainstorm, design, and collaborate on ideas together.
                    </p>
                    <div style={brandFeaturesStyle}>
                        <div style={brandFeatureItemStyle}>
                            <span style={brandFeatureIconStyle}>⚡</span>
                            <span style={brandFeatureTextStyle}>Real-time Sync</span>
                        </div>
                        <div style={brandFeatureItemStyle}>
                            <span style={brandFeatureIconStyle}>🔒</span>
                            <span style={brandFeatureTextStyle}>Secure & Private</span>
                        </div>
                        <div style={brandFeatureItemStyle}>
                            <span style={brandFeatureIconStyle}>🌐</span>
                            <span style={brandFeatureTextStyle}>Work Anywhere</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{ ...cardStyle, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(30px)' }}>
                <div style={formHeaderStyle}>
                    <h2 style={formTitleStyle}>Welcome Back</h2>
                    <p style={formSubtitleStyle}>Sign in to your account to continue</p>
                </div>

                {error && (
                    <div style={errorStyle} className="animate-fadeInDown">
                        <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={formStyle}>
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
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
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
                                style={inputStyle}
                                placeholder="••••••••"
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={eyeButtonStyle}
                                onMouseEnter={(e) => e.target.style.opacity = '1'}
                                onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
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
                        }}
                        onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <span style={spinnerStyle}>⏳</span>
                                Signing in...
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <span>Sign in</span>
                                <span>→</span>
                            </span>
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
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        style={linkStyle}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                        Create one now →
                    </Link>
                </p>
            </div>
        </div>
    )
}

// Styles
const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-color)',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
    gap: '4rem',
}

const backgroundStyle = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    zIndex: 0,
}

const gradientOrb1 = {
    position: 'absolute',
    top: '-20%',
    right: '10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'float 8s ease-in-out infinite',
}

const gradientOrb2 = {
    position: 'absolute',
    bottom: '-20%',
    left: '5%',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
    filter: 'blur(60px)',
    animation: 'float 10s ease-in-out infinite',
    animationDelay: '2s',
}

const gradientOrb3 = {
    position: 'absolute',
    top: '40%',
    right: '30%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
    filter: 'blur(70px)',
    animation: 'float 12s ease-in-out infinite',
    animationDelay: '4s',
}

const particlesStyle = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
}

const particleStyle = {
    position: 'absolute',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: 'var(--accent-color)',
    opacity: 0.3,
    animation: 'float 6s ease-in-out infinite',
}

// Branding Side Styles
const brandingSideStyle = {
    flex: 1,
    maxWidth: '500px',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
}

const brandingContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
}

const brandLogoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
}

const brandIconStyle = {
    fontSize: '3.5rem',
    filter: 'drop-shadow(0 4px 12px rgba(124, 58, 237, 0.3))',
}

const brandTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: 800,
    background: 'var(--gradient-primary)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
}

const brandHeadlineStyle = {
    fontSize: '3rem',
    fontWeight: 800,
    color: 'var(--text-color)',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
}

const brandDescStyle = {
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
}

const brandFeaturesStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
}

const brandFeatureItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--panel-color)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    transition: 'all 0.3s ease',
}

const brandFeatureIconStyle = {
    fontSize: '1.5rem',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    background: 'var(--accent-light)',
}

const brandFeatureTextStyle = {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-color)',
}

// Form Card Styles
const cardStyle = {
    width: '100%',
    maxWidth: '480px',
    padding: '3rem',
    backgroundColor: 'var(--panel-color)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-xl)',
    position: 'relative',
    zIndex: 1,
    backdropFilter: 'blur(20px)',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
}

const formHeaderStyle = {
    marginBottom: '2rem',
}

const formTitleStyle = {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '0.5rem',
}

const formSubtitleStyle = {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
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
    padding: '1.125rem',
    borderRadius: '14px',
    border: 'none',
    background: 'var(--gradient-primary)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.4)',
    letterSpacing: '0.025em',
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
    transition: 'all 0.2s ease',
}

// Media query styles (applied via inline styles with window.innerWidth check)
if (typeof window !== 'undefined' && window.innerWidth < 768) {
    Object.assign(containerStyle, {
        flexDirection: 'column',
        gap: '2rem',
        padding: '1rem',
    })
    Object.assign(brandingSideStyle, {
        display: 'none', // Hide branding on mobile
    })
    Object.assign(cardStyle, {
        width: '90%',
        margin: '0 auto',
        padding: '1.5rem',
    })
}

export default Login

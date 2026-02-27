import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Profile() {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState('info')

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleBackToDashboard = () => {
        navigate('/dashboard')
    }

    return (
        <div style={containerStyle}>
            {/* Animated Background */}
            <div style={backgroundStyle}>
                <div style={gradientOrb1}></div>
                <div style={gradientOrb2}></div>
            </div>

            {/* Top Navigation */}
            <div style={{...navStyle, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-20px)'}}>
                <div style={logoContainerStyle}>
                    <div style={logoIconStyle}>🎨</div>
                    <div style={logoStyle}>CollabSphere</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={handleBackToDashboard} 
                        style={backButtonStyle}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={mainStyle}>
                <div style={{...profileCardStyle, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)'}}>
                    {/* Profile Header */}
                    <div style={profileHeaderStyle}>
                        <div style={avatarStyle}>
                            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div style={userInfoStyle}>
                            <h1 style={userNameStyle}>{user?.name || 'User'}</h1>
                            <p style={userEmailStyle}>{user?.email}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={tabsContainerStyle}>
                        <button
                            style={{
                                ...tabButtonStyle,
                                ...(activeTab === 'info' ? activeTabStyle : {})
                            }}
                            onClick={() => setActiveTab('info')}
                        >
                            👤 User Info
                        </button>
                        <button
                            style={{
                                ...tabButtonStyle,
                                ...(activeTab === 'settings' ? activeTabStyle : {})
                            }}
                            onClick={() => setActiveTab('settings')}
                        >
                            ⚙️ Settings
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div style={tabContentStyle}>
                        {activeTab === 'info' && (
                            <div style={infoSectionStyle}>
                                <h2 style={sectionTitleStyle}>Account Information</h2>
                                
                                <div style={infoItemStyle}>
                                    <div style={infoLabelStyle}>Full Name</div>
                                    <div style={infoValueStyle}>{user?.name || 'Not set'}</div>
                                </div>

                                <div style={infoItemStyle}>
                                    <div style={infoLabelStyle}>Email Address</div>
                                    <div style={infoValueStyle}>{user?.email}</div>
                                </div>

                                <div style={infoItemStyle}>
                                    <div style={infoLabelStyle}>Account Type</div>
                                    <div style={infoValueStyle}>
                                        <span style={badgeStyle}>{user?.role || 'User'}</span>
                                    </div>
                                </div>

                                <div style={infoItemStyle}>
                                    <div style={infoLabelStyle}>Member Since</div>
                                    <div style={infoValueStyle}>
                                        {user?.createdAt 
                                            ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })
                                            : 'Recently joined'
                                        }
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div style={settingsSectionStyle}>
                                <h2 style={sectionTitleStyle}>Preferences</h2>

                                {/* Theme Setting */}
                                <div style={settingItemStyle}>
                                    <div style={settingInfoStyle}>
                                        <div style={settingLabelStyle}>
                                            {theme === 'light' ? '☀️' : '🌙'} Theme
                                        </div>
                                        <div style={settingDescStyle}>
                                            Choose your preferred color theme
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        style={themeToggleButtonStyle}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                                    </button>
                                </div>

                                <div style={dividerStyle}></div>

                                {/* Current Theme Display */}
                                <div style={settingItemStyle}>
                                    <div style={settingInfoStyle}>
                                        <div style={settingLabelStyle}>Current Theme</div>
                                        <div style={settingDescStyle}>
                                            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                                        </div>
                                    </div>
                                    <div style={themePreviewStyle}>
                                        <div style={{
                                            ...themePreviewBoxStyle,
                                            backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
                                            border: `2px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                                        }}>
                                            {theme === 'light' ? '☀️' : '🌙'}
                                        </div>
                                    </div>
                                </div>

                                <div style={dividerStyle}></div>

                                {/* Account Actions */}
                                <div style={actionsSectionStyle}>
                                    <h3 style={sectionTitleStyle}>Account Actions</h3>
                                    
                                    <button
                                        onClick={handleLogout}
                                        style={logoutButtonStyle}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Styles
const containerStyle = {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-color)',
    display: 'flex',
    flexDirection: 'column',
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
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
}

const gradientOrb2 = {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
}

const navStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 2rem',
    backgroundColor: 'var(--panel-color)',
    borderBottom: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
    position: 'relative',
    zIndex: 10,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
}

const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
}

const logoIconStyle = {
    fontSize: '2rem',
}

const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, var(--accent-color), #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
}

const backButtonStyle = {
    padding: '0.625rem 1.25rem',
    borderRadius: '12px',
    border: '2px solid var(--border-color)',
    backgroundColor: 'var(--panel-color)',
    color: 'var(--text-color)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}

const mainStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    position: 'relative',
    zIndex: 1,
}

const profileCardStyle = {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: 'var(--panel-color)',
    borderRadius: '20px',
    border: '2px solid var(--border-color)',
    boxShadow: 'var(--shadow-xl)',
    overflow: 'hidden',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
}

const profileHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '2.5rem',
    background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)',
}

const avatarStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    color: 'var(--accent-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 700,
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
}

const userInfoStyle = {
    flex: 1,
}

const userNameStyle = {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.25rem',
}

const userEmailStyle = {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.9)',
}

const tabsContainerStyle = {
    display: 'flex',
    borderBottom: '2px solid var(--border-color)',
    backgroundColor: 'var(--bg-color)',
}

const tabButtonStyle = {
    flex: 1,
    padding: '1.25rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-color)',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: '3px solid transparent',
}

const activeTabStyle = {
    color: 'var(--accent-color)',
    borderBottomColor: 'var(--accent-color)',
    backgroundColor: 'var(--panel-color)',
}

const tabContentStyle = {
    padding: '2.5rem',
}

const infoSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
}

const settingsSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
}

const sectionTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '1rem',
}

const infoItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem',
    backgroundColor: 'var(--bg-color)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
}

const infoLabelStyle = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    opacity: 0.7,
}

const infoValueStyle = {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: 'var(--text-color)',
}

const badgeStyle = {
    padding: '0.375rem 0.875rem',
    borderRadius: '999px',
    backgroundColor: 'var(--accent-color)',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: 600,
    textTransform: 'capitalize',
}

const settingItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem',
    backgroundColor: 'var(--bg-color)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
}

const settingInfoStyle = {
    flex: 1,
}

const settingLabelStyle = {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    marginBottom: '0.25rem',
}

const settingDescStyle = {
    fontSize: '0.8125rem',
    color: 'var(--text-color)',
    opacity: 0.6,
}

const themeToggleButtonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    border: '2px solid var(--accent-color)',
    backgroundColor: 'transparent',
    color: 'var(--accent-color)',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}

const themePreviewStyle = {
    display: 'flex',
    gap: '0.5rem',
}

const themePreviewBoxStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    transition: 'all 0.3s ease',
}

const dividerStyle = {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '0.5rem 0',
}

const actionsSectionStyle = {
    marginTop: '1rem',
}

const logoutButtonStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
}

export default Profile

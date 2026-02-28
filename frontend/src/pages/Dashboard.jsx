import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Dashboard() {
    const [roomId, setRoomId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [mounted, setMounted] = useState(false)
    const [hoveredCard, setHoveredCard] = useState(null)
    const [recentSessions, setRecentSessions] = useState([])
    const [loadingSessions, setLoadingSessions] = useState(true)
    const [savedBoards, setSavedBoards] = useState([])
    const [loadingBoards, setLoadingBoards] = useState(true)
    const [activeHistoryTab, setActiveHistoryTab] = useState('saved') // 'saved' | 'recent'
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
        fetchRecentSessions()
        fetchSavedBoards()
    }, [])

    const fetchRecentSessions = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`${API_URL}/api/rooms/recent`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setRecentSessions(data)
            }
        } catch (err) {
            console.error('Failed to fetch recent sessions:', err)
        } finally {
            setLoadingSessions(false)
        }
    }

    const fetchSavedBoards = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`${API_URL}/api/boards`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setSavedBoards(data)
            }
        } catch (err) {
            console.error('Failed to fetch saved boards:', err)
        } finally {
            setLoadingBoards(false)
        }
    }

    const deleteSavedBoard = async (boardId) => {
        if (!confirm('Are you sure you want to delete this board?')) return

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setSavedBoards(prev => prev.filter(board => board._id !== boardId))
            }
        } catch (err) {
            console.error('Failed to delete board:', err)
            alert('Failed to delete board. Please try again.')
        }
    }

    const loadSavedBoard = async (boardId) => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const board = await response.json()
                // Create a new room with the saved canvas data
                const newRoomId = 'board-' + Math.random().toString(36).slice(2, 10)
                // Store board data in sessionStorage to load in whiteboard
                sessionStorage.setItem('loadBoardData', JSON.stringify(board.canvasData))
                navigate(`/whiteboard/${newRoomId}`)
            }
        } catch (err) {
            console.error('Failed to load board:', err)
            alert('Failed to load board. Please try again.')
        }
    }

    const handleCreateRoom = async () => {
        setLoading(true)
        setError('')

        try {
            const newRoomId = 'room-' + Math.random().toString(36).slice(2, 10)
            setTimeout(() => {
                navigate(`/whiteboard/${newRoomId}`)
            }, 300)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleJoinRoom = (e) => {
        e.preventDefault()
        if (!roomId.trim()) {
            setError('Please enter a room ID')
            return
        }
        navigate(`/whiteboard/${roomId.trim()}`)
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div style={containerStyle}>
            {/* Animated Background */}
            <div style={backgroundStyle}>
                <div style={gradientOrb1}></div>
                <div style={gradientOrb2}></div>
            </div>

            {/* Top Navigation */}
            <div style={{ ...navStyle, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-20px)' }}>
                <div style={logoContainerStyle}>
                    <div style={logoIconStyle}>🎨</div>
                    <div style={logoStyle}>CollabSphere</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={userInfoStyle}>
                        <span style={{ fontSize: '0.8125rem', opacity: 0.6 }}>Welcome back,</span>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{user?.name || user?.email}</span>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        style={iconButtonStyle}
                        title="Profile"
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        👤
                    </button>
                    <button
                        onClick={toggleTheme}
                        style={iconButtonStyle}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button
                        onClick={handleLogout}
                        style={logoutButtonStyle}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={mainStyle}>
                <div style={{ ...heroStyle, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}>
                    <div style={heroTagStyle}>
                        🚀 Collaborate in Real-Time
                    </div>
                    <h1 style={heroTitleStyle}>
                        Your Digital Whiteboard for Team Collaboration
                    </h1>
                    <p style={heroSubtitleStyle}>
                        Create, share, and collaborate on ideas with your team in real-time.
                        Draw, chat, and work together seamlessly from anywhere in the world.
                    </p>
                    <div style={heroStatsStyle}>
                        <div style={statItemStyle}>
                            <div style={statNumberStyle}>∞</div>
                            <div style={statLabelStyle}>Unlimited Rooms</div>
                        </div>
                        <div style={statDividerStyle}></div>
                        <div style={statItemStyle}>
                            <div style={statNumberStyle}>⚡</div>
                            <div style={statLabelStyle}>Real-Time Sync</div>
                        </div>
                        <div style={statDividerStyle}></div>
                        <div style={statItemStyle}>
                            <div style={statNumberStyle}>🔒</div>
                            <div style={statLabelStyle}>Secure & Private</div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={errorStyle} className="animate-fadeInDown">
                        <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>⚠️</span>
                        {error}
                    </div>
                )}

                <div style={actionsContainerStyle}>
                    {/* Create Room Card */}
                    <div
                        style={{
                            ...cardStyle,
                            opacity: mounted ? 1 : 0,
                            transform: hoveredCard === 'create' ? 'translateY(-8px) scale(1.02)' : mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                            transitionDelay: '0.1s',
                        }}
                        onMouseEnter={() => setHoveredCard('create')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={cardIconContainerStyle}>
                            <div style={cardIconStyle}>🎨</div>
                        </div>
                        <h2 style={cardTitleStyle}>Create New Room</h2>
                        <p style={cardDescStyle}>
                            Start a new collaborative whiteboard session and invite your team
                        </p>
                        <button
                            onClick={handleCreateRoom}
                            disabled={loading}
                            style={{
                                ...primaryButtonStyle,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                    <span style={spinnerStyle}>⏳</span>
                                    Creating...
                                </span>
                            ) : (
                                '✨ Create Room'
                            )}
                        </button>
                    </div>

                    {/* Join Room Card */}
                    <div
                        style={{
                            ...cardStyle,
                            opacity: mounted ? 1 : 0,
                            transform: hoveredCard === 'join' ? 'translateY(-8px) scale(1.02)' : mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                            transitionDelay: '0.2s',
                        }}
                        onMouseEnter={() => setHoveredCard('join')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={cardIconContainerStyle}>
                            <div style={cardIconStyle}>🚪</div>
                        </div>
                        <h2 style={cardTitleStyle}>Join Existing Room</h2>
                        <p style={cardDescStyle}>
                            Enter a room ID to join an ongoing collaboration session
                        </p>
                        <form onSubmit={handleJoinRoom} style={formStyle}>
                            <div style={inputWrapperStyle}>
                                <span style={inputIconStyle}>🔑</span>
                                <input
                                    type="text"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    placeholder="Enter room ID"
                                    style={inputStyle}
                                />
                            </div>
                            <button
                                type="submit"
                                style={secondaryButtonStyle}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                🚀 Join Room
                            </button>
                        </form>
                    </div>
                </div>

                {/* Features Section - Enhanced */}
                <div style={{ ...featuresContainerStyle, opacity: mounted ? 1 : 0, transitionDelay: '0.3s' }}>
                    <h2 style={featuresSectionTitleStyle}>
                        ✨ What CollabSphere Offers
                    </h2>
                    <div style={featuresGridStyle}>
                        {/* Feature 1 */}
                        <div
                            style={{
                                ...featureBoxStyle,
                                transform: hoveredCard === 'feature1' ? 'translateY(-8px)' : 'translateY(0)',
                            }}
                            onMouseEnter={() => setHoveredCard('feature1')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div style={featureIconBoxStyle}>⚡</div>
                            <h3 style={featureBoxTitleStyle}>Real-time Collaboration</h3>
                            <p style={featureBoxDescStyle}>
                                Work together seamlessly with instant synchronization. See changes as they happen across all connected users.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div
                            style={{
                                ...featureBoxStyle,
                                transform: hoveredCard === 'feature2' ? 'translateY(-8px)' : 'translateY(0)',
                            }}
                            onMouseEnter={() => setHoveredCard('feature2')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div style={featureIconBoxStyle}>🎨</div>
                            <h3 style={featureBoxTitleStyle}>Advanced Drawing Tools</h3>
                            <p style={featureBoxDescStyle}>
                                Professional drawing tools with multiple brush sizes, colors, eraser, undo/redo, and canvas save options.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div
                            style={{
                                ...featureBoxStyle,
                                transform: hoveredCard === 'feature3' ? 'translateY(-8px)' : 'translateY(0)',
                            }}
                            onMouseEnter={() => setHoveredCard('feature3')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div style={featureIconBoxStyle}>💬</div>
                            <h3 style={featureBoxTitleStyle}>Live Chat & Presence</h3>
                            <p style={featureBoxDescStyle}>
                                Communicate with your team in real-time. See who's online and collaborate effectively with instant messaging.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div
                            style={{
                                ...featureBoxStyle,
                                transform: hoveredCard === 'feature4' ? 'translateY(-8px)' : 'translateY(0)',
                            }}
                            onMouseEnter={() => setHoveredCard('feature4')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div style={featureIconBoxStyle}>🖼️</div>
                            <h3 style={featureBoxTitleStyle}>File Upload & PDF Support</h3>
                            <p style={featureBoxDescStyle}>
                                Upload images and PDFs directly to your canvas. Drag, resize, and collaborate on visual content effortlessly.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div
                            style={{
                                ...featureBoxStyle,
                                transform: hoveredCard === 'feature5' ? 'translateY(-8px)' : 'translateY(0)',
                            }}
                            onMouseEnter={() => setHoveredCard('feature5')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div style={featureIconBoxStyle}>🌓</div>
                            <h3 style={featureBoxTitleStyle}>Dark & Light Themes</h3>
                            <p style={featureBoxDescStyle}>
                                Choose your preferred theme for comfortable work. Switch between dark and light modes anytime.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div
                            style={{
                                ...featureBoxStyle,
                                transform: hoveredCard === 'feature6' ? 'translateY(-8px)' : 'translateY(0)',
                            }}
                            onMouseEnter={() => setHoveredCard('feature6')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div style={featureIconBoxStyle}>🔒</div>
                            <h3 style={featureBoxTitleStyle}>Secure & Private</h3>
                            <p style={featureBoxDescStyle}>
                                Your data is protected with JWT authentication, encrypted passwords, and role-based access control.
                            </p>
                        </div>
                    </div>
                </div>

                {/* History Section with Tabs */}
                <div style={{ ...recentSessionsContainerStyle, opacity: mounted ? 1 : 0, transitionDelay: '0.4s' }}>
                    <div style={recentHeaderStyle}>
                        <h2 style={recentSessionsTitleStyle}>
                            <span style={titleIconStyle}>📚</span>
                            My Boards & Sessions
                        </h2>
                        <p style={recentSubtitleStyle}>Access your saved work and recent sessions</p>
                    </div>

                    {/* Tabs */}
                    <div style={tabsContainerStyle}>
                        <button
                            style={{
                                ...tabButtonStyle,
                                ...(activeHistoryTab === 'saved' ? activeTabButtonStyle : {})
                            }}
                            onClick={() => setActiveHistoryTab('saved')}
                        >
                            💾 Saved Boards ({savedBoards.length})
                        </button>
                        <button
                            style={{
                                ...tabButtonStyle,
                                ...(activeHistoryTab === 'recent' ? activeTabButtonStyle : {})
                            }}
                            onClick={() => setActiveHistoryTab('recent')}
                        >
                            🕒 Recent Sessions ({recentSessions.length})
                        </button>
                    </div>

                    {/* Saved Boards Tab Content */}
                    {activeHistoryTab === 'saved' && (
                        <div style={tabContentStyle}>
                            {savedBoards.length > 0 ? (
                                <div style={sessionsGridStyle}>
                                    {savedBoards.slice(0, 6).map((board, index) => (
                                        <div
                                            key={board._id}
                                            style={{
                                                ...sessionCardStyle,
                                                transform: hoveredCard === `board-${index}` ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                                                boxShadow: hoveredCard === `board-${index}` ? '0 12px 24px rgba(99, 102, 241, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            }}
                                            onMouseEnter={() => setHoveredCard(`board-${index}`)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                        >
                                            <div style={sessionCardHeaderStyle}>
                                                <div style={sessionIconContainerStyle}>
                                                    <span style={sessionCardIconStyle}>💾</span>
                                                </div>
                                                <div style={sessionTimeStyle}>
                                                    {formatLastActive(board.updatedAt)}
                                                </div>
                                            </div>

                                            <div style={sessionCardBodyStyle}>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    color: 'var(--text-color)',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    {board.title}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-color)',
                                                    opacity: 0.6
                                                }}>
                                                    {board.canvasData?.length || 0} items
                                                </div>
                                            </div>

                                            <div style={sessionCardFooterStyle}>
                                                <button
                                                    onClick={() => loadSavedBoard(board._id)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        background: 'var(--gradient-primary)',
                                                        color: '#fff',
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        flex: 1,
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                >
                                                    Open →
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteSavedBoard(board._id)
                                                    }}
                                                    style={{
                                                        padding: '0.5rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border-color)',
                                                        background: 'transparent',
                                                        color: '#ef4444',
                                                        fontSize: '1rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title="Delete board"
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={emptyStateStyle}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💾</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        No saved boards yet
                                    </div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                                        Save your whiteboard work to access it later
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recent Sessions Tab Content */}
                    {activeHistoryTab === 'recent' && (
                        <div style={tabContentStyle}>
                            {recentSessions.length > 0 ? (
                                <div style={sessionsGridStyle}>
                                    {recentSessions.slice(0, 6).map((session, index) => (
                                        <div
                                            key={session.roomId}
                                            style={{
                                                ...sessionCardStyle,
                                                transform: hoveredCard === `session-${index}` ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                                                boxShadow: hoveredCard === `session-${index}` ? '0 12px 24px rgba(99, 102, 241, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            }}
                                            onMouseEnter={() => setHoveredCard(`session-${index}`)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            onClick={() => navigate(`/whiteboard/${session.roomId}`)}
                                        >
                                            <div style={sessionCardHeaderStyle}>
                                                <div style={sessionIconContainerStyle}>
                                                    <span style={sessionCardIconStyle}>🎨</span>
                                                </div>
                                                <div style={sessionTimeStyle}>
                                                    {formatLastActive(session.lastUpdated)}
                                                </div>
                                            </div>

                                            <div style={sessionCardBodyStyle}>
                                                <div style={sessionRoomIdLabelStyle}>Room ID</div>
                                                <div style={sessionRoomIdValueStyle}>{session.roomId}</div>
                                            </div>

                                            <div style={sessionCardFooterStyle}>
                                                <div style={sessionStatsStyle}>
                                                    <div style={sessionStatItemStyle}>
                                                        <span style={statIconStyle}>👥</span>
                                                        <span style={statValueStyle}>{session.participantsCount}</span>
                                                    </div>
                                                </div>
                                                <div style={sessionJoinButtonStyle}>
                                                    Continue →
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={emptyStateStyle}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕒</div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        No recent sessions
                                    </div>
                                    <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                                        Your recent whiteboard sessions will appear here
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Helper function to format last active time
const formatLastActive = (timestamp) => {
    const now = new Date()
    const lastActive = new Date(timestamp)
    const diffMs = now - lastActive
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return lastActive.toLocaleDateString()
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

const userInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    color: 'var(--text-color)',
}

const iconButtonStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: '2px solid var(--border-color)',
    backgroundColor: 'var(--panel-color)',
    color: 'var(--text-color)',
    cursor: 'pointer',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'var(--shadow-sm)',
}

const logoutButtonStyle = {
    padding: '0.625rem 1.25rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
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

const heroStyle = {
    textAlign: 'center',
    marginBottom: '3rem',
    maxWidth: '900px',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
}

const heroTagStyle = {
    display: 'inline-block',
    padding: '0.5rem 1.25rem',
    borderRadius: '999px',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    color: 'var(--accent-color)',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
    border: '1px solid rgba(99, 102, 241, 0.2)',
}

const heroTitleStyle = {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: 'var(--text-color)',
    marginBottom: '1.5rem',
    lineHeight: 1.1,
    background: 'linear-gradient(135deg, var(--text-color), var(--accent-color))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
}

const heroSubtitleStyle = {
    fontSize: '1.125rem',
    color: 'var(--text-color)',
    opacity: 0.7,
    lineHeight: 1.7,
    marginBottom: '2rem',
    maxWidth: '700px',
    margin: '0 auto 2rem',
}

const heroStatsStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    marginTop: '2.5rem',
    flexWrap: 'wrap',
}

const statItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
}

const statNumberStyle = {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--accent-color)',
}

const statLabelStyle = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-color)',
    opacity: 0.7,
}

const statDividerStyle = {
    width: '1px',
    height: '40px',
    backgroundColor: 'var(--border-color)',
}

const errorStyle = {
    padding: '1rem 1.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    borderRadius: '12px',
    fontSize: '0.875rem',
    marginBottom: '2rem',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    maxWidth: '600px',
    display: 'flex',
    alignItems: 'center',
}

const actionsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2.5rem',
    maxWidth: '1000px',
    width: '100%',
    marginBottom: '4rem',
}

const cardStyle = {
    padding: '3rem',
    backgroundColor: 'var(--panel-color)',
    borderRadius: '24px',
    border: '2px solid var(--border-color)',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
}

const cardIconContainerStyle = {
    width: '90px',
    height: '90px',
    borderRadius: '22px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    boxShadow: '0 12px 24px rgba(99, 102, 241, 0.35)',
    position: 'relative',
}

const cardIconStyle = {
    fontSize: '3rem',
}

const cardTitleStyle = {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '1rem',
}

const cardDescStyle = {
    fontSize: '1rem',
    color: 'var(--text-color)',
    opacity: 0.7,
    marginBottom: '2.5rem',
    lineHeight: 1.7,
}

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
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

const primaryButtonStyle = {
    padding: '1.125rem 2rem',
    borderRadius: '14px',
    border: 'none',
    background: 'var(--gradient-primary)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
    letterSpacing: '0.025em',
}

const secondaryButtonStyle = {
    padding: '1.125rem 2rem',
    borderRadius: '14px',
    border: '2px solid var(--accent-color)',
    backgroundColor: 'transparent',
    color: 'var(--accent-color)',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    letterSpacing: '0.025em',
}

const spinnerStyle = {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
}

const featuresSectionStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    justifyContent: 'center',
    maxWidth: '900px',
    opacity: 0,
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
}

const featureItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    backgroundColor: 'var(--panel-color)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
}

const featureIconStyle = {
    fontSize: '1.5rem',
}

const featureTextStyle = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-color)',
}

// New Enhanced Feature Styles
const featuresContainerStyle = {
    width: '100%',
    maxWidth: '1200px',
    marginTop: '4rem',
    opacity: 0,
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
}

const featuresSectionTitleStyle = {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    textAlign: 'center',
    marginBottom: '3rem',
    background: 'linear-gradient(135deg, var(--text-color), var(--accent-color))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
}

const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
}

const featureBoxStyle = {
    padding: '2rem',
    backgroundColor: 'var(--panel-color)',
    borderRadius: '16px',
    border: '2px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1rem',
}

const featureIconBoxStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '14px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)',
}

const featureBoxTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    margin: 0,
}

const featureBoxDescStyle = {
    fontSize: '0.9375rem',
    color: 'var(--text-color)',
    opacity: 0.7,
    lineHeight: 1.6,
    margin: 0,
}

const recentSessionsContainerStyle = {
    width: '100%',
    maxWidth: '1200px',
    marginTop: '4rem',
    opacity: 0,
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
}

const recentHeaderStyle = {
    textAlign: 'center',
    marginBottom: '2.5rem',
}

const recentSessionsTitleStyle = {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-color)',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    background: 'linear-gradient(135deg, var(--text-color), var(--accent-color))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
}

const titleIconStyle = {
    fontSize: '2rem',
}

const recentSubtitleStyle = {
    fontSize: '0.9375rem',
    color: 'var(--text-color)',
    opacity: 0.6,
}

const sessionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
}

const sessionCardStyle = {
    backgroundColor: 'var(--panel-color)',
    borderRadius: '16px',
    border: '2px solid var(--border-color)',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
}

const sessionCardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}

const sessionIconContainerStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
}

const sessionCardIconStyle = {
    fontSize: '1.5rem',
}

const sessionTimeStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    opacity: 0.6,
    padding: '0.375rem 0.75rem',
    backgroundColor: 'var(--bg-color)',
    borderRadius: '999px',
}

const sessionCardBodyStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
}

const sessionRoomIdLabelStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
}

const sessionRoomIdValueStyle = {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    wordBreak: 'break-all',
}

const sessionCardFooterStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-color)',
}

const sessionStatsStyle = {
    display: 'flex',
    gap: '1rem',
}

const sessionStatItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
}

const statIconStyle = {
    fontSize: '1rem',
}

const statValueStyle = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-color)',
}

const sessionJoinButtonStyle = {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--accent-color)',
    transition: 'all 0.2s ease',
}

// Tab Styles
const tabsContainerStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '0.5rem',
}

const tabButtonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-color)',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 0.6,
    position: 'relative',
}

const activeTabButtonStyle = {
    opacity: 1,
    color: 'var(--accent-color)',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
}

const tabContentStyle = {
    minHeight: '300px',
}

const emptyStateStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    color: 'var(--text-color)',
    textAlign: 'center',
}

// Media query styles
if (typeof window !== 'undefined' && window.innerWidth < 768) {
    Object.assign(navStyle, {
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem',
    })
    Object.assign(logoStyle, {
        fontSize: '1.25rem',
    })
    Object.assign(actionsContainerStyle, {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '90%',
        margin: '0 auto',
    })
    Object.assign(cardStyle, {
        width: '100%',
        padding: '2rem 1.5rem',
    })
    Object.assign(heroTitleStyle, {
        fontSize: '2rem',
    })
}

export default Dashboard

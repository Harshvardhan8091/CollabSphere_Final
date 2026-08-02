import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load token and user from localStorage on app start and verify validity
    useEffect(() => {
        const verifySession = async () => {
            const storedToken = localStorage.getItem('auth_token')
            const storedUser = localStorage.getItem('auth_user')

            if (storedToken && storedUser) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
                    const res = await fetch(`${API_URL}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    })

                    if (res.ok) {
                        const currentUser = await res.json()
                        setToken(storedToken)
                        setUser(currentUser)
                        localStorage.setItem('auth_user', JSON.stringify(currentUser))
                    } else {
                        // Token expired or invalid
                        localStorage.removeItem('auth_token')
                        localStorage.removeItem('auth_user')
                        localStorage.removeItem('collab_user_id')
                        setToken(null)
                        setUser(null)
                    }
                } catch (err) {
                    // On network error, trust stored session temporarily so app can work offline/reconnect
                    try {
                        setToken(storedToken)
                        setUser(JSON.parse(storedUser))
                    } catch (e) {
                        setToken(null)
                        setUser(null)
                    }
                }
            }
            setLoading(false)
        }

        verifySession()
    }, [])

    const login = (userData, authToken) => {
        setUser(userData)
        setToken(authToken)
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('auth_user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('collab_user_id') // Clear old user ID
    }

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

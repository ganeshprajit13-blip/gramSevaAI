'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { upsertProfile } from '@/actions/auth'
import type { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  loginAsMockUser: (role: 'admin' | 'resident') => Promise<void>
  loginWithCredentials: (usernameOrEmail: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  loginAsMockUser: async () => {},
  loginWithCredentials: async () => false,
  logout: async () => {},
}) as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken()
      const { profile: p } = await upsertProfile(idToken, {
        name: firebaseUser.displayName ?? undefined,
        avatar_url: firebaseUser.photoURL ?? undefined,
      } as any)
      setProfile(p)
    } catch (err) {
      console.error('Profile fetch error:', err)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const mockSession = localStorage.getItem('gramseva_mock_session')
      if (mockSession) {
        const { profile: savedProfile } = JSON.parse(mockSession)
        setProfile(savedProfile)
      } else {
        await fetchProfile(user)
      }
    }
  }

  const loginAsMockUser = async (role: 'admin' | 'resident') => {
    setLoading(true)
    const mockUser = {
      uid: `mock-${role}-uid`,
      email: role === 'admin' ? 'bdo-admin@gramseva.gov.in' : 'demo-resident@gmail.com',
      displayName: role === 'admin' ? 'BDO Admin' : 'Demo Resident',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      getIdToken: async () => `mock-token-${role}`,
    } as unknown as User

    setUser(mockUser)

    try {
      const { profile: p } = await upsertProfile(`mock-token-${role}`, {
        name: mockUser.displayName ?? undefined,
        avatar_url: mockUser.photoURL ?? undefined,
      } as any)

      setProfile(p)

      localStorage.setItem('gramseva_mock_session', JSON.stringify({
        user: {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL,
        },
        profile: p,
      }))
    } catch (err) {
      console.error('Mock profile upsert error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loginWithCredentials = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const cleanUsername = usernameOrEmail.trim()
      if (!cleanUsername) return false

      const isBdoUser = cleanUsername === 'block_development_officer' || cleanUsername.toLowerCase() === 'bdo@gmail.com'
      if (isBdoUser && password !== 'bdo@123') {
        throw new Error('Incorrect password for Block Development Officer account.')
      }

      const isAdmin = isBdoUser && password === 'bdo@123'
      const role = isAdmin ? 'admin' : 'resident'
      
      const uid = `mock-${role}-${cleanUsername.replace(/[^a-zA-Z0-9]/g, '-')}`
      const email = isAdmin ? 'bdo@gmail.com' : (cleanUsername.includes('@') ? cleanUsername.toLowerCase() : `${cleanUsername.toLowerCase()}@gramseva.mock`)
      const displayName = isAdmin ? 'Block Development Officer' : cleanUsername

      const mockUser = {
        uid,
        email,
        displayName,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        getIdToken: async () => `mock-token-${role}`,
      } as unknown as User

      // Check if we already have a profile in localStorage for this resident
      let existingProfile: Profile | null = null
      const localProfileKey = `gramseva_profile_data_${uid}`
      const savedLocalProfile = localStorage.getItem(localProfileKey)
      if (savedLocalProfile) {
        existingProfile = JSON.parse(savedLocalProfile)
      }

      const p: Profile = existingProfile || {
        id: `mock-${role}-${Date.now()}`,
        firebase_uid: uid,
        email,
        name: displayName,
        avatar_url: mockUser.photoURL ?? undefined,
        role,
        profile_complete: isAdmin ? true : false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setUser(mockUser)
      setProfile(p)

      // Save credentials session
      localStorage.setItem('gramseva_mock_session', JSON.stringify({
        user: {
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          photoURL: mockUser.photoURL,
        },
        profile: p,
      }))

      // Also persist profile separately so it persists across logouts
      localStorage.setItem(localProfileKey, JSON.stringify(p))

      return true
    } catch (err) {
      console.error('Credentials login error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      localStorage.removeItem('gramseva_mock_session')
      setUser(null)
      setProfile(null)
      await signOut(auth)
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const mockSession = localStorage.getItem('gramseva_mock_session')
    if (mockSession) {
      const { user: savedUser, profile: savedProfile } = JSON.parse(mockSession)
      const role = savedProfile?.role ?? 'resident'
      const rehydratedUser = {
        ...savedUser,
        getIdToken: async () => `mock-token-${role}`,
      } as unknown as User

      setUser(rehydratedUser)
      setProfile(savedProfile)
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchProfile(firebaseUser)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, loginAsMockUser, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

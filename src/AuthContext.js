import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db, CEO_EMAILS } from './firebase'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { googleProvider } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'ceo' | 'editor' | 'user'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Get or create user doc in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          // New user - create their profile
          const role = CEO_EMAILS.includes(firebaseUser.email) ? 'ceo' : 'user'
          await setDoc(userRef, {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: role,
            createdAt: new Date(),
          })
          setUserRole(role)
        } else {
          setUserRole(userSnap.data().role)
        }
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const isCEO = userRole === 'ceo'
  const isEditor = userRole === 'editor' || userRole === 'ceo'
  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      isCEO,
      isEditor,
      isLoggedIn,
      signInWithGoogle,
      logout,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
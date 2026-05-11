import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyC0GCKk8Dw07LHtNg2SZeGwuyvu34j0L1I",
  authDomain: "polipatch.firebaseapp.com",
  projectId: "polipatch",
  storageBucket: "polipatch.firebasestorage.app",
  messagingSenderId: "1014008696129",
  appId: "1:1014008696129:web:9a53c654547dd5945a65c0",
  measurementId: "G-Q5T1THW5KB"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

// CEO emails - have full admin access
export const CEO_EMAIL = 'contact@polipatch.org'
export const CEO_EMAILS = ['contact@polipatch.org', 'contact.sitesearch@gmail.com']
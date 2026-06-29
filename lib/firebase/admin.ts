import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function getAdminAuth() {
  const apps = getApps()
  if (!apps.length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    } else {
      // Fallback for Next.js build-time compile
      initializeApp({
        credential: cert({
          projectId: 'dummy-project-id',
          clientEmail: 'dummy-email@dummy.com',
          privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3\n-----END PRIVATE KEY-----\n',
        }),
      })
    }
  }
  return getAuth()
}

/**
 * Verify a Firebase ID token and return the decoded token.
 * Throws if invalid or expired. Supports mock sandbox login tokens.
 */
export async function verifyIdToken(token: string) {
  if (token.startsWith('mock-token-')) {
    const role = token.replace('mock-token-', '')
    return {
      uid: `mock-${role}-uid`,
      email: role === 'admin' ? 'bdo-admin@gramseva.gov.in' : 'demo-resident@gmail.com',
      email_verified: true,
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    }
  }
  return getAdminAuth().verifyIdToken(token)
}

/**
 * Check whether a given email is an allowed BDO/Admin account.
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { UserProfile, UserRole } from '../types';
import { generateCaregiverCode } from '../utils/validation';
import { saveUserProfile, getUserProfile } from './firestore';

const LOCAL_STORAGE_USER_KEY = 'medimate_current_user';
const LOCAL_STORAGE_USERS_DB = 'medimate_registered_users';

export async function registerUser(
  name: string,
  email: string,
  pass: string,
  role: UserRole
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const caregiverCode = role === 'patient' ? generateCaregiverCode() : undefined;

  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      const profile: UserProfile = {
        uid: firebaseUser.uid,
        name: name.trim(),
        email: cleanEmail,
        role,
        caregiverCode,
        createdAt: new Date().toISOString(),
        settings: {
          voiceReminders: true,
          browserNotifications: true,
          gracePeriodMinutes: 30,
          fontSizePreference: 'large'
        }
      };

      await saveUserProfile(profile);
      return profile;
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      throw new Error(getFriendlyAuthErrorMessage(error.code || error.message));
    }
  } else {
    // Local / Demo Mode Registration
    const users: Array<UserProfile & { passwordHash: string }> = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_USERS_DB) || '[]'
    );

    if (users.some(u => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const mockUid = 'usr_' + Math.random().toString(36).substring(2, 9);
    const profile: UserProfile = {
      uid: mockUid,
      name: name.trim(),
      email: cleanEmail,
      role,
      caregiverCode,
      createdAt: new Date().toISOString(),
      settings: {
        voiceReminders: true,
        browserNotifications: true,
        gracePeriodMinutes: 30,
        fontSizePreference: 'large'
      }
    };

    users.push({ ...profile, passwordHash: pass });
    localStorage.setItem(LOCAL_STORAGE_USERS_DB, JSON.stringify(users));
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    await saveUserProfile(profile);
    return profile;
  }
}

export async function loginUser(email: string, pass: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const profile = await getUserProfile(userCredential.user.uid);
      if (!profile) {
        // Fallback profile if Firestore record missing
        const fallbackProfile: UserProfile = {
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'patient',
          createdAt: new Date().toISOString(),
          settings: {
            voiceReminders: true,
            browserNotifications: true,
            gracePeriodMinutes: 30,
            fontSizePreference: 'large'
          }
        };
        await saveUserProfile(fallbackProfile);
        return fallbackProfile;
      }
      return profile;
    } catch (error: any) {
      console.error('Firebase login error:', error);
      throw new Error(getFriendlyAuthErrorMessage(error.code || error.message));
    }
  } else {
    // Local / Demo Mode Login
    const users: Array<UserProfile & { passwordHash: string }> = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_USERS_DB) || '[]'
    );

    const user = users.find(u => u.email === cleanEmail && u.passwordHash === pass);
    if (!user) {
      // If demo credentials or any new test user
      if (cleanEmail === 'demo.patient@medimate.ai' || cleanEmail === 'patient@medimate.ai') {
        const demoPatient: UserProfile = {
          uid: 'demo_patient_101',
          name: 'Lakshmi Patel',
          email: cleanEmail,
          role: 'patient',
          caregiverCode: 'MED-4821',
          createdAt: new Date().toISOString(),
          settings: {
            voiceReminders: true,
            browserNotifications: true,
            gracePeriodMinutes: 30,
            fontSizePreference: 'large'
          }
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoPatient));
        await saveUserProfile(demoPatient);
        return demoPatient;
      } else if (cleanEmail === 'demo.caregiver@medimate.ai' || cleanEmail === 'caregiver@medimate.ai') {
        const demoCaregiver: UserProfile = {
          uid: 'demo_caregiver_202',
          name: 'Dr. John Miller',
          email: cleanEmail,
          role: 'caregiver',
          createdAt: new Date().toISOString(),
          settings: {
            voiceReminders: true,
            browserNotifications: true,
            gracePeriodMinutes: 30,
            fontSizePreference: 'large'
          }
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoCaregiver));
        await saveUserProfile(demoCaregiver);
        return demoCaregiver;
      }
      throw new Error('Invalid email or password. Please try again.');
    }

    const { passwordHash, ...profile } = user;
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    return profile;
  }
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Sign out error:', error);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (isFirebaseConfigured && auth) {
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (error: any) {
      throw new Error(getFriendlyAuthErrorMessage(error.code || error.message));
    }
  } else {
    // Mock reset
    return new Promise(resolve => setTimeout(resolve, 800));
  }
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          callback(profile);
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  } else {
    // Local subscriber
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        callback(JSON.parse(saved));
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
    return () => {};
  }
}

function getFriendlyAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check and try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a few minutes before trying again.';
    case 'auth/network-request-failed':
      return 'Network connection problem. Please check your internet connection.';
    default:
      return 'Authentication could not be completed. Please try again.';
  }
}

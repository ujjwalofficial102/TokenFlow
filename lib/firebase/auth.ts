import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from './config';

export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw new Error(error?.message || 'Failed to sign in with Google');
  }
}

export async function signUpWithEmail(email: string, pass: string, name?: string): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && result.user) {
      await updateProfile(result.user, { displayName: name });
    }
    return result.user;
  } catch (error: any) {
    console.error('Email Sign Up Error:', error);
    throw new Error(error?.message || 'Failed to create account with email');
  }
}

export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    console.error('Email Sign In Error:', error);
    throw new Error(error?.message || 'Failed to sign in with email');
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign Out Error:', error);
    throw new Error(error?.message || 'Failed to sign out');
  }
}

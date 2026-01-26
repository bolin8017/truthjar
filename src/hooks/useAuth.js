import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInAnonymouslyIfNeeded } from '../services/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Ensure anonymous sign-in
    signInAnonymouslyIfNeeded();

    return unsubscribe;
  }, []);

  return { user, loading, userId: user?.uid || null };
}

import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase.js';
import { getCurrentProfile } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const p = await getCurrentProfile();
        if (!cancelled) {
          if (p && p.role === 'admin') {
            setProfile(p);
          } else {
            setError('ACCESS_DENIED');
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Auth error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  useEffect(() => {
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setError('SIGNED_OUT');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const retry = () => setReloadKey(k => k + 1);

  return (
    <AuthContext.Provider value={{ profile, loading, error, retry, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'muldhon_token';
const USER_KEY = 'muldhon_user';

const readStoredUser = () => {
  try {
    const cached = localStorage.getItem(USER_KEY);
    if (!cached || cached === 'undefined' || cached === 'null') return null;
    return JSON.parse(cached);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Turn an axios failure into a message a person can act on.
 *
 * Previously every failure collapsed into "Login failed" / "Registration
 * failed", which hid the two things that actually go wrong:
 *   - the API is not running (no response at all), and
 *   - the API answered, but with an HTML error page (a gateway timeout when
 *     the database is unreachable), so there is no JSON `message` to read.
 */
const describeError = (error, fallback) => {
  if (error?.code === 'ERR_CANCELED') return 'Request cancelled.';

  // No response: server down, wrong URL, or blocked by CORS.
  if (!error?.response) {
    return 'Cannot reach the server. Start the API (npm run dev in the server folder) and check VITE_API_URL in client/.env.';
  }

  const { status, data } = error.response;

  // The API always answers with { success:false, message:"..." }. Anything
  // else (a string of HTML, an empty body) means the request never reached
  // the Express error handler.
  if (data && typeof data === 'object' && data.message) return data.message;

  if (status === 504 || status === 502) {
    return 'The server timed out — it is most likely unable to reach MongoDB. Check MONGO_URI.';
  }
  if (status === 404) {
    return 'API route not found (404). Check that the API base URL ends with /api.';
  }
  return `${fallback} (server responded ${status}).`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((token, nextUser) => {
    if (!nextUser || typeof nextUser !== 'object') return false;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return true;
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // On boot, re-read the signed-in account from the server so the dashboard
  // always shows the real person behind the token — their name, gender,
  // role and photo — instead of a stale or placeholder profile.
  useEffect(() => {
    const boot = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        clearSession();
        return setLoading(false);
      }
      try {
        const { data } = await api.get('/auth/me');
        persist(null, data.user);
      } catch (error) {
        // Only a rejected token means "signed out". A network blip should not
        // throw the user back to the login page.
        if (error?.response?.status === 401) clearSession();
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [persist, clearSession]);

  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await api.post('/auth/login', {
          email: String(email || '').trim().toLowerCase(),
          password,
        });

        if (!data?.token || !data?.user) {
          return { ok: false, message: 'The server did not return an account. Check the API URL.' };
        }

        persist(data.token, data.user);
        return { ok: true, user: data.user };
      } catch (error) {
        return { ok: false, message: describeError(error, 'Login failed') };
      }
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      try {
        const { data } = await api.post('/auth/register', {
          ...payload,
          email: String(payload.email || '').trim().toLowerCase(),
        });

        if (!data?.token || !data?.user) {
          return { ok: false, message: 'The server did not return an account. Check the API URL.' };
        }

        persist(data.token, data.user);
        return { ok: true, user: data.user };
      } catch (error) {
        return { ok: false, message: describeError(error, 'Registration failed') };
      }
    },
    [persist]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* signing out locally is enough */
    }
    clearSession();
  }, [clearSession]);

  const updateProfile = useCallback(
    async (payload) => {
      try {
        const { data } = await api.put('/auth/me', payload);
        persist(null, data.user);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: describeError(error, 'Update failed') };
      }
    },
    [persist]
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile, setUser }),
    [user, loading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;

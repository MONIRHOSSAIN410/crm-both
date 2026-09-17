import axios from 'axios';

/**
 * Where the API lives.
 *
 * The client and the API are deployed as one Vercel project, so in production
 * the API is simply `/api` on the same origin — same-origin means no CORS
 * preflight and no URL to keep in sync. In development Vite proxies `/api` to
 * http://localhost:5000, so the same relative path works there too.
 *
 * VITE_API_URL is only an override for pointing at a separately hosted API.
 * A localhost override is ignored once the page itself is not on localhost,
 * because a deployed build that still carried a build-time `localhost:5000`
 * URL sent every login to a machine the visitor's browser cannot reach — which
 * surfaced as the generic "Login failed" nobody could debug.
 */
const trimmed = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const pointsAtLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i.test(trimmed);
const browserIsLocal =
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(window.location.hostname);

export const API_BASE_URL = trimmed && !(pointsAtLocalhost && !browserIsLocal) ? trimmed : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('muldhon_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('muldhon_token');
    }
    return Promise.reject(error);
  }
);

export default api;

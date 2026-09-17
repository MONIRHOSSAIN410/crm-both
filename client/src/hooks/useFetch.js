import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

/**
 * Fetch from the API with a guaranteed fallback.
 * `select` maps the axios response payload to the shape the page needs.
 */
/** Every Muldhon endpoint answers `{ success: true, ... }`. Anything else is not our API. */
const isApiPayload = (payload) =>
  payload && typeof payload === 'object' && !Array.isArray(payload) && payload.success === true;

export const useFetch = (url, { fallback = null, select = (d) => d, deps = [], skip = false } = {}) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(!skip);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    try {
      const res = await api.get(url);
      if (!isApiPayload(res.data)) throw new Error('Unexpected payload');
      setData(select(res.data));
      setOffline(false);
    } catch {
      setData(fallback);
      setOffline(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, skip, ...deps]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, offline, reload: load, setData };
};

export default useFetch;

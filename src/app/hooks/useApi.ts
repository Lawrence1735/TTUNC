/**
 * useApi.ts
 * Generic hook for wrapping any service call with loading + error state.
 *
 * Example:
 *   const { data, isLoading, error, execute } = useApi(
 *     () => trainingService.listTrainees({ talent_group: 'Marching Band' })
 *   );
 *
 *   useEffect(() => { execute(); }, []);
 */

import { useCallback, useState } from 'react';
import { type AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFn: (...args: unknown[]) => Promise<T>,
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await apiFn(...args);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message: string }>;
        const message =
          axiosErr.response?.data?.message ??
          axiosErr.message ??
          'An unexpected error occurred.';
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        return null;
      }
    },
    [apiFn],
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

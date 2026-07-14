import { useState, useCallback } from 'react';

export function useLoading(initialState: boolean = false) {
  const [loading, setLoading] = useState(initialState);
  const [message, setMessage] = useState<string | undefined>();

  const show = useCallback((msg?: string) => {
    setMessage(msg);
    setLoading(true);
  }, []);

  const hide = useCallback(() => {
    setLoading(false);
    setMessage(undefined);
  }, []);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>, msg?: string): Promise<T> => {
      show(msg);
      try {
        return await promise;
      } finally {
        hide();
      }
    },
    [show, hide],
  );

  return { loading, message, show, hide, withLoading };
}
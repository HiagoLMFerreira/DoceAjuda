import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../core/errors';

export function useAsyncOperation<
  TArguments extends unknown[],
  TResult
>(
  operation: (...args: TArguments) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: TArguments): Promise<TResult> => {
      try {
        setLoading(true);
        setError(null);
        return await operation(...args);
      } catch (caughtError) {
        setError(getErrorMessage(caughtError));
        throw caughtError;
      } finally {
        setLoading(false);
      }
    },
    [operation]
  );

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null),
  };
}

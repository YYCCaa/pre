// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { parseErrorMessage } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiFunction(...args);
        const result = response?.data || response;
        
        setData(result);
        
        if (showSuccessToast) {
          toast.success(successMessage);
        }
        
        return result;
      } catch (err: any) {
        const errorMessage = parseErrorMessage(err);
        setError(errorMessage);
        
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, showSuccessToast, showErrorToast, successMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
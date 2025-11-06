import { useCallback, useMemo, useRef, useState } from 'react';
import { getApiKeyStatus, tmdbClient, TMDBMovie, validateApiKey } from '@/lib/tmdb-client';
import { messages } from '@/lib/messages';

interface UseTmdbSearchResult {
  movies: TMDBMovie[];
  isLoading: boolean;
  error: string | null;
  apiKeyValid: boolean | null;
  hasSearched: boolean;
  search: (query: string) => Promise<void>;
  reset: () => void;
}

const API_KEY_ERROR_MESSAGE = messages.apiKeyInvalid;
const ABORT_ERROR_NAME = 'AbortError';
const SEARCH_ERROR_MESSAGE = messages.searchFailed;

export function useTmdbSearch(): UseTmdbSearchResult {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const validationPromiseRef = useRef<Promise<boolean> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const ensureApiKeyValid = useCallback(async () => {
    if (apiKeyValid === true) {
      return true;
    }

    if (validationPromiseRef.current) {
      return validationPromiseRef.current;
    }

    const status = getApiKeyStatus();

    if (!status.isConfigured || !status.isValidFormat) {
      setApiKeyValid(false);
      setError(API_KEY_ERROR_MESSAGE);
      return false;
    }

    const promise = validateApiKey()
      .then((isValid) => {
        setApiKeyValid(isValid);

        if (!isValid) {
          setError(API_KEY_ERROR_MESSAGE);
        }

        return isValid;
      })
      .catch((validationError) => {
        console.error('TMDB API key validation error:', validationError);
        setApiKeyValid(false);
        setError(API_KEY_ERROR_MESSAGE);
        return false;
      })
      .finally(() => {
        validationPromiseRef.current = null;
      });

    validationPromiseRef.current = promise;
    return promise;
  }, [apiKeyValid]);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestIdRef.current += 1;
    setMovies([]);
    setError(null);
    setIsLoading(false);
    setHasSearched(false);
  }, []);

  const search = useCallback(
    async (rawQuery: string) => {
      const nextQuery = rawQuery.trim();

      if (!nextQuery) {
        reset();
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const currentRequestId = requestIdRef.current + 1;
      requestIdRef.current = currentRequestId;

      setHasSearched(true);
      setIsLoading(true);
      setError(null);

      const keyIsValid = await ensureApiKeyValid();

      if (!keyIsValid) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await tmdbClient.searchMovies(nextQuery, 1, { signal: controller.signal });

        if (requestIdRef.current !== currentRequestId) {
          return;
        }

        setMovies(response.results);
      } catch (searchError) {
        if (searchError instanceof DOMException && searchError.name === ABORT_ERROR_NAME) {
          return;
        }

        console.error('TMDB search request error:', searchError);

        if (requestIdRef.current !== currentRequestId) {
          return;
        }

        setMovies([]);
        setError(searchError instanceof Error ? searchError.message : SEARCH_ERROR_MESSAGE);
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    },
    [ensureApiKeyValid, reset]
  );

  const resultError = useMemo(() => {
    if (apiKeyValid === false) {
      return API_KEY_ERROR_MESSAGE;
    }

    return error;
  }, [apiKeyValid, error]);

  return {
    movies,
    isLoading,
    error: resultError,
    apiKeyValid,
    hasSearched,
    search,
    reset
  };
}

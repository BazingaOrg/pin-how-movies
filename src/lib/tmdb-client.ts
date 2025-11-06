// TMDB API client helpers. Configure the following environment variables in `.env.local`:
// NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

interface TMDBImage {
  file_path: string;
  iso_639_1: string | null;
  width: number;
  height: number;
  aspect_ratio: number;
  vote_average?: number;
}

interface TMDBImageResponse {
  posters: TMDBImage[];
  backdrops: TMDBImage[];
}

interface TMDBRequestOptions {
  signal?: AbortSignal;
}

type UrlParams = Record<string, string | number | boolean | undefined | null>;

class TMDBClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly imageBaseUrl: string;
  private readonly posterCache: Map<number, string | null>;
  private readonly isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
    this.imageBaseUrl = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';
    this.posterCache = new Map();
  }

  getImageUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) {
      return null;
    }

    return `${this.imageBaseUrl}/${size}${path}`;
  }

  async getPreferredPoster(movieId: number, options?: TMDBRequestOptions): Promise<string | null> {
    if (!this.apiKey || !this.isClient) {
      return null;
    }

    if (this.posterCache.has(movieId)) {
      return this.posterCache.get(movieId) ?? null;
    }

    try {
      const data = await this.requestJson<TMDBImageResponse>(
        `/movie/${movieId}/images`,
        { include_image_language: 'en,null' },
        options
      );
      const posters = data.posters || [];

      const sorted = [...posters].sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
      const preferred = sorted.find((poster) => poster.iso_639_1 === null || poster.iso_639_1 === 'en');
      const fallback = sorted[0];

      const filePath = preferred?.file_path || fallback?.file_path || null;
      this.posterCache.set(movieId, filePath || null);
      return filePath || null;
    } catch (error) {
      if (this.isAbortError(error)) {
        return null;
      }

      console.error('TMDB preferred poster error:', error);
      this.posterCache.set(movieId, null);
      return null;
    }
  }

  async searchMovies(query: string, page: number = 1, options?: TMDBRequestOptions): Promise<TMDBSearchResponse> {
    if (!this.isClient) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };
    }

    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };
    }

    try {
      return await this.requestJson<TMDBSearchResponse>(
        '/search/movie',
        {
          query: query.trim(),
          page,
          language: 'zh-CN',
          include_adult: 'false'
        },
        options
      );
    } catch (error) {
      console.error('TMDB search error:', error);
      throw error;
    }
  }

  async searchPerson(query: string, page: number = 1, options?: TMDBRequestOptions) {
    if (!query.trim()) {
      return {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };
    }

    try {
      return await this.requestJson(
        '/search/person',
        {
          query: query.trim(),
          page,
          language: 'zh-CN',
          include_adult: 'false'
        },
        options
      );
    } catch (error) {
      console.error('TMDB person search error:', error);
      throw error;
    }
  }

  async getMovieDetails(movieId: number, options?: TMDBRequestOptions) {
    try {
      return await this.requestJson(
        `/movie/${movieId}`,
        { language: 'zh-CN' },
        options
      );
    } catch (error) {
      console.error('TMDB movie details error:', error);
      throw error;
    }
  }

  private createUrl(path: string, params: UrlParams = {}): URL {
    const normalizedPath = path.replace(/^\/+/, '');
    const url = new URL(normalizedPath, `${this.baseUrl}/`);
    url.searchParams.set('api_key', this.ensureApiKey());

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      url.searchParams.set(key, String(value));
    });

    return url;
  }

  private ensureApiKey(): string {
    if (!this.apiKey) {
      throw new Error('TMDB API key is not configured');
    }

    return this.apiKey;
  }

  private isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
  }

  private async requestJson<T>(
    path: string,
    params: UrlParams,
    options?: TMDBRequestOptions
  ): Promise<T> {
    if (!this.isClient) {
      throw new Error('TMDB requests must be performed on the client.');
    }

    const url = this.createUrl(path, params);
    const response = await fetch(url.toString(), { signal: options?.signal });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}

export async function validateApiKey(apiKey?: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  const keyToTest = apiKey || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!keyToTest) {
    return false;
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/550?api_key=${keyToTest}`
    );

    if (response.ok) {
      const data = await response.json();
      return data.id === 550; // Fight Club 的 ID
    }

    return false;
  } catch (error) {
    console.error('API Key validation error:', error);
    return false;
  }
}

export function getApiKeyStatus(): { isConfigured: boolean; isValidFormat: boolean } {
  if (typeof window === 'undefined') {
    return { isConfigured: false, isValidFormat: false };
  }

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';

  return {
    isConfigured: !!apiKey,
    isValidFormat: apiKey.length >= 32 && !apiKey.startsWith('eyJ')
  };
}

export const tmdbClient = new TMDBClient();

export { TMDBClient };

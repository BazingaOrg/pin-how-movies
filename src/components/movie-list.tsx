"use client";

import { TMDBMovie, tmdbClient } from "@/lib/tmdb-client";
import { messages } from "@/lib/messages";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";

interface MovieListProps {
  movies: TMDBMovie[];
  isLoading: boolean;
  error: string | null;
  apiKeyValid?: boolean | null;
}

export function MovieList({ movies, isLoading, error, apiKeyValid }: MovieListProps) {
  if (apiKeyValid === false) {
    return (
      <MovieListError>
        <p className="error-message">{messages.apiKeyInvalid}</p>
        <p className="error-hint">
          {messages.apiKeyHelp} 请在 <code>.env.local</code> 中更新 <code>NEXT_PUBLIC_TMDB_API_KEY</code>。
        </p>
        <p className="error-hint">
          参考：<a href="/TMDB_SETUP.md" target="_blank" className="error-link">{messages.tmdbGuideLabel}</a>
        </p>
      </MovieListError>
    );
  }

  if (error) {
    return (
      <MovieListError>
        <p className="error-message">{error}</p>
      </MovieListError>
    );
  }

  if (isLoading) {
    return (
      <MovieListSkeleton count={3} />
    );
  }

  if (movies.length === 0) {
    return <MovieListEmpty />;
  }

  return (
    <section className="movies-grid">
      {movies.map((movie) => (
        <MovieItem key={movie.id} movie={movie} />
      ))}
    </section>
  );
}

interface MovieItemProps {
  movie: TMDBMovie;
}

function MovieItem({ movie }: MovieItemProps) {
  const fallbackPosterUrl = getFallbackPosterUrl(movie);
  const [posterUrl, setPosterUrl] = useState<string | null>(fallbackPosterUrl);
  const backdropUrl = tmdbClient.getImageUrl(movie.backdrop_path, 'w1280');
  const releaseDateDisplay = formatReleaseDate(movie.release_date);

  const movieId = `movie-${movie.id}`;

  useEffect(() => {
    setPosterUrl(fallbackPosterUrl);
  }, [fallbackPosterUrl]);

  useEffect(() => {
    const controller = new AbortController();

    const loadPreferredPoster = async () => {
      const preferredPath = await tmdbClient.getPreferredPoster(movie.id, {
        signal: controller.signal
      });

      if (!preferredPath) {
        return;
      }

      const preferredUrl = tmdbClient.getImageUrl(preferredPath, 'w500');

      if (preferredUrl) {
        setPosterUrl(preferredUrl);
      }
    };

    loadPreferredPoster();

    return () => {
      controller.abort();
    };
  }, [movie.id]);

  return (
    <div
      className={`movie_card ${movieId}`}
    >
      <div className="info_section">
        <div className="movie_header">
          {posterUrl && (
            <div className="poster-frame">
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                className="locandina"
                loading="lazy"
                sizes="(max-width: 640px) 120px, (max-width: 1024px) 140px, 160px"
              />
            </div>
          )}

          <div className="movie_header-content">
            <div className="movie_title-group">
              <h1>{movie.title}</h1>

              {releaseDateDisplay && (
                <h4>{releaseDateDisplay}</h4>
              )}
            </div>

            <div className="movie_meta">
              <span className="minutes">评分：{movie.vote_average.toFixed(1)}/10</span>
              <span className="type">电影</span>
            </div>
          </div>
        </div>

        <div className="movie_desc">
          <p className="text">
            {movie.overview || messages.noOverview}
          </p>
        </div>
      </div>

      <div
        className="blur_back"
        style={backdropUrl ? { backgroundImage: `url(${backdropUrl})` } : undefined}
      />
    </div>
  );
}

function MovieListError({ children }: { children: ReactNode }) {
  return (
    <section className="movie-list-error" role="alert">
      <AlertCircle className="error-icon" />
      {children}
    </section>
  );
}

function MovieListSkeleton({ count }: { count?: number }) {
  const skeletonItems = useMemo(() => Array.from({ length: count ?? 3 }, (_, index) => index), [count]);

  return (
    <section aria-busy="true" aria-live="polite" className="movies-grid movie-skeletons" role="status">
      {skeletonItems.map((index) => (
        <div className="movie-skeleton-card" key={index}>
          <div className="movie-skeleton-content">
            <div className="movie-skeleton-poster shimmer" />
            <div className="movie-skeleton-text">
              <span className="movie-skeleton-line title shimmer" />
              <span className="movie-skeleton-line subtitle shimmer" />
              <span className="movie-skeleton-line meta shimmer" />
              <span className="movie-skeleton-line meta short shimmer" />
            </div>
          </div>
        </div>
      ))}
      <p className="loading-text">{messages.loadingResults}</p>
    </section>
  );
}

function MovieListEmpty() {
  return (
    <section aria-live="polite" className="movie-list-empty" role="status">
      <div className="empty-icon">🎬</div>
      <p className="empty-text">{messages.noMoviesFound}</p>
      <p className="empty-hint">{messages.tryDifferentKeywords}</p>
    </section>
  );
}

function getFallbackPosterUrl(movie: TMDBMovie): string | null {
  if (movie.poster_path) {
    return tmdbClient.getImageUrl(movie.poster_path, 'w500');
  }

  if (movie.backdrop_path) {
    return tmdbClient.getImageUrl(movie.backdrop_path, 'w780');
  }

  return null;
}

function formatReleaseDate(releaseDate?: string | null): string | null {
  if (!releaseDate) {
    return null;
  }

  const [year, month, day] = releaseDate.split('-');

  if (!year || !month || !day) {
    return null;
  }

  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);

  if (Number.isNaN(numericYear) || Number.isNaN(numericMonth) || Number.isNaN(numericDay)) {
    return null;
  }

  return `${numericYear}-${String(numericMonth).padStart(2, '0')}-${String(numericDay).padStart(2, '0')}`;
}

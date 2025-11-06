"use client";

import { useState, useCallback, useRef } from "react";
import { useTmdbSearch } from "@/hooks/use-tmdb-search";
import { messages } from "@/lib/messages";
import { MovieList } from "./movie-list";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    movies,
    isLoading,
    error,
    apiKeyValid,
    hasSearched,
    search,
    reset
  } = useTmdbSearch();

  const executeSearch = useCallback((rawQuery: string) => {
    const nextQuery = rawQuery.trim();

    if (!nextQuery) {
      reset();
      return;
    }

    void search(nextQuery);
  }, [reset, search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setQuery(nextValue);

    if (!nextValue.trim()) {
      reset();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleToggleSearch = () => {
    if (isInputExpanded) {
      setIsInputExpanded(false);
      inputRef.current?.blur();
      return;
    }

    setIsInputExpanded(true);
    inputRef.current?.focus();
  };

  const shouldShowResults = hasSearched || isLoading || error || apiKeyValid === false;
  const shellClassName = `search-shell${isInputExpanded ? " search-shell-expanded" : ""}`;

  const showPlaceholder = !shouldShowResults;

  return (
    <section className="search-area">
      <form className={shellClassName} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder={messages.searchPlaceholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsInputExpanded(true)}
        />
        <button aria-label={isInputExpanded ? "Collapse search" : "Expand search"} className="search" onClick={handleToggleSearch} type="button" />
      </form>

      {showPlaceholder && <SearchPlaceholder />}

      {shouldShowResults && (
        <MovieList
          movies={movies}
          isLoading={isLoading}
          error={error}
          apiKeyValid={apiKeyValid}
        />
      )}
    </section>
  );
}

function SearchPlaceholder() {
  const lines = messages.placeholderLines;

  return (
    <div className="search-placeholder" role="presentation">
      <div className="search-placeholder__frame">
        <div aria-hidden className="search-placeholder__noise" />
        <div aria-hidden className="search-placeholder__vignette" />
        <div className="search-placeholder__content">
          <h2 className="search-placeholder__title">
            {lines.map((line, index) => {
              const isFirst = index === 0;
              const isLast = index === lines.length - 1;
              const text = `${isFirst ? '「' : ''}${line}${isLast ? '」' : ''}`;

              return (
                <span
                  className={`search-placeholder__line search-placeholder__line--indent-${index}`}
                  key={line}
                >
                  {text}
                </span>
              );
            })}
          </h2>
          <p className="search-placeholder__hint">{messages.placeholderHint}</p>
        </div>
      </div>
    </div>
  );
}

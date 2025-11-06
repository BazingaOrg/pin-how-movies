"use client";

import { useState, useCallback, useRef } from "react";
import { useTmdbSearch } from "@/hooks/use-tmdb-search";
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

  const handleSearch = useCallback((searchQuery: string) => {
    void search(searchQuery);
  }, [search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setQuery(nextValue);

    if (!nextValue.trim()) {
      reset();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
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

  return (
    <section className="search-area">
      <form className={shellClassName} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索电影、演员、导演..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsInputExpanded(true)}
        />
        <button aria-label={isInputExpanded ? "Collapse search" : "Expand search"} className="search" onClick={handleToggleSearch} type="button" />
      </form>

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

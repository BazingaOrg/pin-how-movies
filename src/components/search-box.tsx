"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { CornerDownLeft } from "lucide-react";
import { useTmdbSearch } from "@/hooks/use-tmdb-search";
import { messages } from "@/lib/messages";

// 懒加载MovieList组件，只有在需要显示结果时才加载
const MovieList = dynamic(() => import("./movie-list").then(mod => ({ default: mod.MovieList })), {
  loading: () => (
    <div className="movies-grid">
      {/* 骨架屏加载状态 */}
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="movie-card skeleton-item">
          <div className="blur_back skeleton" />
          <div className="movie-info">
            <div className="movie-title skeleton-text" />
            <div className="movie-overview skeleton-text short" />
            <div className="movie-meta">
              <div className="movie-rating skeleton-text" />
              <div className="movie-year skeleton-text" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
  ssr: false // 客户端组件，不进行服务端渲染
});

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

  // 渲染带图标的文本
  const renderTextWithIcon = (text: string) => {
    if (text.includes('回车')) {
      const parts = text.split('回车');
      return (
        <>
          {parts[0]}
          <CornerDownLeft
            size={32}
            className="inline-block mx-1 text-white/80"
            aria-label="回车键"
          />
          {parts[1]}
        </>
      );
    }
    return text;
  };

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
              const processedLine = renderTextWithIcon(line);

              return (
                <span
                  className={`search-placeholder__line search-placeholder__line--indent-${index}`}
                  key={line}
                >
                  {isFirst && '「'}
                  {processedLine}
                  {isLast && '」'}
                </span>
              );
            })}
          </h2>
        </div>
      </div>
    </div>
  );
}

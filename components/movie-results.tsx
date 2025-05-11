"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MoviePoster } from "@/components/movie-poster"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Movie } from "@/lib/types"

export function MovieResults() {
  const searchParams = useSearchParams()
  const titles = searchParams.get("titles")

  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMovies() {
      if (!titles) return

      setLoading(true)
      setError(null)

      try {
        const movieTitles = titles
          .split(",")
          .map((title) => title.trim())
          .filter(Boolean)

        // Call our API route
        const response = await fetch(`/api/movies?titles=${encodeURIComponent(titles)}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const results = await response.json()
        setMovies(results)
      } catch (err) {
        console.error("Error fetching movies:", err)
        setError("获取电影海报失败。请重试。")
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [titles])

  if (!titles) {
    return null
  }

  if (loading) {
    return (
      <div className="poster-wall-container">
        <div className="poster-wall">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="poster-skeleton"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                zIndex: 10 - i,
              }}
            >
              <Skeleton className="w-full h-full rounded-lg bg-netflix-dark-gray" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-netflix-dark-gray border-netflix-red">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>错误</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (movies.length === 0 && !loading) {
    return (
      <Alert className="bg-netflix-dark-gray border-netflix-light-gray">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>未找到结果</AlertTitle>
        <AlertDescription>我们找不到与您搜索匹配的电影。请尝试不同的标题。</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="poster-wall-container">
      <div className="poster-wall">
        {movies.map((movie, index) => (
          <MoviePoster key={movie.id} movie={movie} index={index} totalCount={movies.length} />
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { MoviePoster } from '@/components/movie-poster'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { Movie } from '@/lib/types'
import { PrintPostersButton } from '@/components/print-posters-button'
import { PosterPreview } from '@/components/poster-preview-dialog'

interface MovieResultsProps {
    movies: Movie[]
    loading: boolean
    error: string | null
    hasSearched?: boolean
}

export function MovieResults({
    movies,
    loading,
    error,
    hasSearched,
}: MovieResultsProps) {
    const [previewOpen, setPreviewOpen] = useState(false)
    const [currentMovie, setCurrentMovie] = useState<Movie | null>(null)

    const handlePosterClick = useCallback((movie: Movie) => {
        setCurrentMovie(movie)
        setPreviewOpen(true)
    }, [])

    const handleNavigate = useCallback(
        (direction: 'prev' | 'next') => {
            if (!currentMovie) return

            const currentIndex = movies.findIndex(
                (m) => m.id === currentMovie.id
            )
            if (direction === 'prev' && currentIndex > 0) {
                setCurrentMovie(movies[currentIndex - 1])
            } else if (
                direction === 'next' &&
                currentIndex < movies.length - 1
            ) {
                setCurrentMovie(movies[currentIndex + 1])
            }
        },
        [currentMovie, movies]
    )

    if (loading) {
        const movieCount = Math.min(12, movies.length > 0 ? movies.length : 1)

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-netflix-dark-gray/50">
                        <div className="w-5 h-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-300">
                            正在获取电影海报...
                        </span>
                    </div>
                </div>
                <div className="poster-wall-container">
                    <div className="poster-wall">
                        {Array.from({ length: movieCount }).map((_, i) => (
                            <div
                                key={i}
                                className="poster-skeleton animate-pulse"
                            >
                                <Skeleton className="w-full h-full rounded-lg bg-netflix-dark-gray/50" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Alert
                variant="destructive"
                className="bg-netflix-dark-gray border-netflix-red"
            >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (movies.length === 0 && hasSearched) {
        return (
            <Alert className="bg-netflix-dark-gray border-netflix-light-gray text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-white">未找到结果</AlertTitle>
                <AlertDescription className="text-gray-300">
                    我们找不到与您搜索匹配的电影。请尝试不同的标题。
                </AlertDescription>
            </Alert>
        )
    }

    if (movies.length === 0) {
        return null
    }

    return (
        <>
            <div className="poster-wall-container">
                <div className="poster-wall">
                    {movies.map((movie, index) => (
                        <MoviePoster
                            key={movie.id}
                            movie={movie}
                            index={index}
                            totalCount={movies.length}
                            onPosterClick={handlePosterClick}
                        />
                    ))}
                </div>
            </div>
            <PrintPostersButton
                posters={movies.map(movie => ({
                    id: movie.id,
                    posterPath: movie.poster_path
                }))}
            />
            <PosterPreview
                visible={previewOpen}
                onVisibleChange={setPreviewOpen}
                currentMovie={currentMovie}
                movies={movies}
                onNavigate={handleNavigate}
            />
        </>
    )
}

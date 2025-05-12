'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { Movie } from '@/lib/types'
import { motion } from 'framer-motion'

export function MoviePoster({
    movie,
    index,
    totalCount,
    onPosterClick,
}: {
    movie: Movie
    index: number
    totalCount: number
    onPosterClick: (movie: Movie) => void
}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const posterRef = useRef<HTMLDivElement>(null)

    const posterUrl = movie.best_poster_path
        ? movie.best_poster_path.thumbnail
        : movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '/placeholder.svg?height=750&width=500'

    return (
        <motion.div
            ref={posterRef}
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                scale: 1,
                zIndex: 1,
            }}
            transition={{
                duration: 0.3,
                type: 'spring',
                stiffness: 100,
            }}
            className="poster-item"
            onClick={() => onPosterClick(movie)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onPosterClick(movie)
                }
            }}
        >
            <div className={`poster-card`}>
                <div className="poster-image">
                    <Image
                        src={posterUrl || '/placeholder.svg'}
                        alt={movie.title}
                        fill
                        priority={index === 0}
                        className={`object-cover transition-all duration-500 ${isLoaded ? 'scale-100 blur-0' : 'scale-110 blur-sm'
                            }`}
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>
            </div>
        </motion.div>
    )
}

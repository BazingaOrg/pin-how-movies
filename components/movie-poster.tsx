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
    onNavigate,
}: {
    movie: Movie
    index: number
    totalCount: number
    onPosterClick: (movie: Movie) => void
    onNavigate: (direction: 'prev' | 'next') => void
}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const posterRef = useRef<HTMLDivElement>(null)

    const posterUrl = movie.best_poster_path
        ? movie.best_poster_path.thumbnail
        : movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/placeholder.svg?height=750&width=500'

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStart) return

        const currentTouch = e.touches[0].clientX
        const diff = touchStart - currentTouch

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                onNavigate('next')
            } else {
                onNavigate('prev')
            }
            setTouchStart(null)
        }
    }

    const handleTouchEnd = () => {
        setTouchStart(null)
    }

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
            className="relative flex h-full w-full items-center justify-center p-4 md:p-6"
            onClick={() => onPosterClick(movie)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onPosterClick(movie)
                }
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* 毛玻璃背景 */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/30" />

            <div className="relative z-10 w-full max-w-5xl mx-auto">
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
                    <Image
                        src={posterUrl || '/placeholder.svg'}
                        alt={movie.title}
                        fill
                        priority={index === 0}
                        className={`object-cover transition-all duration-500 ${
                            isLoaded ? 'scale-100 blur-0' : 'scale-110 blur-sm'
                        }`}
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>
            </div>
        </motion.div>
    )
}

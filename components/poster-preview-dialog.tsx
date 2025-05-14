'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { Movie } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PosterPreviewProps {
    visible: boolean
    onVisibleChange: (visible: boolean) => void
    currentMovie: Movie | null
    movies: Movie[]
    onNavigate: (direction: 'prev' | 'next') => void
}

export function PosterPreview({
    visible,
    onVisibleChange,
    currentMovie,
    movies,
    onNavigate,
}: PosterPreviewProps) {
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // 最小滑动距离
    const minSwipeDistance = 50

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe && hasNext) {
            onNavigate('next')
        } else if (isRightSwipe && hasPrev) {
            onNavigate('prev')
        }

        setTouchStart(null)
        setTouchEnd(null)
    }

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                onNavigate('prev')
            } else if (e.key === 'ArrowRight') {
                onNavigate('next')
            } else if (e.key === 'Escape') {
                onVisibleChange(false)
            }
        },
        [onNavigate, onVisibleChange]
    )

    useEffect(() => {
        if (visible) {
            window.addEventListener('keydown', handleKeyDown)
            return () => window.removeEventListener('keydown', handleKeyDown)
        }
    }, [visible, handleKeyDown])

    if (!currentMovie || !visible) return null

    const currentIndex = movies.findIndex((m) => m.id === currentMovie.id)
    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < movies.length - 1

    const posterUrl = currentMovie.best_poster_path
        ? currentMovie.best_poster_path.full
        : currentMovie.poster_path
        ? `https://image.tmdb.org/t/p/original${currentMovie.poster_path}`
        : '/placeholder.svg'

    // 格式化上映日期
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    // 格式化时长
    const formatRuntime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return `${hours}小时${remainingMinutes}分钟`
    }

    // 处理点击事件
    const handleBackdropClick = (e: React.MouseEvent) => {
        // 确保点击的是背景层而不是内容
        if (e.target === e.currentTarget) {
            onVisibleChange(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60"
            onClick={handleBackdropClick}
        >
            <div className="relative w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] h-[90vh] flex flex-col">
                <h1 className="sr-only">{currentMovie.title} 电影海报</h1>
                <p className="sr-only">
                    {currentMovie.title}{' '}
                    的电影海报预览。使用左右箭头键或滑动屏幕可以浏览其他电影海报。
                </p>

                {/* 电影信息区域 */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMovie.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4 sm:mb-6 text-center space-y-2"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-white text-shadow-lg">
                            {currentMovie.title}
                        </h2>
                        <div className="flex items-center justify-center gap-4 text-gray-300">
                            {currentMovie.release_date && (
                                <span>
                                    {formatDate(currentMovie.release_date)}
                                </span>
                            )}
                            {currentMovie.runtime > 0 && (
                                <span>
                                    {formatRuntime(currentMovie.runtime)}
                                </span>
                            )}
                            <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                <span>
                                    {currentMovie.vote_average.toFixed(1)}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {currentMovie.genres.map((genre) => (
                                <span
                                    key={genre.id}
                                    className="px-2 py-1 bg-white/10 rounded-full text-sm"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                        <div className="text-sm text-gray-300 space-y-1">
                            {currentMovie.directors.length > 0 && (
                                <p>
                                    导演：
                                    {currentMovie.directors
                                        .map((d) => d.name)
                                        .join('、')}
                                </p>
                            )}
                            {currentMovie.writers.length > 0 && (
                                <p>
                                    编剧：
                                    {currentMovie.writers
                                        .map((w) => w.name)
                                        .join('、')}
                                </p>
                            )}
                            {currentMovie.cast.length > 0 && (
                                <p>
                                    主演：
                                    {currentMovie.cast
                                        .map((c) => c.name)
                                        .join('、')}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div
                    className="relative flex-1 min-h-0 flex items-center justify-center"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* 左箭头 - 在移动端隐藏 */}
                    {hasPrev && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden sm:block absolute left-0 sm:left-4 md:left-8 z-50 -translate-x-full sm:translate-x-0"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onNavigate('prev')}
                                className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
                            >
                                <ChevronLeft className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
                            </Button>
                        </motion.div>
                    )}

                    {/* 海报图片 */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentMovie.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-auto h-[calc(100%-2rem)] max-w-full max-h-full flex items-center justify-center px-4 sm:px-20 md:px-28"
                        >
                            <Image
                                src={posterUrl}
                                alt={currentMovie.title}
                                width={780}
                                height={1170}
                                className="object-contain w-auto h-full rounded-lg shadow-2xl"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* 右箭头 - 在移动端隐藏 */}
                    {hasNext && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden sm:block absolute right-0 sm:right-4 md:right-8 z-50 translate-x-full sm:translate-x-0"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onNavigate('next')}
                                className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
                            >
                                <ChevronRight className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}

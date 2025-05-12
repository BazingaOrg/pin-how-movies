'use client'

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Movie } from '@/lib/types'
import { useCallback, useEffect } from 'react'

interface PosterPreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentMovie: Movie | null
    movies: Movie[]
    onNavigate: (direction: 'prev' | 'next') => void
}

export function PosterPreviewDialog({
    open,
    onOpenChange,
    currentMovie,
    movies,
    onNavigate,
}: PosterPreviewDialogProps) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            onNavigate('prev')
        } else if (e.key === 'ArrowRight') {
            onNavigate('next')
        } else if (e.key === 'Escape') {
            onOpenChange(false)
        }
    }, [onNavigate, onOpenChange])

    useEffect(() => {
        if (open) {
            window.addEventListener('keydown', handleKeyDown)
            return () => window.removeEventListener('keydown', handleKeyDown)
        }
    }, [open, handleKeyDown])

    if (!currentMovie) return null

    const currentIndex = movies.findIndex(m => m.id === currentMovie.id)
    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < movies.length - 1

    const posterUrl = currentMovie.best_poster_path
        ? currentMovie.best_poster_path.full
        : currentMovie.poster_path
            ? `https://image.tmdb.org/t/p/original${currentMovie.poster_path}`
            : '/placeholder.svg'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] flex flex-col p-0 gap-0 bg-zinc-900">
                <DialogTitle className="sr-only">
                    {currentMovie.title} 电影海报
                </DialogTitle>
                <DialogDescription className="sr-only">
                    {currentMovie.title} 的电影海报预览。使用左右箭头键或点击按钮可以浏览其他电影海报。
                </DialogDescription>

                <div className="relative flex-1 min-h-0 flex items-center justify-center">

                    {/* 左箭头 */}
                    {hasPrev && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onNavigate('prev')}
                            className="absolute left-4 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </Button>
                    )}

                    {/* 海报图片 */}
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                        <div className="relative w-auto h-full max-w-full max-h-full">
                            <Image
                                src={posterUrl}
                                alt={currentMovie.title}
                                width={780}
                                height={1170}
                                className="object-contain w-auto h-full"
                                priority
                            />
                        </div>
                    </div>

                    {/* 右箭头 */}
                    {hasNext && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onNavigate('next')}
                            className="absolute right-4 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </Button>
                    )}
                </div>

                {/* 电影标题 */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h2 className="text-xl font-semibold text-white">
                        {currentMovie.title}
                    </h2>
                    <p className="text-sm text-gray-300 mt-1">
                        {currentMovie.release_date?.split('-')[0]}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
} 
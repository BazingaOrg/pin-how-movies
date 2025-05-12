'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import type { Movie } from '@/lib/types'
import { useCallback, useState } from 'react'
import { PrintPreviewDialog } from './print-preview-dialog'

interface PrintPostersButtonProps {
    movies: Movie[]
}

export function PrintPostersButton({ movies }: PrintPostersButtonProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const generatePrintImage = useCallback(async () => {
        // A4尺寸（以像素为单位，300dpi）
        const A4_WIDTH = 2480 // 210mm * 300dpi / 25.4
        const A4_HEIGHT = 3508 // 297mm * 300dpi / 25.4

        // 创建canvas
        const canvas = document.createElement('canvas')
        canvas.width = A4_WIDTH
        canvas.height = A4_HEIGHT
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        // 设置白色背景
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT)

        // 页面设计参数
        const MARGIN_TOP = 200 // 顶部留白更大，用于可能的标题
        const MARGIN_BOTTOM = 150
        const MARGIN_SIDE = 150
        const SPACING_X = 100 // 海报之间的水平间距
        const SPACING_Y = 120 // 海报之间的垂直间距增加，显得更加舒适
        const POSTERS_PER_ROW = 3

        // 绘制标题
        ctx.fillStyle = '#1a1a1a'
        ctx.font =
            'bold 60px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('电影海报收藏', A4_WIDTH / 2, 120)

        // 计算海报尺寸（保持2:3的宽高比）
        const posterWidth =
            (A4_WIDTH - 2 * MARGIN_SIDE - (POSTERS_PER_ROW - 1) * SPACING_X) /
            POSTERS_PER_ROW
        const posterHeight = posterWidth * 1.5

        // 计算每列可以放置的海报数量
        const POSTERS_PER_COLUMN = Math.floor(
            (A4_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM) /
            (posterHeight + SPACING_Y)
        )

        try {
            // 加载所有图片
            const loadImage = (url: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image()
                    img.onload = () => resolve(img)
                    img.onerror = reject
                    img.src = `/api/image-proxy?url=${encodeURIComponent(url)}`
                })
            }

            // 并行加载所有图片
            const images = await Promise.all(
                movies.map((movie) => {
                    const posterUrl = movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : '/placeholder.svg'
                    return loadImage(posterUrl)
                })
            )

            // 绘制海报
            images.forEach((img, index) => {
                const row = Math.floor(index / POSTERS_PER_ROW)
                const col = index % POSTERS_PER_ROW

                // 如果超出一页A4的容量，就不继续绘制
                if (row >= POSTERS_PER_COLUMN) return

                const x = MARGIN_SIDE + col * (posterWidth + SPACING_X)
                const y = MARGIN_TOP + row * (posterHeight + SPACING_Y)

                // 绘制海报阴影
                ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
                ctx.shadowBlur = 15
                ctx.shadowOffsetX = 0
                ctx.shadowOffsetY = 5

                // 绘制海报
                ctx.fillStyle = 'white'
                ctx.fillRect(x, y, posterWidth, posterHeight) // 白色背景
                ctx.drawImage(img, x, y, posterWidth, posterHeight)

                // 重置阴影
                ctx.shadowColor = 'transparent'
                ctx.shadowBlur = 0
                ctx.shadowOffsetX = 0
                ctx.shadowOffsetY = 0
            })

            // 添加页脚
            const footerY = A4_HEIGHT - 80
            ctx.fillStyle = '#666666'
            ctx.font =
                '40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(
                `共 ${Math.min(
                    images.length,
                    POSTERS_PER_ROW * POSTERS_PER_COLUMN
                )} 部电影`,
                A4_WIDTH / 2,
                footerY
            )

            return canvas.toDataURL('image/png')
        } catch (error) {
            console.error('生成打印图片时出错:', error)
            alert('生成打印图片时出错，请重试')
            return null
        }
    }, [movies])

    const handlePrintClick = useCallback(async () => {
        const imageUrl = await generatePrintImage()
        if (imageUrl) {
            setPreviewUrl(imageUrl)
            setDialogOpen(true)
        }
    }, [generatePrintImage])

    const handleConfirmDownload = useCallback(() => {
        if (!previewUrl) return

        const link = document.createElement('a')
        link.download = '电影海报收藏.png'
        link.href = previewUrl
        link.click()
        setDialogOpen(false)
    }, [previewUrl])

    if (movies.length === 0) return null

    return (
        <>
            <Button
                onClick={handlePrintClick}
                className="fixed bottom-8 right-8 bg-netflix-red hover:bg-netflix-red/90"
            >
                <Printer className="mr-2 h-4 w-4" />
                生成打印图
            </Button>
            <PrintPreviewDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                previewUrl={previewUrl}
                onConfirm={handleConfirmDownload}
                totalPosters={movies.length}
            />
        </>
    )
}

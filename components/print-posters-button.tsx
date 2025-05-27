'use client'

import { useState } from 'react'
import { PrintPreviewDialog } from './print-preview-dialog'
import { Loader2 } from 'lucide-react'

interface PrintPostersButtonProps {
    posters?: {
        id: number
        posterPath: string
    }[]
}

export function PrintPostersButton({ posters = [] }: PrintPostersButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [showPreview, setShowPreview] = useState(false)

    const handleGenerate = async () => {
        if (isGenerating || !posters.length) return
        setIsGenerating(true)

        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('无法创建 canvas 上下文')

            // 计算画布大小
            const POSTER_WIDTH = 500
            const POSTER_HEIGHT = 750
            const COLUMNS = Math.min(5, Math.ceil(Math.sqrt(posters.length)))
            const ROWS = Math.ceil(posters.length / COLUMNS)

            canvas.width = POSTER_WIDTH * COLUMNS
            canvas.height = POSTER_HEIGHT * ROWS

            // 绘制海报
            for (let i = 0; i < posters.length; i++) {
                const poster = posters[i]
                const row = Math.floor(i / COLUMNS)
                const col = i % COLUMNS

                const img = new Image()
                img.crossOrigin = 'anonymous'
                img.src = `https://image.tmdb.org/t/p/original${poster.posterPath}`

                await new Promise((resolve, reject) => {
                    img.onload = resolve
                    img.onerror = reject
                })

                ctx.drawImage(
                    img,
                    col * POSTER_WIDTH,
                    row * POSTER_HEIGHT,
                    POSTER_WIDTH,
                    POSTER_HEIGHT
                )
            }

            // 转换为 base64
            const dataUrl = canvas.toDataURL('image/png')
            setPreviewUrl(dataUrl)
            setShowPreview(true)
        } catch (error) {
            console.error('生成海报失败:', error)
            alert('生成海报失败，请重试')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        if (!previewUrl) return

        const link = document.createElement('a')
        link.href = previewUrl
        link.download = '电影海报合集.png'
        link.click()
    }

    return (
        <>
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`vision-button ${isGenerating ? 'opacity-70' : ''} float fixed bottom-8 right-8`}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        生成中...
                    </>
                ) : (
                    '生成海报合集'
                )}
            </button>

            <PrintPreviewDialog
                open={showPreview}
                onOpenChange={setShowPreview}
                previewUrl={previewUrl}
                onConfirm={handleDownload}
                totalPosters={posters.length}
            />
        </>
    )
}

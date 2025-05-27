'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X, ZoomIn, ZoomOut, Share2 } from 'lucide-react'
import { useState } from 'react'

interface PrintPreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    previewUrl: string | null
    onConfirm: () => void
    totalPosters: number
}

export function PrintPreviewDialog({
    open,
    onOpenChange,
    previewUrl,
    onConfirm,
    totalPosters,
}: PrintPreviewDialogProps) {
    const [zoom, setZoom] = useState(false)

    if (!previewUrl) return null

    const handleShare = async () => {
        try {
            // 将 base64 图片转换为 Blob
            const response = await fetch(previewUrl)
            const blob = await response.blob()

            // 创建文件对象
            const file = new File([blob], '电影海报合集.png', { type: 'image/png' })

            // 使用 Web Share API 分享
            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: '电影海报合集',
                })
            } else {
                // 如果不支持 Web Share API，复制图片到剪贴板
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': file,
                    }),
                ])
                alert('图片已复制到剪贴板')
            }
        } catch (error) {
            console.error('分享失败:', error)
            alert('分享失败，请尝试使用下载按钮')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="vision-dialog-content">
                <DialogHeader className="relative px-8 py-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <DialogTitle className="text-2xl font-medium text-white/90">
                                海报合集预览
                            </DialogTitle>
                            <DialogDescription className="text-base text-white/60 mt-0 hidden sm:block">
                                共 {totalPosters} 张海报
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setZoom(!zoom)}
                                className="vision-icon-button"
                                title={zoom ? "缩小" : "放大"}
                            >
                                {zoom ? (
                                    <ZoomOut className="h-5 w-5 text-white/80" />
                                ) : (
                                    <ZoomIn className="h-5 w-5 text-white/80" />
                                )}
                            </button>
                            <button
                                onClick={handleShare}
                                className="vision-icon-button"
                                title="分享"
                            >
                                <Share2 className="h-5 w-5 text-white/80" />
                            </button>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="vision-icon-button"
                                title="关闭"
                            >
                                <X className="h-5 w-5 text-white/80" />
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 min-h-0 relative p-8 overflow-auto bg-black/30">
                    <div className={`relative mx-auto transition-all duration-500 ${zoom ? 'w-auto' : 'w-fit max-w-full'}`}>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />
                        <img
                            src={previewUrl}
                            alt="海报合集预览"
                            className={`w-auto transition-all duration-500 rounded-2xl ${zoom ? 'max-h-none' : 'max-h-[calc(95vh-12rem)]'}`}
                        />
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between px-8 py-6 border-t border-white/10">
                    <div className="flex items-center gap-4">
                        <p className="text-base text-white/60">
                            点击放大按钮可查看完整图片
                        </p>
                        <div className="hidden sm:block h-4 w-px bg-white/20" />
                        <p className="hidden sm:block text-base text-white/60">
                            支持分享或下载
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="vision-button bg-white/5"
                        >
                            关闭
                        </button>
                        <button
                            onClick={onConfirm}
                            className="vision-button bg-white/10"
                        >
                            <Download className="mr-2 h-5 w-5" />
                            下载图片
                        </button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

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
import { Download, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

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
    const [zoom, setZoom] = useState(1)
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
    const imageRef = useRef<HTMLImageElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // 重置缩放
    const resetZoom = () => setZoom(1)

    // 放大
    const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))

    // 缩小
    const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25))

    // 当图片加载完成时获取尺寸
    const handleImageLoad = () => {
        if (imageRef.current) {
            setImageSize({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight
            })
        }
    }

    // 当弹框打开时重置缩放
    useEffect(() => {
        if (open) {
            setZoom(1)
        }
    }, [open])

    // 键盘快捷键支持
    useEffect(() => {
        if (!open) return

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onOpenChange(false)
                    break
                case '=':
                case '+':
                    e.preventDefault()
                    zoomIn()
                    break
                case '-':
                    e.preventDefault()
                    zoomOut()
                    break
                case '0':
                    e.preventDefault()
                    resetZoom()
                    break
                case 'Enter':
                    e.preventDefault()
                    onConfirm()
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onOpenChange, onConfirm])

    // 触摸手势支持（双击缩放）
    const handleDoubleClick = () => {
        if (zoom === 1) {
            setZoom(2)
        } else {
            resetZoom()
        }
    }

    if (!previewUrl) return null

    // 判断是否为长图（高度超过宽度的1.5倍）
    const isLongImage = imageSize.height > imageSize.width * 1.5

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`vision-dialog-content bg-black/80 backdrop-blur-xl border-white/10 max-w-[95vw] w-auto h-[95vh] flex flex-col ${isLongImage ? 'long-image' : ''}`}>
                <DialogHeader className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-medium text-white/90">
                                海报合集预览
                            </DialogTitle>
                            <DialogDescription className="text-sm sm:text-base text-white/60 mt-0 hidden sm:block">
                                共 {totalPosters} 张海报
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* 缩放控制按钮 */}
                            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-full p-1">
                                <button
                                    onClick={zoomOut}
                                    className="vision-icon-button p-1.5"
                                    title="缩小"
                                    disabled={zoom <= 0.25}
                                >
                                    <ZoomOut className="h-4 w-4 text-white/80" />
                                </button>
                                <span className="text-xs text-white/60 px-2 min-w-[3rem] text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    onClick={zoomIn}
                                    className="vision-icon-button p-1.5"
                                    title="放大"
                                    disabled={zoom >= 3}
                                >
                                    <ZoomIn className="h-4 w-4 text-white/80" />
                                </button>
                                <button
                                    onClick={resetZoom}
                                    className="vision-icon-button p-1.5"
                                    title="重置缩放"
                                >
                                    <RotateCcw className="h-4 w-4 text-white/80" />
                                </button>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="vision-icon-button p-2"
                                title="关闭"
                            >
                                <X className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                <div
                    ref={containerRef}
                    className="flex-1 min-h-0 relative overflow-auto bg-black/30 p-2 sm:p-4 lg:p-8"
                    style={{
                        scrollBehavior: 'smooth'
                    }}
                >
                    <div className={`relative mx-auto transition-all duration-300 w-fit ${isLongImage ? 'max-w-full' : 'max-w-full max-h-full flex items-center justify-center'}`}>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none rounded-2xl" />
                        <img
                            ref={imageRef}
                            src={previewUrl}
                            alt="海报合集预览"
                            onLoad={handleImageLoad}
                            onDoubleClick={handleDoubleClick}
                            className={`transition-all duration-300 rounded-xl sm:rounded-2xl shadow-2xl cursor-pointer select-none ${isLongImage
                                ? 'w-full max-w-none'
                                : 'max-w-full max-h-full object-contain'
                                }`}
                            style={{
                                transform: `scale(${zoom})`,
                                transformOrigin: 'center top',
                                minHeight: isLongImage ? 'auto' : '200px'
                            }}
                            draggable={false}
                        />
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-white/10 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                        {/* 移动端缩放控制 */}
                        <div className="flex sm:hidden items-center justify-center gap-1 bg-white/5 rounded-full p-1">
                            <button
                                onClick={zoomOut}
                                className="vision-icon-button p-1.5"
                                title="缩小"
                                disabled={zoom <= 0.25}
                            >
                                <ZoomOut className="h-4 w-4 text-white/80" />
                            </button>
                            <span className="text-xs text-white/60 px-2 min-w-[3rem] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={zoomIn}
                                className="vision-icon-button p-1.5"
                                title="放大"
                                disabled={zoom >= 3}
                            >
                                <ZoomIn className="h-4 w-4 text-white/80" />
                            </button>
                            <button
                                onClick={resetZoom}
                                className="vision-icon-button p-1.5"
                                title="重置缩放"
                            >
                                <RotateCcw className="h-4 w-4 text-white/80" />
                            </button>
                        </div>

                        <div className="flex gap-2 sm:gap-4">
                            <button
                                onClick={() => onOpenChange(false)}
                                className="vision-button bg-white/5 text-white/90 hover:text-white px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                            >
                                关闭
                            </button>
                            <button
                                onClick={onConfirm}
                                className="vision-button bg-white/10 text-white/90 hover:text-white px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
                            >
                                <Download className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                下载图片
                            </button>
                        </div>
                    </div>

                    {/* 快捷键提示 */}
                    <div className="hidden lg:block text-xs text-white/40 mt-2 sm:mt-0">
                        <div className="flex flex-wrap gap-4">
                            <span>双击图片缩放</span>
                            <span>+/- 缩放</span>
                            <span>0 重置</span>
                            <span>ESC 关闭</span>
                            <span>Enter 下载</span>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

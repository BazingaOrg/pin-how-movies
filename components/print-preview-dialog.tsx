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
import Image from 'next/image'
import { Download, X } from 'lucide-react'

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
    if (!previewUrl) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] flex flex-col p-0 gap-0 bg-zinc-100">
                <DialogHeader className="flex items-center justify-between px-6 py-4 border-b bg-white">
                    <div>
                        <DialogTitle className="text-xl font-semibold text-zinc-900">
                            打印预览
                        </DialogTitle>
                        <DialogDescription className="text-sm text-zinc-500 mt-1">
                            共 {totalPosters} 张海报 · A4尺寸 · 300DPI
                        </DialogDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>

                {/* 预览区域 */}
                <div className="flex-1 min-h-0 relative p-8 flex items-center justify-center">
                    <div className="relative w-full max-h-full shadow-2xl rounded-lg overflow-hidden bg-white">
                        <Image
                            src={previewUrl}
                            alt="打印预览"
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 70vw, 60vw"
                        />
                    </div>
                </div>

                {/* 底部操作栏 */}
                <DialogFooter className="flex items-center justify-between px-6 py-4 border-t bg-white">
                    <p className="text-sm text-zinc-500">
                        图片将以PNG格式下载，可直接用于打印
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            取消
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="bg-netflix-red hover:bg-netflix-red/90"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            下载打印图
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
